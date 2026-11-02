import { useState } from 'react';
import { useBoardStore } from '../../stores/boardStore';
import type { TableCell } from '../../types/node';

const PALETTE = ['#ffffff', '#fef9c3', '#dcfce7', '#fee2e2', '#e0e7ff', '#fce7f3', '#e2e8f0'];

/**
 * Table Editor (ТЗ п.2.1, тип Table Node).
 * MVP: редактирование ячеек, строки/столбцы, фон, bold, границы. Без формул.
 * В проде контент синхронизируется через Yjs (см. backend realtime модуль).
 */
export function TableEditor({ nodeId, readOnly }: { nodeId: string; readOnly: boolean }) {
  const table = useBoardStore((s) => s.tables[nodeId]);
  const updateCell = useBoardStore((s) => s.updateTableCell);
  const addRow = useBoardStore((s) => s.addTableRow);
  const addCol = useBoardStore((s) => s.addTableCol);
  const [sel, setSel] = useState<{ r: number; c: number } | null>(null);

  if (!table) return <div className="p-4 text-sm text-slate-500">Таблица не найдена.</div>;

  const cell = (r: number, c: number): TableCell => table.cells[`${r}:${c}`] ?? { value: '' };
  const cur = sel ? cell(sel.r, sel.c) : null;

  return (
    <div className="flex h-full flex-col">
      {/* toolbar форматирования */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs">
          <button
            disabled={!sel}
            onClick={() => sel && updateCell(nodeId, sel.r, sel.c, { bold: !cur?.bold })}
            className={`rounded border px-2 py-1 font-bold ${cur?.bold ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-300 bg-white'}`}
          >
            B
          </button>
          <button
            disabled={!sel}
            onClick={() => sel && updateCell(nodeId, sel.r, sel.c, { border: !(cur?.border ?? true) })}
            className={`rounded border px-2 py-1 ${!(cur?.border ?? true) ? 'border-dashed text-slate-400' : 'border-slate-300 bg-white'}`}
            title="Границы ячейки"
          >
            ▦
          </button>
          <span className="ml-1 text-slate-500">Фон:</span>
          {PALETTE.map((c) => (
            <button
              key={c}
              disabled={!sel}
              onClick={() => sel && updateCell(nodeId, sel.r, sel.c, { bg: c === '#ffffff' ? undefined : c })}
              className="h-5 w-5 rounded border border-slate-300 disabled:opacity-40"
              style={{ backgroundColor: c }}
              title={`Залить ${c}`}
            />
          ))}
          <div className="mx-2 h-4 w-px bg-slate-300" />
          <button onClick={() => addRow(nodeId)} className="rounded border border-slate-300 bg-white px-2 py-1 hover:bg-slate-100">
            + Строка
          </button>
          <button onClick={() => addCol(nodeId)} className="rounded border border-slate-300 bg-white px-2 py-1 hover:bg-slate-100">
            + Столбец
          </button>
          <span className="ml-auto text-slate-400">
            {table.rows}×{table.cols} · автосохранение ✓
          </span>
        </div>
      )}

      <div className="flex-1 overflow-auto p-3">
        <table className="border-collapse">
          <tbody>
            {Array.from({ length: table.rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: table.cols }).map((__, c) => {
                  const cl = cell(r, c);
                  const isSel = sel?.r === r && sel?.c === c;
                  return (
                    <td
                      key={c}
                      onClick={() => !readOnly && setSel({ r, c })}
                      className={`min-w-[120px] max-w-[220px] p-0 align-top ${isSel ? 'outline outline-2 outline-blue-500' : ''}`}
                      style={{
                        backgroundColor: cl.bg,
                        border: cl.border === false ? '1px solid transparent' : '1px solid #cbd5e1',
                      }}
                    >
                      {readOnly ? (
                        <div className="whitespace-pre-wrap px-2 py-1.5 text-sm">{cl.value}</div>
                      ) : (
                        <textarea
                          defaultValue={cl.value}
                          rows={1}
                          spellCheck={false}
                          onBlur={(e) => {
                            if (e.target.value !== cl.value) updateCell(nodeId, r, c, { value: e.target.value });
                          }}
                          className={`w-full resize-none bg-transparent px-2 py-1.5 text-sm outline-none ${cl.bold ? 'font-bold' : ''}`}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
