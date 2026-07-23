import { Fragment, type ReactNode } from "react";
import type { CirclePointKind, UnitCircleSpec } from "./types";

const f = (n: number) => Number(n.toFixed(1));
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Точка на окружности в экранных координатах (ось y вниз). */
function onCircle(cx: number, cy: number, r: number, deg: number): [number, number] {
  return [cx + r * Math.cos(rad(deg)), cy - r * Math.sin(rad(deg))];
}

/** Рендерит текст с поддержкой нижнего индекса через «_»: «x_1» → x₁. */
function InlineLabel({ text }: { text: string }) {
  const us = text.indexOf("_");
  if (us === -1) {
    return <>{text}</>;
  }
  return (
    <>
      {text.slice(0, us)}
      <tspan fontSize="0.72em" dy="0.24em">
        {text.slice(us + 1)}
      </tspan>
    </>
  );
}

/** Подпись-дробь «5π/6» столбиком; обычный текст — одной строкой. */
function FractionLabel({
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
      <text x={f(x)} y={f(y + 5)} textAnchor="middle" className={className}>
        <InlineLabel text={label} />
      </text>
    );
  }

  const num = label.slice(0, slash);
  const den = label.slice(slash + 1);
  const barHalf = Math.max(num.length, den.length) * 4.4 + 3;

  return (
    <g className={className}>
      <text x={f(x)} y={f(y - 3)} textAnchor="middle">
        {num}
      </text>
      <line
        x1={f(x - barHalf)}
        y1={f(y + 1)}
        x2={f(x + barHalf)}
        y2={f(y + 1)}
        className="stroke-current [stroke-width:1.3]"
      />
      <text x={f(x)} y={f(y + 14)} textAnchor="middle">
        {den}
      </text>
    </g>
  );
}

const POINT_STYLE: Record<CirclePointKind, { r: number; className: string }> = {
  root: { r: 5.4, className: "fill-brand stroke-white [stroke-width:1.5]" },
  hole: { r: 5, className: "fill-white stroke-brand [stroke-width:2]" },
  selected: { r: 6, className: "fill-ink stroke-white [stroke-width:1.5]" },
  plain: { r: 3, className: "fill-ink" },
};

export function UnitCircle({ spec }: { spec: UnitCircleSpec }) {
  const { points = [], arcs = [], axisLabels, radius = 116, caption } = spec;

  const pad = 62;
  const R = radius;
  const cx = R + pad;
  const cy = R + pad;
  const W = 2 * (R + pad);
  const H = 2 * (R + pad);
  const axis = R + 26; // вылет оси за окружность

  const layers: ReactNode[] = [];

  // 1. Оси со стрелками.
  const arrow = (x: number, y: number, dir: "up" | "right") => {
    const s = 5;
    const pts =
      dir === "right"
        ? `${f(x - s)},${f(y - s)} ${f(x)},${f(y)} ${f(x - s)},${f(y + s)}`
        : `${f(x - s)},${f(y + s)} ${f(x)},${f(y)} ${f(x + s)},${f(y + s)}`;
    return (
      <polyline
        points={pts}
        className="fill-none stroke-muted [stroke-width:1.6]"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  layers.push(
    <Fragment key="axes">
      <line
        x1={f(cx - axis)}
        y1={f(cy)}
        x2={f(cx + axis)}
        y2={f(cy)}
        className="stroke-muted [stroke-width:1.6]"
      />
      <line
        x1={f(cx)}
        y1={f(cy + axis)}
        x2={f(cx)}
        y2={f(cy - axis)}
        className="stroke-muted [stroke-width:1.6]"
      />
      {arrow(cx + axis, cy, "right")}
      {arrow(cx, cy - axis, "up")}
      <text
        x={f(cx + axis - 4)}
        y={f(cy - 8)}
        textAnchor="end"
        className="fill-muted [font-family:ui-serif,Georgia,serif] [font-size:14px] [font-style:italic]"
      >
        x
      </text>
      <text
        x={f(cx - 10)}
        y={f(cy - axis + 6)}
        textAnchor="end"
        className="fill-muted [font-family:ui-serif,Georgia,serif] [font-size:14px] [font-style:italic]"
      >
        y
      </text>
    </Fragment>,
  );

  // 2. Базовая окружность.
  layers.push(
    <circle
      key="base"
      cx={f(cx)}
      cy={f(cy)}
      r={f(R)}
      className="fill-none stroke-ink [stroke-width:1.8]"
    />,
  );

  // 3. Выделенные дуги (интервал отбора) поверх окружности.
  arcs.forEach((a, i) => {
    let span = a.to - a.from;
    while (span <= 0) span += 360;
    while (span > 360) span -= 360;
    const [x1, y1] = onCircle(cx, cy, R, a.from);
    const [x2, y2] = onCircle(cx, cy, R, a.to);
    const largeArc = span > 180 ? 1 : 0;
    // против часовой стрелки при экранной оси y-вниз → sweep-flag 0
    layers.push(
      <path
        key={`arc-${i}`}
        d={`M ${f(x1)} ${f(y1)} A ${f(R)} ${f(R)} 0 ${largeArc} 0 ${f(x2)} ${f(y2)}`}
        className="fill-none stroke-brand [stroke-width:5] [stroke-linecap:round]"
        opacity={0.85}
      />,
    );
  });

  // 4. Подписи концов осей (значения углов для выбранной ветви).
  if (axisLabels) {
    const place: Array<[string | undefined, number, number, "start" | "middle" | "end", number]> = [
      [axisLabels.right, cx + R + 14, cy + 16, "middle", 0],
      [axisLabels.left, cx - R - 14, cy + 16, "middle", 0],
      [axisLabels.top, cx + 16, cy - R - 8, "start", 0],
      [axisLabels.bottom, cx, cy + R + 20, "middle", 0],
    ];
    place.forEach(([label, lx, ly, anchor], i) => {
      if (!label) return;
      layers.push(
        <FractionLabel
          key={`axis-label-${i}`}
          label={label}
          x={anchor === "middle" ? lx : lx + 8}
          y={ly}
          className="fill-brand [font-size:13px] [font-weight:600]"
        />,
      );
    });
  }

  // 5. Точки и их подписи.
  points.forEach((p, i) => {
    const kind = p.kind ?? "plain";
    const style = POINT_STYLE[kind];
    const [px, py] = onCircle(cx, cy, R, p.angle);
    layers.push(
      <circle
        key={`pt-${i}`}
        cx={f(px)}
        cy={f(py)}
        r={style.r}
        className={style.className}
      />,
    );
    if (p.label) {
      const gap = p.labelGap ?? 0.36;
      const [lx, ly] = onCircle(cx, cy, R * (1 + gap), p.angle);
      const isRoot = kind === "root" || kind === "selected";
      layers.push(
        <FractionLabel
          key={`pt-label-${i}`}
          label={p.label}
          x={lx}
          y={ly}
          className={`${isRoot ? "fill-ink" : "fill-muted"} [font-size:13px] [font-weight:600]`}
        />,
      );
    }
  });

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-2xl border border-line bg-white p-4">
      <svg
        viewBox={`0 0 ${f(W)} ${f(H)}`}
        className="mx-auto h-auto w-full max-w-[340px]"
        role="img"
        aria-label={caption ?? "Единичная окружность"}
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
