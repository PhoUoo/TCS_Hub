import { useEffect, useRef, useState } from 'react';
import { useBoardStore } from '../../stores/boardStore';

/**
 * Doc Editor (ТЗ п.2.1, тип Doc Node) — "Word Lite".
 * MVP: contentEditable + execCommand (H2/H3, списки, bold, ссылки).
 * В проде заменяется на TipTap + Yjs для CRDT-синхронизации (Sprint 3–4).
 */
export function DocEditor({ nodeId, readOnly }: { nodeId: string; readOnly: boolean }) {
  const html = useBoardStore((s) => s.docs[nodeId]) ?? '<p></p>';
  const saveDoc = useBoardStore((s) => s.saveDoc);
  const ref = useRef<HTMLDivElement>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // первоначальное заполнение + синхронизация при external-изменениях (polling/Yjs в проде)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== html) ref.current.innerHTML = html;
  }, [html]);

  // debounced auto-save (ТЗ Sprint 3)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onInput = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (ref.current) {
          saveDoc(nodeId, ref.current.innerHTML);
          setSavedAt(new Date().toLocaleTimeString('ru-RU'));
        }
      }, 800);
    };
    const el = ref.current;
    el?.addEventListener('input', onInput);
    return () => {
      el?.removeEventListener('input', onInput);
      clearTimeout(t);
    };
  }, [nodeId, saveDoc]);

  const cmd = (name: string, arg?: string) => {
    document.execCommand(name, false, arg);
    ref.current?.focus();
  };

  return (
    <div className="flex h-full flex-col">
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
          {(
            [
              ['Жирный', () => cmd('bold'), 'B'],
              ['Заголовок', () => cmd('formatBlock', '<h2>'), 'H2'],
              ['Подзаголовок', () => cmd('formatBlock', '<h3>'), 'H3'],
              ['Марк. список', () => cmd('insertUnorderedList'), '• List'],
              ['Нум. список', () => cmd('insertOrderedList'), '1. List'],
              ['Ссылка', () => {
                const url = window.prompt('URL ссылки:', 'https://');
                if (url) cmd('createLink', url);
              }, '🔗'],
              ['Обычный текст', () => cmd('formatBlock', '<p>'), '¶'],
            ] as [string, () => void, string][]
          ).map(([title, fn, label], i) => (
            <button
              key={i}
              title={title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={fn}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium hover:bg-slate-100"
            >
              {label}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-slate-400">
            {savedAt ? `Сохранено в ${savedAt} ✓` : 'Автосохранение'}
          </span>
        </div>
      )}
      <div
        ref={ref}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className="doc-content flex-1 overflow-auto bg-white px-6 py-4 text-[15px] leading-relaxed text-slate-800 outline-none"
      />
    </div>
  );
}
