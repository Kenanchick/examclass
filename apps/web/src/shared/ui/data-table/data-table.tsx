import katex from "katex";
import type { TableAlign, TableSpec } from "./types";

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Рендерит строку ячейки: фрагменты $...$ → KaTeX, остальное — обычный текст. */
function renderCell(source: string): string {
  const parts = source.split(/(\$[^$]+\$)/g);
  return parts
    .map((part) => {
      if (part.length >= 2 && part.startsWith("$") && part.endsWith("$")) {
        try {
          return katex.renderToString(part.slice(1, -1), {
            throwOnError: false,
            output: "html",
          });
        } catch {
          return escapeHtml(part);
        }
      }
      return escapeHtml(part);
    })
    .join("");
}

const alignClass = (align: TableAlign | undefined) =>
  align === "left"
    ? "text-left"
    : align === "right"
      ? "text-right"
      : "text-center";

export function DataTable({ spec }: { spec: TableSpec }) {
  const { headers, rows, align = [], caption } = spec;

  return (
    <figure className="not-prose my-6">
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full border-collapse text-[15px]">
          <thead>
            <tr className="bg-brand/8">
              {headers.map((header, i) => (
                <th
                  key={i}
                  className={`border-b border-line px-4 py-3 font-bold text-brand ${alignClass(align[i])}`}
                  dangerouslySetInnerHTML={{ __html: renderCell(header) }}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className={r % 2 === 1 ? "bg-panel/50" : "bg-white"}>
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={`border-b border-line px-4 py-2.5 text-ink ${alignClass(align[c])}`}
                    dangerouslySetInnerHTML={{ __html: renderCell(cell) }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
