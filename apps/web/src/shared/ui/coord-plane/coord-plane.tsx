import { Fragment, type ReactNode, useId } from "react";
import type { PlotColor, PlotCurve, PlotSpec, Vec2 } from "./types";

const f = (n: number) => Number(n.toFixed(2));

/** Палитра кривых. Оси и текст осей рисуются токенами темы (stroke-ink и т.п.). */
const HEX: Record<PlotColor, string> = {
  blue: "#2563eb",
  orange: "#ea7317",
  red: "#e11d48",
  green: "#15a34a",
  violet: "#7c3aed",
  teal: "#0d9488",
  ink: "#28323f",
  muted: "#94a3b8",
  brand: "#2f5fd0",
};

/** «−1,5» вместо «-1.5» — минус-тире и запятая как десятичный разделитель. */
function formatNum(n: number): string {
  return String(n).replace("-", "−").replace(".", ",");
}

/** Замкнутая форма кривой как функция y = f(x); null — если формы нет. */
function fnOf(c: PlotCurve): ((x: number) => number) | null {
  switch (c.kind) {
    case "linear":
      return (x) => (c.k ?? 0) * x + (c.b ?? 0);
    case "reciprocal":
      return (x) => (c.a ?? 1) / (x - (c.p ?? 0)) + (c.q ?? 0);
    case "parabola":
      return (x) => (c.a ?? 1) * x * x + (c.b ?? 0) * x + (c.c ?? 0);
    case "abs":
      return (x) => (c.k ?? 1) * Math.abs(x - (c.p ?? 0)) + (c.q ?? 0);
    case "sqrt": {
      const s = c.sign ?? 1;
      return (x) => {
        const u = x - (c.p ?? 0);
        return u < 0 ? NaN : (c.q ?? 0) + s * (c.a ?? 1) * Math.sqrt(u);
      };
    }
    default:
      return null;
  }
}

export function CoordPlane({ spec }: { spec: PlotSpec }) {
  const plotId = useId().replace(/:/g, "");
  const {
    xRange,
    yRange,
    xTicks = [],
    yTicks = [],
    grid = false,
    regions = [],
    circles = [],
    curves = [],
    points = [],
    labels = [],
    maxWidth = 660,
    maxHeight = 580,
    pad = 30,
    equalScale = true,
    xLabel = "x",
    yLabel = "y",
    caption,
  } = spec;

  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const spanX = Math.max(xMax - xMin, 1e-6);
  const spanY = Math.max(yMax - yMin, 1e-6);
  let sx = maxWidth / spanX;
  let sy = maxHeight / spanY;
  if (equalScale) {
    const u = Math.min(sx, sy);
    sx = u;
    sy = u;
  }

  const W = spanX * sx + 2 * pad;
  const H = spanY * sy + 2 * pad;
  const X = (x: number) => (x - xMin) * sx + pad;
  const Y = (y: number) => (yMax - y) * sy + pad;
  const x0 = X(0);
  const y0 = Y(0);
  const inRange = (v: number, lo: number, hi: number) => v >= lo && v <= hi;
  const hasXAxis = inRange(0, yMin, yMax);
  const hasYAxis = inRange(0, xMin, xMax);
  const clipId = `plot-win-${plotId}`;

  const layers: ReactNode[] = [];

  // 0. Закрашенные области (позади всего).
  regions.forEach((r, i) => {
    const pts = r.points.map((p) => `${f(X(p[0]))},${f(Y(p[1]))}`).join(" ");
    layers.push(
      <polygon
        key={`region-${i}`}
        points={pts}
        fill={HEX[r.color ?? "brand"]}
        fillOpacity={r.opacity ?? 0.12}
        clipPath={`url(#${clipId})`}
      />,
    );
  });

  // 1. Координатная сетка (по засечкам).
  if (grid) {
    const gridLines: ReactNode[] = [];
    xTicks.forEach((t) => {
      const px = X(t);
      gridLines.push(
        <line
          key={`gx-${t}`}
          x1={f(px)}
          y1={f(pad)}
          x2={f(px)}
          y2={f(H - pad)}
          className="stroke-line [stroke-width:1]"
        />,
      );
    });
    yTicks.forEach((t) => {
      const py = Y(t);
      gridLines.push(
        <line
          key={`gy-${t}`}
          x1={f(pad)}
          y1={f(py)}
          x2={f(W - pad)}
          y2={f(py)}
          className="stroke-line [stroke-width:1]"
        />,
      );
    });
    layers.push(<Fragment key="grid">{gridLines}</Fragment>);
  }

  // 2. Оси со стрелками и буквами x, y.
  if (hasXAxis) {
    layers.push(
      <Fragment key="x-axis">
        <line
          x1={f(pad - 6)}
          y1={f(y0)}
          x2={f(W - pad + 14)}
          y2={f(y0)}
          className="stroke-muted [stroke-width:1.6]"
        />
        <polygon
          points={`${f(W - pad + 14)},${f(y0)} ${f(W - pad + 5)},${f(y0 - 4.5)} ${f(W - pad + 5)},${f(y0 + 4.5)}`}
          className="fill-muted"
        />
        <text
          x={f(W - pad + 12)}
          y={f(y0 + 18)}
          textAnchor="end"
          className="fill-muted [font-family:ui-serif,Georgia,serif] [font-size:15px] [font-style:italic]"
        >
          {xLabel}
        </text>
      </Fragment>,
    );
  }
  if (hasYAxis) {
    layers.push(
      <Fragment key="y-axis">
        <line
          x1={f(x0)}
          y1={f(H - pad + 6)}
          x2={f(x0)}
          y2={f(pad - 14)}
          className="stroke-muted [stroke-width:1.6]"
        />
        <polygon
          points={`${f(x0)},${f(pad - 14)} ${f(x0 - 4.5)},${f(pad - 5)} ${f(x0 + 4.5)},${f(pad - 5)}`}
          className="fill-muted"
        />
        <text
          x={f(x0 - 10)}
          y={f(pad - 5)}
          textAnchor="end"
          className="fill-muted [font-family:ui-serif,Georgia,serif] [font-size:15px] [font-style:italic]"
        >
          {yLabel}
        </text>
      </Fragment>,
    );
  }

  // 3. Засечки и числовые подписи осей.
  if (hasXAxis) {
    xTicks.forEach((t) => {
      if (t === 0) return;
      const px = X(t);
      layers.push(
        <Fragment key={`xt-${t}`}>
          <line
            x1={f(px)}
            y1={f(y0 - 3.5)}
            x2={f(px)}
            y2={f(y0 + 3.5)}
            className="stroke-muted [stroke-width:1.4]"
          />
          <text
            x={f(px)}
            y={f(y0 + 18)}
            textAnchor="middle"
            className="fill-ink [font-size:13px]"
          >
            {formatNum(t)}
          </text>
        </Fragment>,
      );
    });
  }
  if (hasYAxis) {
    yTicks.forEach((t) => {
      if (t === 0) return;
      const py = Y(t);
      layers.push(
        <Fragment key={`yt-${t}`}>
          <line
            x1={f(x0 - 3.5)}
            y1={f(py)}
            x2={f(x0 + 3.5)}
            y2={f(py)}
            className="stroke-muted [stroke-width:1.4]"
          />
          <text
            x={f(x0 - 9)}
            y={f(py + 4.5)}
            textAnchor="end"
            className="fill-ink [font-size:13px]"
          >
            {formatNum(t)}
          </text>
        </Fragment>,
      );
    });
  }
  if (hasXAxis && hasYAxis) {
    layers.push(
      <text
        key="origin"
        x={f(x0 - 8)}
        y={f(y0 + 17)}
        textAnchor="end"
        className="fill-ink [font-size:13px]"
      >
        O
      </text>,
    );
  }

  // 4. Кривые: сэмплинг с разрывами у полюсов, обрезка окном через clip.
  const sample = (
    fn: (x: number) => number,
    dom: [number, number],
  ): Vec2[][] => {
    const [a, b] = dom;
    const N = 600;
    const dx = (b - a) / N;
    const lo = yMin - spanY;
    const hi = yMax + spanY;
    const subs: Vec2[][] = [];
    let cur: Vec2[] = [];
    for (let i = 0; i <= N; i += 1) {
      const x = a + i * dx;
      const y = fn(x);
      const ok = Number.isFinite(y) && y >= lo && y <= hi;
      if (ok) {
        cur.push([x, y]);
      } else {
        if (cur.length > 1) subs.push(cur);
        cur = [];
      }
    }
    if (cur.length > 1) subs.push(cur);
    return subs;
  };

  curves.forEach((c, ci) => {
    const stroke = HEX[c.color ?? "blue"];
    const w = c.width ?? 2.4;
    let polylines: Vec2[][] = [];
    if (c.kind === "polyline") {
      polylines = c.points ? [c.points] : [];
    } else if (c.kind === "vertical") {
      const xv = c.x ?? c.c ?? 0;
      polylines = [
        [
          [xv, yMin - spanY],
          [xv, yMax + spanY],
        ],
      ];
    } else {
      const fn = fnOf(c);
      if (fn) polylines = sample(fn, c.domain ?? [xMin, xMax]);
    }

    polylines.forEach((pl, pi) => {
      const d = pl
        .map((p, i) => `${i ? "L" : "M"}${f(X(p[0]))} ${f(Y(p[1]))}`)
        .join(" ");
      layers.push(
        <path
          key={`curve-${ci}-${pi}`}
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={w}
          strokeDasharray={c.dashed ? "7 6" : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath={`url(#${clipId})`}
        />,
      );
    });

    if (c.label != null) {
      let lx: number;
      let ly: number;
      if (c.labelXY) {
        [lx, ly] = c.labelXY;
      } else {
        const at =
          c.labelAt ??
          (c.domain ? (c.domain[0] + c.domain[1]) / 2 : (xMin + xMax) / 2);
        const fn = fnOf(c);
        lx = at;
        ly = fn ? fn(at) : 0;
      }
      const [ddx, ddy] = c.labelDelta ?? [0, 0];
      layers.push(
        <text
          key={`curve-label-${ci}`}
          x={f(X(lx) + ddx)}
          y={f(Y(ly) + ddy)}
          textAnchor={c.labelAnchor ?? "start"}
          fill={stroke}
          className="[font-size:13.5px] [font-weight:600]"
        >
          {c.label}
        </text>,
      );
    }
  });

  // 4.5. Полные окружности (эллипсы при разном масштабе осей).
  circles.forEach((c, i) => {
    const stroke = HEX[c.color ?? "blue"];
    layers.push(
      <ellipse
        key={`circle-${i}`}
        cx={f(X(c.cx))}
        cy={f(Y(c.cy))}
        rx={f(c.r * sx)}
        ry={f(c.r * sy)}
        fill="none"
        stroke={stroke}
        strokeWidth={c.width ?? 2.4}
        strokeDasharray={c.dashed ? "7 6" : undefined}
        clipPath={`url(#${clipId})`}
      />,
    );
    if (c.label != null) {
      const ang = ((c.labelAngle ?? 45) * Math.PI) / 180;
      const [ddx, ddy] = c.labelDelta ?? [0, 0];
      layers.push(
        <text
          key={`circle-label-${i}`}
          x={f(X(c.cx + c.r * Math.cos(ang)) + ddx)}
          y={f(Y(c.cy + c.r * Math.sin(ang)) + ddy)}
          textAnchor={c.labelAnchor ?? "start"}
          fill={stroke}
          className="[font-size:13.5px] [font-weight:600]"
        >
          {c.label}
        </text>,
      );
    }
  });

  // 5. Точки и их подписи.
  points.forEach((p, i) => {
    const col = HEX[p.color ?? "ink"];
    const px = X(p.x);
    const py = Y(p.y);
    if (p.kind === "open") {
      layers.push(
        <circle
          key={`pt-${i}`}
          cx={f(px)}
          cy={f(py)}
          r={4.2}
          fill="#ffffff"
          stroke={col}
          strokeWidth={2}
        />,
      );
    } else {
      layers.push(
        <circle key={`pt-${i}`} cx={f(px)} cy={f(py)} r={3.6} fill={col} />,
      );
    }
    if (p.label != null) {
      const [ddx, ddy] = p.labelDelta ?? [8, -8];
      const anchor = p.labelAnchor ?? (ddx < 0 ? "end" : "start");
      layers.push(
        <text
          key={`pt-label-${i}`}
          x={f(px + ddx)}
          y={f(py + ddy)}
          textAnchor={anchor}
          className="fill-ink [font-family:ui-serif,Georgia,serif] [font-size:14.5px] [font-style:italic] [font-weight:700]"
        >
          {p.label}
        </text>,
      );
    }
  });

  // 6. Свободные подписи.
  labels.forEach((l, i) => {
    layers.push(
      <text
        key={`label-${i}`}
        x={f(X(l.x))}
        y={f(Y(l.y))}
        textAnchor={l.anchor ?? "start"}
        fill={HEX[l.color ?? "ink"]}
        style={{ fontSize: `${l.size ?? 13}px`, fontWeight: l.weight ?? 600 }}
      >
        {l.text}
      </text>,
    );
  });

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-2xl border border-line bg-white p-4">
      <svg
        viewBox={`0 0 ${f(W)} ${f(H)}`}
        className="mx-auto h-auto w-full max-w-[560px]"
        role="img"
        aria-label={caption ?? "Чертёж к задаче с параметром"}
      >
        <defs>
          <clipPath id={clipId}>
            <rect
              x={f(pad)}
              y={f(pad)}
              width={f(spanX * sx)}
              height={f(spanY * sy)}
            />
          </clipPath>
        </defs>
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
