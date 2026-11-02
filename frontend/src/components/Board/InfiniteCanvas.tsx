import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import { useBoardStore } from '../../stores/boardStore';
import { useNodes } from '../../hooks/useNodes';
import { NodeCard } from '../Nodes/NodeRenderer';
import type { HubNode } from '../../types/node';

/** Кастомная нода React Flow, рендерящая NodeCard */
function HubNodeFlow(props: NodeProps) {
  const data = props.data as {
    hub: HubNode;
    childCount: number;
    readOnly: boolean;
    onEnter: (id: string) => void;
    onOpen: (id: string) => void;
    onRename: (id: string, t: string) => void;
    onDelete: (id: string) => void;
    onPermissions: (id: string) => void;
    onHistory: (id: string) => void;
  };
  return (
    <NodeCard
      node={data.hub}
      childCount={data.childCount}
      selected={!!props.selected}
      readOnly={data.readOnly}
      onEnter={() => data.onEnter(data.hub.id)}
      onOpen={() => data.onOpen(data.hub.id)}
      onRename={(t) => data.onRename(data.hub.id, t)}
      onDelete={() => data.onDelete(data.hub.id)}
      onPermissions={() => data.onPermissions(data.hub.id)}
      onHistory={() => data.onHistory(data.hub.id)}
    />
  );
}

const nodeTypes = { hub: HubNodeFlow };

function Canvas() {
  const rf = useReactFlow();
  const { visibleChildren, focusNodeId, getNode, renameNode, deleteNode, setNodePosition, moveNode, isDescendant } = useNodes();
  const enterNode = useBoardStore((s) => s.enterNode);
  const openEditor = useBoardStore((s) => s.openEditor);
  const openPerms = useBoardStore((s) => s.openPerms);
  const openHistory = useBoardStore((s) => s.openHistory);
  const canWriteFn = useBoardStore((s) => s.canWrite);
  const childrenOf = useBoardStore((s) => s.childrenOf);
  const nodesVersion = useBoardStore((s) => s.nodes.length);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dropTargetRef = useRef<string | null>(null);
  const [dropHint, setDropHint] = useState<{ x: number; y: number; ok: boolean; text: string } | null>(null);

  // "Проваливание" — зум к ноду при смене фокуса (ТЗ п.2.1)
  useEffect(() => {
    const n = getNode(focusNodeId);
    if (!n) return;
    // плавно центрируемся на выбранной нодe или её детях
    const kids = childrenOf(focusNodeId);
    const targets = kids.length ? kids : [n];
    requestAnimationFrame(() => {
      rf.fitView({
        nodes: targets.map((t) => ({ id: t.id })),
        duration: 500,
        minZoom: 0.4,
        maxZoom: 1.3,
        padding: 0.25,
      });
    });
  }, [focusNodeId, nodesVersion]); // eslint-disable-line

  const flowNodes: Node[] = useMemo(
    () =>
      visibleChildren.map((hub) => ({
        id: hub.id,
        type: 'hub',
        position: hub.position,
        data: {
          hub,
          childCount: childrenOf(hub.id).length,
          readOnly: !canWriteFn(hub.id),
          onEnter: enterNode,
          onOpen: openEditor,
          onRename: renameNode,
          onDelete: deleteNode,
          onPermissions: openPerms,
          onHistory: openHistory,
        },
      })),
    [visibleChildren, nodesVersion, focusNodeId], // eslint-disable-line
  );

  const edges = useMemo(
    () =>
      visibleChildren.map((c) => ({
        id: `e-${c.id}`,
        source: c.id,
        target: focusNodeId,
        animated: false,
        style: { stroke: '#cbd5e1', strokeWidth: 1.5 },
      })),
    [visibleChildren, focusNodeId],
  );

  // Drag-and-drop перемещение между родителями: тянем ноду на другую level-ноду
  const onNodeDragOver = useCallback(
    (event: MouseEvent | TouchEvent, node: Node) => {
      const dragging = rf.getNodes().find((n) => n.selected);
      if (!dragging || dragging.id === node.id) return;
      const target = getNode(node.id);
      if (!target || target.type !== 'level') return;
      const ok = !isDescendant(node.id, dragging.id) && dragging.id !== node.id && canWriteFn(dragging.id);
      dropTargetRef.current = ok ? node.id : null;
      const cx = 'clientX' in event ? event.clientX : 0;
      const cy = 'clientY' in event ? event.clientY : 0;
      setDropHint({ x: cx, y: cy, ok, text: ok ? `→ переместить в «${target.title}»` : 'нельзя сюда' });
    },
    [rf, getNode, isDescendant, canWriteFn],
  );

  const onNodeDragStopWithReparent = useCallback(
    (event: MouseEvent | TouchEvent, node: Node) => {
      const targetId = dropTargetRef.current;
      const draggingId = node.id;
      setDropHint(null);
      dropTargetRef.current = null;
      const cx = 'clientX' in event ? event.clientX : 0;
      const cy = 'clientY' in event ? event.clientY : 0;
      if (targetId) {
        const vp = rf.screenToFlowPosition({ x: cx, y: cy });
        const ok = moveNode(draggingId, targetId, { x: Math.round(vp.x), y: Math.round(vp.y) });
        if (!ok) alert('Циклические связи запрещены или нет прав');
        return;
      }
      setNodePosition(node.id, node.position.x, node.position.y);
    },
    [moveNode, setNodePosition, rf],
  );

  // Enter на выбранной ноде → провалиться / открыть (ТЗ п.2.1)
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.isContentEditable || ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'Enter' && selectedId) {
        const n = getNode(selectedId);
        if (!n) return;
        n.type === 'level' ? enterNode(n.id) : openEditor(n.id);
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        useBoardStore.getState().goUp();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selectedId, getNode, enterNode, openEditor]);

  return (
    <>
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, n) => setSelectedId(n.id)}
        onPaneClick={() => setSelectedId(null)}
        onNodeDragStop={onNodeDragStopWithReparent}
        onNodeDrag={(e, node) => onNodeDragOver(e as unknown as React.DragEvent, node)}
        fitView
        minZoom={0.2}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1.6} color="#cbd5e1" />
        <MiniMap
          pannable
          zoomable
          className="!bottom-3 !right-3 !h-24 !w-36 rounded-lg border border-slate-200"
          maskColor="rgba(241,245,249,0.7)"
          nodeColor={( n) => (n.data as { hub?: HubNode })?.hub?.color ?? '#94a3b8'}
        />
      </ReactFlow>
      {dropHint && (
        <div
          className={`pointer-events-none fixed z-50 rounded-md px-2 py-1 text-xs font-semibold text-white shadow ${
            dropHint.ok ? 'bg-emerald-600' : 'bg-red-500'
          }`}
          style={{ left: dropHint.x + 14, top: dropHint.y + 14 }}
        >
          {dropHint.text}
        </div>
      )}
    </>
  );
}

export function InfiniteCanvas() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}
