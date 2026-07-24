/**
 * Декларативное описание координатной плоскости для задач с параметром
 * (задание 18, графический метод). Автор задаёт математические координаты
 * (ось y направлена вверх), а рендер сам считает viewBox, переворачивает
 * ось Y, сэмплирует кривые с разрывами у полюсов и подписывает оси.
 */

export type Vec2 = [number, number];

/** Цвета кривых, точек и подписей. Маппятся в конкретные hex внутри рендера. */
export type PlotColor =
  | "blue"
  | "orange"
  | "red"
  | "green"
  | "violet"
  | "teal"
  | "ink"
  | "muted"
  | "brand";

/**
 * Способ задать кривую. Замкнутые формы движок сэмплирует сам, разрывая линию
 * у полюсов и за пределами окна; «polyline» — явные точки (отрезки/лучи).
 */
export type CurveKind =
  /** y = k·x + b */
  | "linear"
  /** вертикальная прямая x = c (во всю высоту окна) */
  | "vertical"
  /** гипербола y = a/(x − p) + q */
  | "reciprocal"
  /** парабола y = a·x² + b·x + c */
  | "parabola"
  /** «галка» y = k·|x − p| + q */
  | "abs"
  /** ветвь корня y = q + sign·a·√(x − p) */
  | "sqrt"
  /** ломаная по явным точкам (отрезок, луч, любой контур) */
  | "polyline";

export type PlotCurve = {
  kind: CurveKind;
  // Параметры (используются в зависимости от kind).
  k?: number;
  b?: number;
  a?: number;
  p?: number;
  q?: number;
  c?: number;
  /** Ветвь корня: +1 (вверх) или −1 (вниз). */
  sign?: 1 | -1;
  /** Положение вертикальной прямой (kind = "vertical"). */
  x?: number;
  /** Точки ломаной (kind = "polyline"), в авторских координатах. */
  points?: Vec2[];
  /** Область по x. По умолчанию — весь видимый диапазон. */
  domain?: [number, number];
  color?: PlotColor;
  dashed?: boolean;
  width?: number;
  /** Подпись у кривой. */
  label?: string;
  /** x-координата точки кривой, у которой ставится подпись. */
  labelAt?: number;
  /** Явный якорь подписи в авторских координатах (важнее labelAt). */
  labelXY?: Vec2;
  /** Доп. сдвиг подписи в пикселях [dx, dy] (dy вниз). */
  labelDelta?: Vec2;
  labelAnchor?: "start" | "middle" | "end";
};

export type PlotPoint = {
  x: number;
  y: number;
  label?: string;
  /** Закрашенная («dot») или выколотая («open») точка. */
  kind?: "dot" | "open";
  color?: PlotColor;
  labelDelta?: Vec2;
  labelAnchor?: "start" | "middle" | "end";
};

export type PlotLabel = {
  /** Позиция в авторских координатах. */
  x: number;
  y: number;
  text: string;
  color?: PlotColor;
  anchor?: "start" | "middle" | "end";
  size?: number;
  weight?: number;
};

/** Закрашенная область (полуплоскость/полоса) — множество решений. */
export type PlotRegion = {
  /** Вершины многоугольника по контуру, в авторских координатах. */
  points: Vec2[];
  color?: PlotColor;
  opacity?: number;
};

/** Полная окружность/эллипс в авторских координатах. */
export type PlotCircle = {
  cx: number;
  cy: number;
  r: number;
  color?: PlotColor;
  dashed?: boolean;
  width?: number;
  /** Подпись у окружности. */
  label?: string;
  /** Точка на окружности для подписи, угол в градусах (0° — вправо). */
  labelAngle?: number;
  labelDelta?: Vec2;
  labelAnchor?: "start" | "middle" | "end";
};

export type PlotSpec = {
  xRange: [number, number];
  yRange: [number, number];
  /** Значения по осям, которые нужно подписать. */
  xTicks?: number[];
  yTicks?: number[];
  /** Светлая координатная сетка по засечкам. */
  grid?: boolean;
  regions?: PlotRegion[];
  circles?: PlotCircle[];
  curves?: PlotCurve[];
  points?: PlotPoint[];
  labels?: PlotLabel[];
  maxWidth?: number;
  maxHeight?: number;
  pad?: number;
  /** Одинаковый масштаб по осям (по умолчанию true — честные наклоны). */
  equalScale?: boolean;
  /** Подпись оси абсцисс (по умолчанию «x»). */
  xLabel?: string;
  /** Подпись оси ординат (по умолчанию «y»). */
  yLabel?: string;
  caption?: string;
};
