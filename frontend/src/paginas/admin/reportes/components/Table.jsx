import React from 'react';

export default function Table({ columns = [], rows = [], keys = [] }) {
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((c, idx) => (
              <th key={idx} className="text-left px-2 py-2">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td className="px-2 py-2 text-gray-500" colSpan={columns.length}>
                Sin datos
              </td>
            </tr>
          )}
          {rows.map((r, idx) => (
            <tr key={idx} className="border-b">
              {keys.map((k, kidx) => (
                <td key={kidx} className="px-2 py-2">{r[k]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
