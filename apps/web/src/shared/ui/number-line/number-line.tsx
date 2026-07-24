import { Fragment, type ReactNode } from "react";
import type { NumLineSpec } from "./types";

const f = (n: number) => Number(n.toFixed(2));

/** Подпись столбиком для дроби «a/b»; обычный текст — одной строкой. */
function AxisLabel({
  label,
  x,
  y,
  className,
}: {
  label: string;
  x: number;
  y: number;
  className: string;
}) {
  const slash = label.indexOf("/");
  if (slash === -1) {
    return (
      <text x={f(x)} y={f(y + 4)} textAnchor="middle" className={className}>
        {label}
      </text>
    );
  }
  const num = label.slice(0, slash);
  const den = label.slice(slash + 1);
  const barHalf = Math.max(num.length, den.length) * 4.4 + 3;
  return (
    <g className={className}>
      <text x={f(x)} y={f(y - 2)} textAnchor="middle">
        {num}
      </text>
      <line
        x1={f(x - barHalf)}
        y1={f(y + 2)}
        x2={f(x + barHalf)}
        y2={f(y + 2)}
        className="stroke-current [stroke-width:1.2]"
      />
      <text x={f(x)} y={f(y + 15)} textAnchor="middle">
        {den}
      </text>
    </g>
  );
}

export function NumberLine({ spec }: { spec: NumLineSpec }) {
  const {
    points,
    signs = [],
    bands = [],
    brackets = [],
    axisLabel = "x",
    caption,
  } = spec;

  const n = points.length;
  if (n === 0) {
    return null;
  }

  const pad = 40;
  const W = Math.max(320, 60 * (n + 1) + 2 * pad);
  const hasBracket = brackets.length > 0;
  const axisY = hasBracket ? 96 : 66;
  const H = axisY + 62;

  const gap = (W - 2 * pad) / (n + 1);
  const px = (i: number) => pad + (i + 1) * gap;
  // Позиция для отрезков-решений: −1 → левый край, n → правый край.
  const pos = (i: number) => {
    if (i <= -1) return pad - 4;
    if (i >= n) return W - pad + 4;
    return px(i);
  };
  // Центры промежутков для знаков: регион i между точкой i−1 и i.
  const regionCenter = (i: number) => {
    const left = i === 0 ? pad : px(i - 1);
    const right = i === n ? W - pad : px(i);
    return (left + right) / 2;
  };

  const layers: ReactNode[] = [];

  // 1. Закрашенные отрезки-решения (позади оси).
  bands.forEach((b, i) => {
    const x1 = pos(b.from);
    const x2 = pos(b.to);
    layers.push(
      <rect
        key={`band-${i}`}
        x={f(Math.min(x1, x2))}
        y={f(axisY - 15)}
        width={f(Math.abs(x2 - x1))}
        height={15}
        className="fill-success"
        fillOpacity={0.16}
      />,
    );
    layers.push(
      <line
        key={`band-line-${i}`}
        x1={f(x1)}
        y1={f(axisY)}
        x2={f(x2)}
        y2={f(axisY)}
        className="stroke-success [stroke-width:3.4]"
        strokeLinecap="round"
      />,
    );
  });

  // 2. Ось со стрелкой и подписью.
  layers.push(
    <Fragment key="axis">
      <line
        x1={f(pad - 12)}
        y1={f(axisY)}
        x2={f(W - pad + 14)}
        y2={f(axisY)}
        className="stroke-ink [stroke-width:1.8]"
      />
      <polygon
        points={`${f(W - pad + 14)},${f(axisY)} ${f(W - pad + 5)},${f(axisY - 4.5)} ${f(W - pad + 5)},${f(axisY + 4.5)}`}
        className="fill-ink"
      />
      <text
        x={f(W - pad + 12)}
        y={f(axisY + 20)}
        textAnchor="end"
        className="fill-muted [font-family:ui-serif,Georgia,serif] [font-size:15px] [font-style:italic]"
      >
        {axisLabel}
      </text>
    </Fragment>,
  );

  // 3. Знаки в промежутках (над осью).
  signs.forEach((s, i) => {
    if (!s) return;
    layers.push(
      <text
        key={`sign-${i}`}
        x={f(regionCenter(i))}
        y={f(axisY - 20)}
        textAnchor="middle"
        className="fill-muted [font-size:20px] [font-weight:700]"
      >
        {s === "+" ? "+" : "−"}
      </text>,
    );
  });

  // 4. Верхние скобки (ОДЗ и т.п.).
  brackets.forEach((br, i) => {
    const x1 = pos(br.from);
    const x2 = pos(br.to);
    const by = axisY - 44;
    layers.push(
      <Fragment key={`bracket-${i}`}>
        <path
          d={`M ${f(x1)} ${f(by + 8)} L ${f(x1)} ${f(by)} L ${f(x2)} ${f(by)} L ${f(x2)} ${f(by + 8)}`}
          className="fill-none stroke-brand [stroke-width:1.6]"
          strokeLinecap="round"
        />
        {br.label && (
          <text
            x={f((x1 + x2) / 2)}
            y={f(by - 6)}
            textAnchor="middle"
            className="fill-brand [font-size:13px] [font-weight:600]"
          >
            {br.label}
          </text>
        )}
      </Fragment>,
    );
  });

  // 5. Точки и их подписи.
  points.forEach((p, i) => {
    const x = px(i);
    const kind = p.kind ?? "filled";
    if (kind === "open") {
      layers.push(
        <circle
          key={`pt-${i}`}
          cx={f(x)}
          cy={f(axisY)}
          r={5}
          className="fill-white stroke-ink [stroke-width:2]"
        />,
      );
    } else {
      layers.push(
        <circle
          key={`pt-${i}`}
          cx={f(x)}
          cy={f(axisY)}
          r={5}
          className="fill-ink"
        />,
      );
    }
    if (p.label) {
      layers.push(
        <AxisLabel
          key={`pt-label-${i}`}
          label={p.label}
          x={x}
          y={axisY + 24}
          className="fill-ink [font-size:14px]"
        />,
      );
    }
  });

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-2xl border border-line bg-white p-4">
      <svg
        viewBox={`0 0 ${f(W)} ${f(H)}`}
        className="mx-auto h-auto w-full max-w-[560px]"
        role="img"
        aria-label={caption ?? "Числовая прямая (метод интервалов)"}
      >
        {layers.map((layer, i) => (
          <Fragment key={i}>{layer}</Fragment>
        ))}
      </svg>
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
