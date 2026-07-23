import { Fragment, type ReactNode } from "react";
import type { FigureSpec, Point } from "./types";

type Vec = [number, number];

const sub = (v: Vec, w: Vec): Vec => [v[0] - w[0], v[1] - w[1]];
const add = (v: Vec, w: Vec): Vec => [v[0] + w[0], v[1] + w[1]];
const mul = (v: Vec, k: number): Vec => [v[0] * k, v[1] * k];
const len = (v: Vec) => Math.hypot(v[0], v[1]) || 1;
const unit = (v: Vec): Vec => mul(v, 1 / len(v));
const mid = (v: Vec, w: Vec): Vec => [(v[0] + w[0]) / 2, (v[1] + w[1]) / 2];
const f = (n: number) => Number(n.toFixed(1));

/** Разбивает имя вершины на основу и цифровой индекс: "A1" → "A" + "1". */
function labelParts(name: string): [string, string | null] {
  const m = name.match(/^(.*?)(\d+)$/);
  return m ? [m[1] ?? name, m[2] ?? null] : [name, null];
}

function LabelText({
  text,
  x,
  y,
  anchor,
  className,
}: {
  text: string;
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
  className: string;
}) {
  const [base, index] = labelParts(text);
  return (
    <text x={f(x)} y={f(y)} textAnchor={anchor} className={className}>
      {base}
      {index !== null && (
        <tspan fontSize="0.72em" dy="0.22em">
          {index}
        </tspan>
      )}
    </text>
  );
}

export function GeometryFigure({ spec }: { spec: FigureSpec }) {
  const {
    points,
    edges = [],
    fills = [],
    circles = [],
    rightAngles = [],
    angles = [],
    ticks = [],
    dims = [],
    labels = {},
    maxWidth = 480,
    maxHeight = 400,
    pad = 38,
    caption,
  } = spec;

  const names = Object.keys(points);
  if (names.length === 0) {
    return null;
  }

  const at = (name: string): Point => points[name] ?? [0, 0];
  // Габариты считаем по вершинам и окружностям, чтобы дуги не обрезались.
  const xs = [
    ...names.map((n) => at(n)[0]),
    ...circles.flatMap((c) => [c.cx - c.r, c.cx + c.r]),
  ];
  const ys = [
    ...names.map((n) => at(n)[1]),
    ...circles.flatMap((c) => [c.cy - c.r, c.cy + c.r]),
  ];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = Math.max(maxX - minX, 1e-6);
  const spanY = Math.max(maxY - minY, 1e-6);
  const scale = Math.min(maxWidth / spanX, maxHeight / spanY);

  // Проекция авторских координат (y вверх) в экранные (y вниз).
  const P = (name: string): Vec => {
    const [x, y] = at(name);
    return [(x - minX) * scale + pad, (maxY - y) * scale + pad];
  };

  const W = spanX * scale + 2 * pad;
  const H = spanY * scale + 2 * pad;
  const centroid: Vec = names
    .map(P)
    .reduce((acc, p) => add(acc, mul(p, 1 / names.length)), [0, 0] as Vec);

  const edgeClass: Record<string, string> = {
    solid: "stroke-ink [stroke-width:2.2]",
    bold: "stroke-ink [stroke-width:3]",
    dashed: "stroke-muted [stroke-width:1.6] [stroke-dasharray:6_5]",
    section: "stroke-brand [stroke-width:2.6]",
  };

  const layers: ReactNode[] = [];

  // 1. Заливки сечений (позади всего).
  fills.forEach((fill, i) => {
    const pts = fill.points.map(P);
    layers.push(
      <polygon
        key={`fill-${i}`}
        points={pts.map((p) => `${f(p[0])},${f(p[1])}`).join(" ")}
        className="fill-brand"
        fillOpacity={0.12}
      />,
    );
  });

  // 1.5. Окружности (позади рёбер, поверх заливок).
  circles.forEach((c, i) => {
    const cx = (c.cx - minX) * scale + pad;
    const cy = (maxY - c.cy) * scale + pad;
    layers.push(
      <circle
        key={`circle-${i}`}
        cx={f(cx)}
        cy={f(cy)}
        r={f(c.r * scale)}
        className={`fill-none stroke-ink ${c.dashed ? "[stroke-dasharray:6_5]" : ""} [stroke-width:2]`}
      />,
    );
  });

  // 2. Рёбра: пунктир → сплошные → сечение (порядок для наложения).
  const orderedEdges = [...edges].sort((a, b) => {
    const rank = (s?: string) =>
      s === "dashed" ? 0 : s === "section" ? 2 : 1;
    return rank(a.style) - rank(b.style);
  });
  orderedEdges.forEach((edge, i) => {
    const a = P(edge.from);
    const b = P(edge.to);
    layers.push(
      <line
        key={`edge-${i}`}
        x1={f(a[0])}
        y1={f(a[1])}
        x2={f(b[0])}
        y2={f(b[1])}
        strokeLinecap="round"
        className={edgeClass[edge.style ?? "solid"]}
      />,
    );
    if (edge.ticks) {
      layers.push(tickMarks(a, b, edge.ticks, `edge-tick-${i}`));
    }
  });

  // 3. Штрихи равенства (отдельным списком).
  ticks.forEach((t, i) => {
    layers.push(tickMarks(P(t.from), P(t.to), t.ticks ?? 1, `tick-${i}`));
  });

  // 4. Прямые углы.
  rightAngles.forEach((ra, i) => {
    const v = P(ra.at);
    const u1 = unit(sub(P(ra.from), v));
    const u2 = unit(sub(P(ra.to), v));
    const s = ra.size ?? 13;
    const p1 = add(v, mul(u1, s));
    const p2 = add(add(v, mul(u1, s)), mul(u2, s));
    const p3 = add(v, mul(u2, s));
    layers.push(
      <polyline
        key={`ra-${i}`}
        points={`${f(p1[0])},${f(p1[1])} ${f(p2[0])},${f(p2[1])} ${f(p3[0])},${f(p3[1])}`}
        className="fill-none stroke-ink [stroke-width:1.5]"
      />,
    );
  });

  // 5. Дуги углов.
  angles.forEach((ang, i) => {
    const v = P(ang.at);
    const u1 = unit(sub(P(ang.from), v));
    const u2 = unit(sub(P(ang.to), v));
    const r = ang.radius ?? 26;
    const s1 = add(v, mul(u1, r));
    const s2 = add(v, mul(u2, r));
    const sweep = u1[0] * u2[1] - u1[1] * u2[0] < 0 ? 1 : 0;
    layers.push(
      <path
        key={`ang-${i}`}
        d={`M ${f(s1[0])} ${f(s1[1])} A ${f(r)} ${f(r)} 0 0 ${sweep} ${f(s2[0])} ${f(s2[1])}`}
        className="fill-none stroke-ink [stroke-width:1.6]"
      />,
    );
    if (ang.label) {
      const bis = unit(add(u1, u2));
      const lp = add(v, mul(bis, r + 15));
      layers.push(
        <text
          key={`ang-label-${i}`}
          x={f(lp[0])}
          y={f(lp[1] + 4)}
          textAnchor="middle"
          className="fill-ink [font-size:14px] [font-weight:600]"
        >
          {ang.label}
        </text>,
      );
    }
  });

  // 6. Размеры (подписи длин у середины ребра, наружу от центра).
  dims.forEach((dim, i) => {
    const m = mid(P(dim.from), P(dim.to));
    const dir = unit(sub(m, centroid));
    const gap = dim.gap ?? 15;
    const lp = add(m, mul(dir, gap));
    layers.push(
      <text
        key={`dim-${i}`}
        x={f(lp[0])}
        y={f(lp[1] + 4)}
        textAnchor="middle"
        className="fill-ink [font-size:14px] [font-weight:600]"
      >
        {dim.text}
      </text>,
    );
  });

  // 7. Точки и подписи вершин.
  names.forEach((name) => {
    const p = P(name);
    layers.push(
      <circle key={`dot-${name}`} cx={f(p[0])} cy={f(p[1])} r={2.6} className="fill-ink" />,
    );
    const override = labels[name];
    if (override === false) {
      return;
    }
    const dir = unit(sub(p, centroid));
    const dx = override?.dx ?? dir[0] * 18;
    const dy = override?.dy ?? dir[1] * 18;
    const anchor =
      override?.anchor ??
      (dx > 4 ? "start" : dx < -4 ? "end" : "middle");
    layers.push(
      <LabelText
        key={`label-${name}`}
        text={override?.text ?? name}
        x={p[0] + dx}
        y={p[1] + dy + 5}
        anchor={anchor}
        className="fill-ink [font-family:ui-serif,Georgia,serif] [font-size:16px] [font-style:italic] [font-weight:600]"
      />,
    );
  });

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-2xl border border-line bg-white p-4">
      <svg
        viewBox={`0 0 ${f(W)} ${f(H)}`}
        className="mx-auto h-auto w-full max-w-[520px]"
        role="img"
        aria-label={caption ?? "Чертёж к задаче"}
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

  function tickMarks(a: Vec, b: Vec, count: number, key: string): ReactNode {
    const dir = unit(sub(b, a));
    const perp: Vec = [-dir[1], dir[0]];
    const m = mid(a, b);
    const gap = 5.5;
    const half = 5.5;
    const marks: ReactNode[] = [];
    for (let i = 0; i < count; i += 1) {
      const off = (i - (count - 1) / 2) * gap;
      const c = add(m, mul(dir, off));
      const s1 = sub(c, mul(perp, half));
      const s2 = add(c, mul(perp, half));
      marks.push(
        <line
          key={`${key}-${i}`}
          x1={f(s1[0])}
          y1={f(s1[1])}
          x2={f(s2[0])}
          y2={f(s2[1])}
          strokeLinecap="round"
          className="stroke-ink [stroke-width:1.8]"
        />,
      );
    }
    return <Fragment key={key}>{marks}</Fragment>;
  }
}
