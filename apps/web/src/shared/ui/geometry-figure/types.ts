export type Point = [number, number];

export type EdgeStyle = "solid" | "dashed" | "bold" | "section";

export type Edge = {
  from: string;
  to: string;
  style?: EdgeStyle;
  /** Число штрихов равенства на середине отрезка. */
  ticks?: number;
};

export type Fill = {
  /** Имена вершин многоугольника по контуру. */
  points: string[];
};

export type RightAngle = {
  at: string;
  from: string;
  to: string;
  size?: number;
};

export type AngleMark = {
  at: string;
  from: string;
  to: string;
  label?: string;
  radius?: number;
};

export type LabelOverride =
  | false
  | {
      dx?: number;
      dy?: number;
      anchor?: "start" | "middle" | "end";
      text?: string;
    };

export type Dimension = {
  from: string;
  to: string;
  text: string;
  /** Сдвиг подписи от ребра наружу, px. */
  gap?: number;
};

export type Circle = {
  /** Центр в авторских координатах. */
  cx: number;
  cy: number;
  /** Радиус в авторских единицах (масштабируется вместе с фигурой). */
  r: number;
  dashed?: boolean;
};

/**
 * Декларативное описание чертежа. Автор задаёт точки в координатах y-вверх,
 * а рендер сам масштабирует, переворачивает ось Y, считает viewBox и подписи.
 */
export type FigureSpec = {
  points: Record<string, Point>;
  edges?: Edge[];
  fills?: Fill[];
  circles?: Circle[];
  rightAngles?: RightAngle[];
  angles?: AngleMark[];
  ticks?: Edge[];
  dims?: Dimension[];
  /** Переопределение подписей вершин: смещение/якорь/текст или false, чтобы скрыть. */
  labels?: Record<string, LabelOverride>;
  maxWidth?: number;
  maxHeight?: number;
  pad?: number;
  caption?: string;
};
