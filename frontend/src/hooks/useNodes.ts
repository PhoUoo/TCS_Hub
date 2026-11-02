import { useCallback, useMemo } from 'react';
import { useBoardStore } from '../stores/boardStore';
import type { HubNode } from '../types/node';

/** Хук работы с деревом нод (в проде — TanStack Query + REST API /api/nodes) */
export function useNodes() {
  const nodes = useBoardStore((s) => s.nodes);
  const focusNodeId = useBoardStore((s) => s.focusNodeId);
  const childrenOf = useBoardStore((s) => s.childrenOf);
  const getNode = useBoardStore((s) => s.getNode);
  const createNode = useBoardStore((s) => s.createNode);
  const renameNode = useBoardStore((s) => s.renameNode);
  const moveNode = useBoardStore((s) => s.moveNode);
  const deleteNode = useBoardStore((s) => s.deleteNode);
  const setNodePosition = useBoardStore((s) => s.setNodePosition);

  const visibleChildren: HubNode[] = useMemo(() => childrenOf(focusNodeId), [nodes, focusNodeId]); // eslint-disable-line

  const isDescendant = useCallback(
    (nodeId: string, maybeAncestorId: string): boolean => {
      let cur = getNode(nodeId);
      while (cur?.parentId) {
        if (cur.parentId === maybeAncestorId) return true;
        cur = getNode(cur.parentId);
      }
      return false;
    },
    [nodes], // eslint-disable-line
  );

  return {
    nodes,
    focusNodeId,
    visibleChildren,
    getNode,
    createNode,
    renameNode,
    moveNode,
    deleteNode,
    setNodePosition,
    isDescendant,
  };
}
