"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  Crosshair,
  Edit3,
  GripVertical,
  Maximize2,
  Minus,
  Move,
  Plus,
  RotateCcw,
  Save,
  TrainFront,
  Trash2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent,
} from "react";
import type {
  TeacherRoadmap,
  TeacherRoadmapNode,
  TeacherRoadmapStatus,
} from "@/entities/learning-route/model/teacher-route";

const BOARD_WIDTH = 4380;
const BOARD_HEIGHT = 3160;
const CARD_WIDTH = 560;
const CARD_HEIGHT = 280;
const REVIEW_CARD_WIDTH = 500;
const REVIEW_CARD_HEIGHT = 300;
const START_X = 680;
const START_Y = 520;
const COLUMN_GAP = 790;
const ROW_GAP = 410;
const DEFAULT_CUSTOM_START_Y = 3240;
const MIN_SCALE = 0.24;
const MAX_SCALE = 1.45;
const ARROW_END_GAP = 30;
const REVIEW_EDGE_PADDING = 20;
const REVIEW_EDGE_GAP = 110;
const REVIEW_BOTTOM_GAP = 220;
const REVIEW_BOTTOM_ROW_GAP = REVIEW_CARD_HEIGHT + 140;
const MAIN_ROUTE_BOTTOM = START_Y + 4 * ROW_GAP + CARD_HEIGHT;

type Viewport = { x: number; y: number; scale: number };
type BoardPoint = { x: number; y: number };
type BoardBox = { x: number; y: number; width: number; height: number };
type RouteNodeLayout = BoardPoint & {
  index: number;
  row: number;
  column: number;
};
type ReviewNode = TeacherRoadmap["reviewNodes"][number];
type ReviewSide = "left" | "top" | "right" | "bottom";
type HighlightedLink =
  | { kind: "route"; from: number; to: number }
  | { kind: "review"; from: number; moduleKey: string }
  | { kind: "custom"; from: number }
  | null;

const statusPresentation: Record<
  TeacherRoadmapStatus,
  {
    color: string;
    background: string;
    border: string;
    label: string;
    numberColor?: string;
    surface: string;
  }
> = {
  MASTERED: {
    color: "#236548",
    background: "#dfece5",
    border: "#8fb39f",
    label: "Освоено",
    surface: "#f6faf7",
  },
  LEARNING: {
    color: "#7d5722",
    background: "#f0e5d4",
    border: "#c8ad83",
    label: "В работе",
    surface: "#fbf8f3",
  },
  CURRENT_PRIORITY: {
    color: "#0b527d",
    background: "#0b527d",
    border: "#477795",
    label: "Текущий приоритет",
    numberColor: "#ffffff",
    surface: "#f0f5f8",
  },
  AVAILABLE: {
    color: "#405f75",
    background: "#e3ebf0",
    border: "#aebfca",
    label: "Доступно",
    surface: "#f7f9fa",
  },
  BLOCKED: {
    color: "#666f76",
    background: "#e6e9eb",
    border: "#c5cbd0",
    label: "Нужна база",
    surface: "#f7f8f8",
  },
  NEEDS_REVIEW: {
    color: "#87483b",
    background: "#efdfda",
    border: "#c99e94",
    label: "На повторение",
    surface: "#fbf7f6",
  },
  INSUFFICIENT_DATA: {
    color: "#62576a",
    background: "#e9e5eb",
    border: "#beb4c3",
    label: "Нужно проверить",
    surface: "#faf8fa",
  },
  TEACHER_ASSIGNED: {
    color: "#3d5576",
    background: "#e1e7ef",
    border: "#9dadc2",
    label: "Назначено преподавателем",
    surface: "#f6f8fa",
  },
};

const nodeLayoutAt = (index: number): RouteNodeLayout => {
  const row = Math.floor(index / 4);
  const offset = index % 4;
  const column = row % 2 === 0 ? offset : 3 - offset;
  return {
    index,
    row,
    column,
    x: START_X + column * COLUMN_GAP,
    y: START_Y + row * ROW_GAP,
  };
};

const nodeBox = (layout: RouteNodeLayout): BoardBox => ({
  x: layout.x,
  y: layout.y,
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
});

const nodeCenter = (layout: RouteNodeLayout) => {
  return {
    x: layout.x + CARD_WIDTH / 2,
    y: layout.y + CARD_HEIGHT / 2,
  };
};

const getNodeLayout = (
  layouts: Map<number, RouteNodeLayout>,
  examNumber: number,
) => layouts.get(examNumber) ?? nodeLayoutAt(examNumber - 1);

const reviewSide = (
  review: ReviewNode,
  layouts: Map<number, RouteNodeLayout>,
): ReviewSide => {
  const { row, column } = getNodeLayout(layouts, review.sourceExamNumber);

  if (column === 0) return "left";
  if (column === 3) return "right";
  if (row === 0) return "top";
  return "bottom";
};

const buildReviewPositions = (
  reviews: ReviewNode[],
  layouts: Map<number, RouteNodeLayout>,
) => {
  const positions: BoardPoint[] = new Array(reviews.length);
  const indexedReviews = reviews.map((review, index) => ({
    index,
    review,
    side: reviewSide(review, layouts),
    source: getNodeLayout(layouts, review.sourceExamNumber),
  }));
  const sideReviews = (side: ReviewSide) =>
    indexedReviews
      .filter((item) => item.side === side)
      .sort((a, b) => a.source.index - b.source.index);

  const placeVerticalEdge = (side: "left" | "right", x: number) => {
    let nextY = START_Y - 10;

    sideReviews(side).forEach((item) => {
      const desiredY = item.source.y + (CARD_HEIGHT - REVIEW_CARD_HEIGHT) / 2;
      const y = Math.max(desiredY, nextY);
      positions[item.index] = { x, y };
      nextY = y + REVIEW_CARD_HEIGHT + REVIEW_EDGE_GAP;
    });
  };

  placeVerticalEdge("left", REVIEW_EDGE_PADDING);
  placeVerticalEdge(
    "right",
    BOARD_WIDTH - REVIEW_CARD_WIDTH - REVIEW_EDGE_PADDING,
  );

  sideReviews("top").forEach((item) => {
    positions[item.index] = {
      x: item.source.x + (CARD_WIDTH - REVIEW_CARD_WIDTH) / 2,
      y: REVIEW_EDGE_PADDING,
    };
  });

  sideReviews("bottom").forEach((item, slot) => {
    positions[item.index] = {
      x:
        START_X +
        (slot % 4) * COLUMN_GAP +
        (CARD_WIDTH - REVIEW_CARD_WIDTH) / 2,
      y:
        MAIN_ROUTE_BOTTOM +
        REVIEW_BOTTOM_GAP +
        Math.floor(slot / 4) * REVIEW_BOTTOM_ROW_GAP,
    };
  });

  return positions;
};

const reviewBox = (position: BoardPoint): BoardBox => ({
  ...position,
  width: REVIEW_CARD_WIDTH,
  height: REVIEW_CARD_HEIGHT,
});

const customNodePosition = (index: number, customStartY: number) => ({
  x: START_X + (index % 4) * COLUMN_GAP,
  y: customStartY + Math.floor(index / 4) * ROW_GAP,
});

const customNodeBox = (index: number, customStartY: number): BoardBox => ({
  ...customNodePosition(index, customStartY),
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
});

const boxCenter = (box: BoardBox) => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

const anchorAtEdge = (box: BoardBox, target: { x: number; y: number }) => {
  const center = boxCenter(box);
  const dx = target.x - center.x;
  const dy = target.y - center.y;

  if (Math.abs(dx) / box.width > Math.abs(dy) / box.height) {
    return {
      x: dx >= 0 ? box.x + box.width : box.x,
      y: center.y,
    };
  }

  return {
    x: center.x,
    y: dy >= 0 ? box.y + box.height : box.y,
  };
};

const moveTowards = (
  point: { x: number; y: number },
  target: { x: number; y: number },
  distance: number,
) => {
  const dx = target.x - point.x;
  const dy = target.y - point.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: point.x + (dx / length) * distance,
    y: point.y + (dy / length) * distance,
  };
};

const pathBetween = (from: BoardBox, to: BoardBox) => {
  const start = anchorAtEdge(from, boxCenter(to));
  const end = moveTowards(
    anchorAtEdge(to, boxCenter(from)),
    start,
    ARROW_END_GAP,
  );
  const horizontal = Math.abs(end.x - start.x) > Math.abs(end.y - start.y);
  const handle = Math.max(
    70,
    (horizontal ? Math.abs(end.x - start.x) : Math.abs(end.y - start.y)) * 0.42,
  );

  if (horizontal) {
    const direction = end.x >= start.x ? 1 : -1;
    return `M ${start.x} ${start.y} C ${start.x + direction * handle} ${start.y}, ${end.x - direction * handle} ${end.y}, ${end.x} ${end.y}`;
  }

  const direction = end.y >= start.y ? 1 : -1;
  return `M ${start.x} ${start.y} C ${start.x} ${start.y + direction * handle}, ${end.x} ${end.y - direction * handle}, ${end.x} ${end.y}`;
};

const connectionPath = (from: RouteNodeLayout, to: RouteNodeLayout) => {
  const fromBox = nodeBox(from);
  const toBox = nodeBox(to);
  const start = anchorAtEdge(fromBox, boxCenter(toBox));
  const end = moveTowards(
    anchorAtEdge(toBox, boxCenter(fromBox)),
    start,
    ARROW_END_GAP,
  );

  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
};

const reviewConnectionPath = (
  review: ReviewNode,
  position: BoardPoint,
  index: number,
  sourceLayout: RouteNodeLayout,
) => {
  const source = nodeBox(sourceLayout);
  const target = reviewBox(position);
  const { column, row } = sourceLayout;

  if (column === 0 || column === 3 || row === 0 || row === 4) {
    return pathBetween(source, target);
  }

  const exitsRight = column < 2;
  const start = {
    x: exitsRight ? source.x + source.width : source.x,
    y: source.y + source.height / 2,
  };
  const laneOffset = 24 + index * 18;
  const laneX = exitsRight
    ? source.x + source.width + laneOffset
    : source.x - laneOffset;
  const targetCenterX = target.x + target.width / 2;
  const approachY = target.y - 72;

  return [
    `M ${start.x} ${start.y}`,
    `C ${laneX} ${start.y}, ${laneX} ${start.y + 44}, ${laneX} ${start.y + 88}`,
    `L ${laneX} ${approachY - 44}`,
    `C ${laneX} ${approachY}, ${targetCenterX} ${approachY}, ${targetCenterX} ${target.y}`,
  ].join(" ");
};

function ConnectionPath({
  active = false,
  color,
  d,
  kind = "route",
  markerEnd,
  onActiveChange,
  width,
}: {
  active?: boolean;
  color: string;
  d: string;
  kind?: "route" | "review" | "custom";
  markerEnd: string;
  onActiveChange?: (active: boolean) => void;
  width: number;
}) {
  const setActive = (active: boolean) => {
    onActiveChange?.(active);
  };

  return (
    <g
      className={`roadmap-link-group roadmap-link-group--${kind} ${
        active ? "roadmap-link-group--active" : ""
      }`}
    >
      <path
        className="roadmap-main-line"
        d={d}
        fill="none"
        markerEnd={markerEnd}
        pathLength="1"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={width}
      />
      <path
        className="roadmap-link-hit"
        d={d}
        fill="none"
        onPointerEnter={() => setActive(true)}
        onPointerLeave={() => setActive(false)}
        stroke="transparent"
        strokeLinecap="round"
        strokeWidth={Math.max(36, width + 26)}
      />
    </g>
  );
}

function FlowingDotsPath({
  color,
  d,
  width,
}: {
  color: string;
  d: string;
  width: number;
}) {
  if (!d) return null;

  return (
    <path
      className="roadmap-link-dots"
      d={d}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={width}
    />
  );
}

function NumberBurst({
  background,
  color,
  value,
}: {
  background: string;
  color: string;
  value: number;
}) {
  return (
    <span
      className="relative grid size-[112px] shrink-0 place-items-center text-[29px] font-extrabold"
      style={{ color }}
    >
      <svg
        aria-hidden
        className="absolute inset-0 size-full"
        viewBox="0 0 100 100"
      >
        <path
          d="M50 5C60 5 65 17 73 21C82 25 95 26 98 36C101 46 89 54 85 61C81 69 83 83 74 89C65 95 55 85 47 84C37 82 26 92 18 85C10 78 17 66 15 57C13 48 2 39 7 30C12 21 25 24 33 19C40 15 41 5 50 5Z"
          fill={background}
        />
      </svg>
      <span className="relative">{value}</span>
    </span>
  );
}

function ProgressRing({ value, color }: { value: number; color: string }) {
  const radius = 31;
  const circumference = Math.PI * radius * 2;
  const dash = circumference * Math.max(0, Math.min(1, value));

  return (
    <div className="relative grid size-[76px] shrink-0 place-items-center">
      <svg aria-hidden className="-rotate-90" height="76" width="76">
        <circle
          cx="38"
          cy="38"
          fill="none"
          r={radius}
          stroke="#e7edf2"
          strokeWidth="7"
        />
        <circle
          className="roadmap-progress-ring"
          cx="38"
          cy="38"
          fill="none"
          r={radius}
          stroke={color}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          strokeWidth="7"
        />
      </svg>
      <span className="absolute text-base font-bold text-ink">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function RoadmapCard({
  node,
  connectionHighlighted,
  editMode,
  onOpen,
  onReviewHighlightChange,
  position,
  routeStep,
  selected,
}: {
  node: TeacherRoadmapNode;
  connectionHighlighted: boolean;
  editMode: boolean;
  onOpen: () => void;
  onReviewHighlightChange?: (active: boolean) => void;
  position: BoardPoint;
  routeStep: number;
  selected: boolean;
}) {
  const presentation = statusPresentation[node.status];
  const isPerfect = node.mastery >= 0.995;

  return (
    <button
      aria-label={`Задание ${node.examNumber}: ${node.title}`}
      className={`roadmap-node roadmap-node-card absolute cursor-pointer overflow-hidden rounded-[1.5rem] border-2 p-7 text-left shadow-[0_14px_34px_rgba(20,45,65,0.09)] outline-none transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_44px_rgba(20,45,65,0.14)] focus-visible:ring-4 focus-visible:ring-[#b8cbd8] ${
        node.isCurrent ? "roadmap-node--current" : ""
      } ${isPerfect ? "roadmap-node--perfect" : ""} ${
        selected ? "ring-4 ring-[#b8cbd8]" : ""
      } ${connectionHighlighted ? "roadmap-node--linked" : ""}`}
      onBlur={() => onReviewHighlightChange?.(false)}
      onClick={onOpen}
      onFocus={() => onReviewHighlightChange?.(true)}
      onPointerEnter={() => onReviewHighlightChange?.(true)}
      onPointerLeave={() => onReviewHighlightChange?.(false)}
      style={
        {
          backgroundColor: presentation.surface,
          borderColor: presentation.border,
          height: CARD_HEIGHT,
          left: position.x,
          top: position.y,
          width: CARD_WIDTH,
        } as CSSProperties
      }
      type="button"
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-2"
        style={{ background: presentation.color }}
      />
      {editMode && (
        <span className="absolute right-5 top-4 rounded-full bg-[#0b4977] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.08em] text-white shadow-sm">
          Шаг {routeStep}
        </span>
      )}
      <div className="flex h-full items-center gap-7">
        <NumberBurst
          background={presentation.background}
          color={presentation.numberColor ?? presentation.color}
          value={node.examNumber}
        />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-3 text-[34px] font-bold leading-[1.1] tracking-[-0.045em] text-ink">
            {node.title}
          </h3>
          <span
            className="mt-4 inline-flex rounded-lg border bg-white/70 px-3 py-1.5 text-sm font-bold"
            style={{
              borderColor: presentation.border,
              color: presentation.color,
            }}
          >
            {presentation.label}
          </span>
        </div>
        <div className="scale-105">
          <ProgressRing color={presentation.color} value={node.mastery} />
        </div>
      </div>
    </button>
  );
}

function ReviewRoadmapCard({
  review,
  connectionHighlighted,
  onHighlightChange,
  onOpen,
  onRemove,
  position,
}: {
  review: TeacherRoadmap["reviewNodes"][number];
  connectionHighlighted: boolean;
  onHighlightChange: (active: boolean) => void;
  onOpen: () => void;
  onRemove: () => void;
  position: BoardPoint;
}) {
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
    },
    [],
  );

  const cancelOpen = () => {
    if (!openTimerRef.current) return;
    clearTimeout(openTimerRef.current);
    openTimerRef.current = null;
  };
  const removeReview = () => {
    cancelOpen();
    onRemove();
  };

  return (
    <div
      aria-label={`Повторение задания ${review.sourceExamNumber}: ${review.title}`}
      className={`roadmap-node absolute cursor-pointer overflow-hidden rounded-[1.5rem] border-2 border-[#784714] bg-[#965b1d] p-7 text-left text-white shadow-[0_16px_38px_rgba(91,52,12,0.22)] transition-[box-shadow,transform] duration-300 hover:-translate-y-1.5 hover:bg-[#865019] hover:shadow-[0_22px_48px_rgba(91,52,12,0.3)] focus-visible:ring-4 focus-visible:ring-[#d8bd98] ${
        connectionHighlighted ? "roadmap-node--linked-review" : ""
      }`}
      onBlur={() => onHighlightChange(false)}
      onClick={() => {
        cancelOpen();
        openTimerRef.current = setTimeout(onOpen, 260);
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        removeReview();
      }}
      onDoubleClick={(event) => {
        event.preventDefault();
        removeReview();
      }}
      onFocus={() => onHighlightChange(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          cancelOpen();
          onOpen();
        }
      }}
      onPointerEnter={() => onHighlightChange(true)}
      onPointerLeave={() => onHighlightChange(false)}
      role="button"
      style={{
        height: REVIEW_CARD_HEIGHT,
        left: position.x,
        top: position.y,
        width: REVIEW_CARD_WIDTH,
      }}
      tabIndex={0}
      title="Двойной клик или правая кнопка — убрать повторение"
    >
      <button
        aria-label="Удалить повторение"
        className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl border border-white/30 bg-white/15 text-white transition hover:bg-white/25"
        onClick={(event) => {
          event.stopPropagation();
          removeReview();
        }}
        onPointerDown={(event) => event.stopPropagation()}
        type="button"
      >
        <Trash2 className="size-4" />
      </button>
      <div className="flex items-start gap-4">
        <NumberBurst
          background="rgb(255 255 255 / 22%)"
          color="#ffffff"
          value={review.sourceExamNumber}
        />
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-white/80">
            Повторение
          </p>
          <h3 className="mt-1 line-clamp-2 pr-10 text-[29px] font-bold leading-[1.1] tracking-[-0.045em] text-white">
            {review.title}
          </h3>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {review.subtopics.slice(0, 3).map((subtopic) => (
          <span
            className="max-w-full truncate rounded-full border border-white/35 bg-white/15 px-3.5 py-2 text-sm font-bold text-white"
            key={subtopic.code}
          >
            {subtopic.name}
          </span>
        ))}
        {review.subtopics.length > 3 && (
          <span className="rounded-full border border-white/35 bg-white/15 px-3.5 py-2 text-sm font-bold text-white">
            +{review.subtopics.length - 3}
          </span>
        )}
      </div>
    </div>
  );
}

function RoadmapOrderEditor({
  error,
  examNumbers,
  isDirty,
  isSaving,
  nodesByExamNumber,
  onCancel,
  onMove,
  onReset,
  onSave,
  onSort,
}: {
  error: string | null;
  examNumbers: number[];
  isDirty: boolean;
  isSaving: boolean;
  nodesByExamNumber: Map<number, TeacherRoadmapNode>;
  onCancel: () => void;
  onMove: (examNumber: number, direction: -1 | 1) => void;
  onReset: () => void;
  onSave: () => void;
  onSort: (draggedExamNumber: number, targetExamNumber: number) => void;
}) {
  const [draggedExamNumber, setDraggedExamNumber] = useState<number | null>(
    null,
  );

  const dropBefore = (
    event: DragEvent<HTMLDivElement>,
    targetExamNumber: number,
  ) => {
    event.preventDefault();
    if (draggedExamNumber === null || draggedExamNumber === targetExamNumber) {
      return;
    }
    onSort(draggedExamNumber, targetExamNumber);
    setDraggedExamNumber(null);
  };

  return (
    <aside
      className="absolute bottom-5 right-5 top-20 z-40 flex w-[390px] max-w-[calc(100%-2.5rem)] flex-col overflow-hidden overscroll-contain rounded-[1.75rem] border border-[#bad2e6] bg-white/96 shadow-[0_26px_75px_rgba(9,47,78,0.22)] backdrop-blur-xl"
      onPointerDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand">
              Порядок ученика
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-[-0.04em] text-ink">
              Перетащите задания
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted">
              Верхнее задание ученик проходит раньше.
            </p>
          </div>
          <button
            aria-label="Закрыть редактор порядка"
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-line bg-white text-muted transition hover:text-ink"
            onClick={onCancel}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {examNumbers.map((examNumber, index) => {
          const node = nodesByExamNumber.get(examNumber);
          return (
            <div
              className={`group flex items-center gap-2 rounded-2xl border bg-white p-2.5 transition ${
                draggedExamNumber === examNumber
                  ? "border-brand opacity-55 shadow-sm"
                  : "border-line hover:border-[#a8c7df] hover:shadow-sm"
              }`}
              draggable={!isSaving}
              key={examNumber}
              onDragEnd={() => setDraggedExamNumber(null)}
              onDragOver={(event) => event.preventDefault()}
              onDragStart={(event) => {
                setDraggedExamNumber(examNumber);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDrop={(event) => dropBefore(event, examNumber)}
            >
              <GripVertical className="size-5 shrink-0 cursor-grab text-[#9ba9b5] group-active:cursor-grabbing" />
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#eaf4fc] text-xs font-extrabold text-brand">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">
                  <span className="mr-1.5 text-brand">№{examNumber}</span>
                  {node?.title ?? `Задание ${examNumber}`}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-muted">
                  Освоено {Math.round((node?.mastery ?? 0) * 100)}%
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  aria-label={`Переместить задание ${examNumber} раньше`}
                  className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted transition hover:bg-[#edf5fb] hover:text-brand disabled:cursor-default disabled:opacity-25"
                  disabled={index === 0 || isSaving}
                  onClick={() => onMove(examNumber, -1)}
                  type="button"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  aria-label={`Переместить задание ${examNumber} позже`}
                  className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted transition hover:bg-[#edf5fb] hover:text-brand disabled:cursor-default disabled:opacity-25"
                  disabled={index === examNumbers.length - 1 || isSaving}
                  onClick={() => onMove(examNumber, 1)}
                  type="button"
                >
                  <ArrowDown className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-line bg-[#f8fbfd] p-3">
        {error && (
          <p className="mb-2 rounded-xl bg-[#fff0ed] px-3 py-2 text-xs font-bold text-[#a74a34]">
            {error}
          </p>
        )}
        <div className="mb-2 flex items-center justify-between">
          <button
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl px-3 text-xs font-bold text-muted transition hover:bg-white hover:text-brand"
            disabled={isSaving}
            onClick={onReset}
            type="button"
          >
            <RotateCcw className="size-3.5" />
            По номерам
          </button>
          {isDirty && (
            <span className="text-xs font-bold text-[#b36a09]">
              Есть несохранённые изменения
            </span>
          )}
        </div>
        <button
          className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-brand px-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(11,73,119,0.2)] transition hover:bg-[#083d65] disabled:cursor-wait disabled:opacity-60"
          disabled={!isDirty || isSaving}
          onClick={onSave}
          type="button"
        >
          {isSaving ? (
            "Сохраняем порядок…"
          ) : (
            <>
              {isDirty ? (
                <Save className="size-4" />
              ) : (
                <Check className="size-4" />
              )}
              {isDirty ? "Сохранить порядок" : "Порядок сохранён"}
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

type TeacherRoadmapBoardProps = {
  roadmap: TeacherRoadmap;
  editMode: boolean;
  header?: ReactNode;
  isOrderSaving?: boolean;
  paused?: boolean;
  selectedExamNumber: number | null;
  onEditModeToggle: () => void;
  onCustomOpen: (moduleKey: string) => void;
  onNodeOpen: (examNumber: number) => void;
  onOrderSave: (examNumbers: number[]) => Promise<void>;
  onReviewRemove: (examNumber: number) => void;
};

export function TeacherRoadmapBoard({
  roadmap,
  editMode,
  header,
  isOrderSaving = false,
  paused = false,
  selectedExamNumber,
  onEditModeToggle,
  onCustomOpen,
  onNodeOpen,
  onOrderSave,
  onReviewRemove,
}: TeacherRoadmapBoardProps) {
  const viewportElementRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scaleLabelRef = useRef<HTMLSpanElement>(null);
  const viewportStateRef = useRef<Viewport>({
    x: 0,
    y: 0,
    scale: 0.58,
  });
  const pendingViewportRef = useRef<Viewport | null>(null);
  const viewportFrameRef = useRef<number | null>(null);
  const viewportAnimationTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [highlightedLink, setHighlightedLink] = useState<HighlightedLink>(null);
  const [orderSaveError, setOrderSaveError] = useState<string | null>(null);
  const [draftExamOrder, setDraftExamOrder] = useState<number[]>(
    () =>
      roadmap.route.examOrder ?? roadmap.nodes.map((node) => node.examNumber),
  );
  const serverExamOrder = useMemo(
    () =>
      roadmap.route.examOrder ?? roadmap.nodes.map((node) => node.examNumber),
    [roadmap.nodes, roadmap.route.examOrder],
  );
  const serverExamOrderKey = serverExamOrder.join(",");

  useEffect(() => {
    if (!editMode) setDraftExamOrder(serverExamOrder);
  }, [editMode, serverExamOrder, serverExamOrderKey]);

  const nodesByExamNumber = useMemo(
    () => new Map(roadmap.nodes.map((node) => [node.examNumber, node])),
    [roadmap.nodes],
  );
  const displayedNodes = useMemo(
    () =>
      (editMode ? draftExamOrder : serverExamOrder)
        .map((examNumber) => nodesByExamNumber.get(examNumber))
        .filter((node): node is TeacherRoadmapNode => Boolean(node)),
    [draftExamOrder, editMode, nodesByExamNumber, serverExamOrder],
  );
  const nodeLayouts = useMemo(
    () =>
      new Map(
        displayedNodes.map((node, index) => [
          node.examNumber,
          nodeLayoutAt(index),
        ]),
      ),
    [displayedNodes],
  );
  const nodeLayoutsRef = useRef(nodeLayouts);
  nodeLayoutsRef.current = nodeLayouts;
  const visibleCustomNodes = useMemo(
    () =>
      editMode
        ? roadmap.customNodes
        : roadmap.customNodes.filter((module) => !module.isHidden),
    [editMode, roadmap.customNodes],
  );
  const reviewPositions = useMemo(
    () => buildReviewPositions(roadmap.reviewNodes, nodeLayouts),
    [nodeLayouts, roadmap.reviewNodes],
  );
  const reviewBottom = Math.max(
    0,
    ...reviewPositions.map((position) => position.y + REVIEW_CARD_HEIGHT),
  );
  const customStartY = Math.max(DEFAULT_CUSTOM_START_Y, reviewBottom + 130);
  const customBottom =
    visibleCustomNodes.length > 0
      ? customStartY +
        (Math.ceil(visibleCustomNodes.length / 4) - 1) * ROW_GAP +
        CARD_HEIGHT
      : 0;
  const canvasHeight = Math.max(BOARD_HEIGHT, reviewBottom, customBottom) + 120;
  const routePaths = useMemo(
    () =>
      displayedNodes
        .slice(0, -1)
        .map((node, index) =>
          connectionPath(
            getNodeLayout(nodeLayouts, node.examNumber),
            getNodeLayout(nodeLayouts, displayedNodes[index + 1]!.examNumber),
          ),
        ),
    [displayedNodes, nodeLayouts],
  );
  const trainRoutePath = useMemo(
    () =>
      displayedNodes
        .map((node, index) => {
          const center = nodeCenter(
            getNodeLayout(nodeLayouts, node.examNumber),
          );
          return `${index === 0 ? "M" : "L"} ${center.x} ${center.y}`;
        })
        .join(" "),
    [displayedNodes, nodeLayouts],
  );
  const reviewPaths = useMemo(
    () =>
      roadmap.reviewNodes.map((review, index) =>
        reviewConnectionPath(
          review,
          reviewPositions[index]!,
          index,
          getNodeLayout(nodeLayouts, review.sourceExamNumber),
        ),
      ),
    [nodeLayouts, reviewPositions, roadmap.reviewNodes],
  );
  const reviewByExamNumber = useMemo(
    () =>
      new Map(
        roadmap.reviewNodes.map((review) => [review.sourceExamNumber, review]),
      ),
    [roadmap.reviewNodes],
  );
  const customPath =
    visibleCustomNodes.length > 0 && displayedNodes.length > 0
      ? pathBetween(
          nodeBox(
            getNodeLayout(
              nodeLayouts,
              displayedNodes[displayedNodes.length - 1]!.examNumber,
            ),
          ),
          customNodeBox(0, customStartY),
        )
      : "";
  const lastExamNumber =
    displayedNodes[displayedNodes.length - 1]?.examNumber ?? 19;
  const highlightedReviewIndex =
    highlightedLink?.kind === "review"
      ? roadmap.reviewNodes.findIndex(
          (review) => review.moduleKey === highlightedLink.moduleKey,
        )
      : -1;
  const highlightedReviewPath =
    highlightedReviewIndex >= 0
      ? (reviewPaths[highlightedReviewIndex] ?? "")
      : "";

  const applyViewport = useCallback((next: Viewport, animate = false) => {
    viewportStateRef.current = next;

    const commitViewport = () => {
      const viewportToCommit = pendingViewportRef.current ?? next;
      pendingViewportRef.current = null;
      viewportFrameRef.current = null;
      const canvas = canvasRef.current;

      if (viewportAnimationTimerRef.current) {
        clearTimeout(viewportAnimationTimerRef.current);
        viewportAnimationTimerRef.current = null;
      }

      if (canvas) {
        canvas.classList.toggle("roadmap-canvas--animated", animate);
        canvas.style.transform = `translate3d(${viewportToCommit.x}px, ${viewportToCommit.y}px, 0) scale(${viewportToCommit.scale})`;
        if (animate) {
          viewportAnimationTimerRef.current = setTimeout(() => {
            canvas.classList.remove("roadmap-canvas--animated");
            viewportAnimationTimerRef.current = null;
          }, 620);
        }
      }

      if (scaleLabelRef.current) {
        scaleLabelRef.current.textContent = `${Math.round(viewportToCommit.scale * 100)}%`;
      }
    };

    if (animate) {
      if (viewportFrameRef.current !== null) {
        cancelAnimationFrame(viewportFrameRef.current);
        viewportFrameRef.current = null;
      }
      pendingViewportRef.current = next;
      commitViewport();
      return;
    }

    pendingViewportRef.current = next;
    if (viewportFrameRef.current === null) {
      viewportFrameRef.current = requestAnimationFrame(commitViewport);
    }
  }, []);

  const fitRoute = useCallback(() => {
    const element = viewportElementRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const scale = Math.max(
      MIN_SCALE,
      Math.min(
        0.9,
        (bounds.width - 48) / BOARD_WIDTH,
        (bounds.height - 48) / canvasHeight,
      ),
    );
    applyViewport(
      {
        scale,
        x: (bounds.width - BOARD_WIDTH * scale) / 2,
        y: (bounds.height - canvasHeight * scale) / 2,
      },
      true,
    );
  }, [applyViewport, canvasHeight]);

  const centerNode = useCallback(
    (examNumber: number) => {
      const element = viewportElementRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const center = nodeCenter(
        getNodeLayout(nodeLayoutsRef.current, examNumber),
      );
      const current = viewportStateRef.current;
      applyViewport(
        {
          scale: current.scale,
          x: bounds.width / 2 - center.x * current.scale,
          y: bounds.height / 2 - center.y * current.scale,
        },
        true,
      );
    },
    [applyViewport],
  );

  useLayoutEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      const element = viewportElementRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const scale = bounds.width < 700 ? 0.42 : 0.58;
      const center = nodeCenter(
        getNodeLayout(nodeLayoutsRef.current, roadmap.route.currentExamNumber),
      );
      applyViewport({
        scale,
        x: bounds.width / 2 - center.x * scale,
        y: bounds.height / 2 - center.y * scale,
      });
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [applyViewport, roadmap.route.currentExamNumber]);

  useEffect(
    () => () => {
      if (viewportFrameRef.current !== null) {
        cancelAnimationFrame(viewportFrameRef.current);
      }
      if (viewportAnimationTimerRef.current) {
        clearTimeout(viewportAnimationTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const viewport = viewportElementRef.current;
    if (!viewport) return;

    let isVisible = true;
    const updateAnimationState = () => {
      viewport.classList.toggle(
        "roadmap-viewport--paused",
        document.hidden || !isVisible,
      );
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false;
        updateAnimationState();
      },
      { rootMargin: "160px" },
    );

    observer.observe(viewport);
    document.addEventListener("visibilitychange", updateAnimationState);
    updateAnimationState();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateAnimationState);
    };
  }, []);

  const setScaleAtPoint = useCallback(
    (
      nextScale: number,
      clientX?: number,
      clientY?: number,
      animate = false,
    ) => {
      const element = viewportElementRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const pointX = (clientX ?? bounds.left + bounds.width / 2) - bounds.left;
      const pointY = (clientY ?? bounds.top + bounds.height / 2) - bounds.top;

      const current = viewportStateRef.current;
      const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
      const worldX = (pointX - current.x) / current.scale;
      const worldY = (pointY - current.y) / current.scale;
      applyViewport(
        {
          scale,
          x: pointX - worldX * scale,
          y: pointY - worldY * scale,
        },
        animate,
      );
    },
    [applyViewport],
  );

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      const factor = Math.exp(-event.deltaY * 0.009);
      setScaleAtPoint(
        viewportStateRef.current.scale * factor,
        event.clientX,
        event.clientY,
      );
      return;
    }
    const current = viewportStateRef.current;
    applyViewport({
      scale: current.scale,
      x: current.x - event.deltaX,
      y: current.y - event.deltaY,
    });
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: viewportStateRef.current.x,
      startY: viewportStateRef.current.y,
    };
    setIsDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    applyViewport({
      scale: viewportStateRef.current.scale,
      x: drag.startX + event.clientX - drag.x,
      y: drag.startY + event.clientY - drag.y,
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
  };

  const draftExamOrderKey = draftExamOrder.join(",");
  const isOrderDirty = draftExamOrderKey !== serverExamOrderKey;
  const moveExam = (examNumber: number, direction: -1 | 1) => {
    setOrderSaveError(null);
    setDraftExamOrder((current) => {
      const fromIndex = current.indexOf(examNumber);
      const toIndex = fromIndex + direction;
      if (fromIndex < 0 || toIndex < 0 || toIndex >= current.length) {
        return current;
      }
      const next = [...current];
      [next[fromIndex], next[toIndex]] = [next[toIndex]!, next[fromIndex]!];
      return next;
    });
  };
  const sortExamBefore = (
    draggedExamNumber: number,
    targetExamNumber: number,
  ) => {
    setOrderSaveError(null);
    setDraftExamOrder((current) => {
      const fromIndex = current.indexOf(draggedExamNumber);
      if (fromIndex < 0) return current;
      const next = current.filter(
        (examNumber) => examNumber !== draggedExamNumber,
      );
      const targetIndex = next.indexOf(targetExamNumber);
      if (targetIndex < 0) return current;
      next.splice(targetIndex, 0, draggedExamNumber);
      return next;
    });
  };
  const cancelOrderEditing = () => {
    setDraftExamOrder(serverExamOrder);
    setOrderSaveError(null);
    onEditModeToggle();
  };
  const saveOrder = async () => {
    if (!isOrderDirty || isOrderSaving) return;
    setOrderSaveError(null);
    try {
      await onOrderSave(draftExamOrder);
      onEditModeToggle();
    } catch (error) {
      setOrderSaveError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить порядок заданий.",
      );
    }
  };

  return (
    <section className="flex h-dvh min-h-0 flex-col overflow-hidden border-line bg-[#f5f8fa]">
      <div className="relative z-50 flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#d4dee5] bg-[#fbfcfd]/96 px-4 py-2.5 shadow-[0_4px_18px_rgba(25,50,70,0.06)] backdrop-blur-xl sm:px-5">
        <div className="min-w-0">{header}</div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Уменьшить масштаб"
            className="roadmap-toolbar-button"
            onClick={() =>
              setScaleAtPoint(
                viewportStateRef.current.scale - 0.12,
                undefined,
                undefined,
                true,
              )
            }
            type="button"
          >
            <Minus className="size-4" />
          </button>
          <span
            className="min-w-12 text-center text-xs font-bold text-muted"
            ref={scaleLabelRef}
          >
            58%
          </span>
          <button
            aria-label="Увеличить масштаб"
            className="roadmap-toolbar-button"
            onClick={() =>
              setScaleAtPoint(
                viewportStateRef.current.scale + 0.12,
                undefined,
                undefined,
                true,
              )
            }
            type="button"
          >
            <Plus className="size-4" />
          </button>
          <button
            aria-label="Поместить весь маршрут в экран"
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#cbd6de] bg-white px-3 text-xs font-bold text-muted transition hover:border-[#789bb3] hover:text-brand"
            onClick={fitRoute}
            title="Весь маршрут"
            type="button"
          >
            <Maximize2 className="size-4" />
            <span className="hidden xl:inline">Весь маршрут</span>
          </button>
          <button
            aria-label="Вернуться к текущей теме"
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#cbd6de] bg-white px-3 text-xs font-bold text-muted transition hover:border-[#789bb3] hover:text-brand"
            onClick={() => centerNode(roadmap.route.currentExamNumber)}
            title="Текущая тема"
            type="button"
          >
            <Crosshair className="size-4" />
            <span className="hidden xl:inline">Текущая задача</span>
          </button>
          <button
            aria-label="Редактировать"
            className={`ml-1 inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
              editMode
                ? "border-brand bg-brand text-white"
                : "border-[#cbd6de] bg-white text-muted hover:border-[#789bb3] hover:text-brand"
            }`}
            onClick={editMode ? cancelOrderEditing : onEditModeToggle}
            type="button"
          >
            <Edit3 className="size-4" />
            <span className="hidden sm:inline">
              {editMode ? "Закрыть" : "Изменить порядок"}
            </span>
          </button>
        </div>
      </div>

      <div
        className={`roadmap-viewport relative min-h-0 flex-1 overflow-hidden bg-[#f5f8fa] touch-none ${
          isDragging
            ? "roadmap-viewport--dragging cursor-grabbing"
            : "cursor-grab"
        } ${paused ? "roadmap-viewport--paused" : ""}`}
        onPointerCancel={endDrag}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onWheel={onWheel}
        ref={viewportElementRef}
      >
        <div className="pointer-events-none absolute left-5 top-4 z-30 inline-flex items-center gap-2 rounded-lg border border-[#cbd6de] bg-white/94 px-3 py-2 text-xs font-semibold text-muted shadow-sm backdrop-blur">
          <Move className="size-4 text-brand" />
          Тяните доску · масштабируйте жестом
        </div>

        {editMode && (
          <RoadmapOrderEditor
            error={orderSaveError}
            examNumbers={draftExamOrder}
            isDirty={isOrderDirty}
            isSaving={isOrderSaving}
            nodesByExamNumber={nodesByExamNumber}
            onCancel={cancelOrderEditing}
            onMove={moveExam}
            onReset={() => {
              setOrderSaveError(null);
              setDraftExamOrder(
                Array.from({ length: 19 }, (_, index) => index + 1),
              );
            }}
            onSave={() => void saveOrder()}
            onSort={sortExamBefore}
          />
        )}

        <div
          className="roadmap-canvas absolute left-0 top-0 origin-top-left"
          ref={canvasRef}
          style={{
            height: canvasHeight,
            width: BOARD_WIDTH,
          }}
        >
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-visible"
            height={canvasHeight}
            viewBox={`0 0 ${BOARD_WIDTH} ${canvasHeight}`}
            width={BOARD_WIDTH}
          >
            <defs>
              <marker
                id="roadmap-arrow-main"
                markerHeight="22"
                markerUnits="userSpaceOnUse"
                markerWidth="24"
                orient="auto"
                refX="21"
                refY="11"
                viewBox="0 0 24 22"
              >
                <path
                  className="roadmap-arrow-head"
                  d="M0,0 L24,11 L0,22 Z"
                  fill="#286f96"
                />
              </marker>
              <marker
                id="roadmap-arrow-custom"
                markerHeight="20"
                markerUnits="userSpaceOnUse"
                markerWidth="22"
                orient="auto"
                refX="19"
                refY="10"
                viewBox="0 0 22 20"
              >
                <path
                  className="roadmap-arrow-head"
                  d="M0,0 L22,10 L0,20 Z"
                  fill="#966329"
                />
              </marker>
              <marker
                id="roadmap-arrow-review"
                markerHeight="24"
                markerUnits="userSpaceOnUse"
                markerWidth="26"
                orient="auto"
                refX="23"
                refY="12"
                viewBox="0 0 26 24"
              >
                <path
                  className="roadmap-arrow-head"
                  d="M0,0 L26,12 L0,24 Z"
                  fill="#8b5319"
                />
              </marker>
            </defs>
            <path
              className="roadmap-route-glow"
              d={routePaths.join(" ")}
              fill="none"
              stroke="#89aec1"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="36"
            />
            {displayedNodes.slice(0, -1).map((node, index) => {
              const to = displayedNodes[index + 1]!.examNumber;
              return (
                <ConnectionPath
                  color="#3d86aa"
                  d={routePaths[index] ?? ""}
                  markerEnd="url(#roadmap-arrow-main)"
                  key={`main-${node.examNumber}`}
                  onActiveChange={(active) =>
                    setHighlightedLink(
                      active
                        ? { kind: "route", from: node.examNumber, to }
                        : null,
                    )
                  }
                  width={12}
                />
              );
            })}
            {roadmap.reviewNodes.map((review, index) => (
              <ConnectionPath
                active={
                  highlightedLink?.kind === "review" &&
                  highlightedLink.moduleKey === review.moduleKey
                }
                color="#b39368"
                d={reviewPaths[index] ?? ""}
                kind="review"
                key={`review-${review.moduleKey}`}
                markerEnd="url(#roadmap-arrow-review)"
                onActiveChange={(active) =>
                  setHighlightedLink(
                    active
                      ? {
                          kind: "review",
                          from: review.sourceExamNumber,
                          moduleKey: review.moduleKey,
                        }
                      : null,
                  )
                }
                width={11}
              />
            ))}
            {visibleCustomNodes.length > 0 && (
              <ConnectionPath
                color="#b39a77"
                d={customPath}
                kind="custom"
                markerEnd="url(#roadmap-arrow-custom)"
                onActiveChange={(active) =>
                  setHighlightedLink(
                    active ? { kind: "custom", from: lastExamNumber } : null,
                  )
                }
                width={10}
              />
            )}
            <FlowingDotsPath
              color="#ffffff"
              d={routePaths.join(" ")}
              width={7}
            />
            <FlowingDotsPath
              color="#6f4217"
              d={highlightedReviewPath}
              width={7}
            />
            <FlowingDotsPath color="#74502e" d={customPath} width={7} />
          </svg>

          {[0, 1, 2].map((trainIndex) => (
            <div
              aria-hidden
              className="roadmap-train pointer-events-none absolute left-0 top-0"
              key={trainIndex}
              style={
                {
                  animationDelay: `${trainIndex * -10}s`,
                  offsetPath: `path("${trainRoutePath}")`,
                } as CSSProperties
              }
            >
              <span className="roadmap-train-light absolute -inset-2 rounded-xl bg-[#729eb4]/25 blur-sm" />
              <span className="relative grid size-14 place-items-center rounded-xl border-[3px] border-white bg-[#145d82] text-white shadow-[0_8px_18px_rgba(20,72,101,0.3)]">
                <TrainFront className="size-7" strokeWidth={2.5} />
              </span>
            </div>
          ))}

          {displayedNodes.map((node, index) => {
            const linkedReview = reviewByExamNumber.get(node.examNumber);
            const layout = getNodeLayout(nodeLayouts, node.examNumber);

            return (
              <div
                className="pointer-events-auto"
                key={node.examNumber}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <RoadmapCard
                  connectionHighlighted={
                    highlightedLink?.from === node.examNumber ||
                    (highlightedLink?.kind === "route" &&
                      highlightedLink.to === node.examNumber)
                  }
                  editMode={editMode}
                  node={node}
                  onOpen={() => {
                    onNodeOpen(node.examNumber);
                    centerNode(node.examNumber);
                  }}
                  onReviewHighlightChange={
                    linkedReview
                      ? (active) =>
                          setHighlightedLink(
                            active
                              ? {
                                  kind: "review",
                                  from: node.examNumber,
                                  moduleKey: linkedReview.moduleKey,
                                }
                              : null,
                          )
                      : undefined
                  }
                  position={layout}
                  routeStep={index + 1}
                  selected={selectedExamNumber === node.examNumber}
                />
              </div>
            );
          })}

          {roadmap.reviewNodes.map((review, index) => (
            <div
              className="pointer-events-auto"
              key={review.moduleKey}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <ReviewRoadmapCard
                connectionHighlighted={
                  highlightedLink?.kind === "review" &&
                  highlightedLink.moduleKey === review.moduleKey
                }
                onOpen={() => {
                  onNodeOpen(review.sourceExamNumber);
                  centerNode(review.sourceExamNumber);
                }}
                onHighlightChange={(active) =>
                  setHighlightedLink(
                    active
                      ? {
                          kind: "review",
                          from: review.sourceExamNumber,
                          moduleKey: review.moduleKey,
                        }
                      : null,
                  )
                }
                onRemove={() => onReviewRemove(review.sourceExamNumber)}
                position={reviewPositions[index]!}
                review={review}
              />
            </div>
          ))}

          {visibleCustomNodes.length > 0 && (
            <div
              className="pointer-events-none absolute flex items-center gap-3"
              style={{ left: START_X, top: customStartY - 64 }}
            >
              <span className="grid size-9 place-items-center rounded-lg bg-[#eadbc4] font-extrabold text-[#76502a]">
                +
              </span>
              <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#76502a]">
                Дополнительные темы преподавателя
              </span>
            </div>
          )}
          {visibleCustomNodes.map((module, index) => {
            const position = customNodePosition(index, customStartY);
            return (
              <button
                className={`roadmap-node pointer-events-auto absolute cursor-pointer overflow-hidden rounded-[1.5rem] border-2 border-[#c6a87d] bg-[#faf7f1] p-7 text-left shadow-[0_14px_34px_rgba(91,65,34,0.11)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_44px_rgba(91,65,34,0.18)] ${
                  highlightedLink?.kind === "custom" && index === 0
                    ? "roadmap-node--linked-custom"
                    : ""
                }`}
                key={module.moduleKey}
                onClick={() => onCustomOpen(module.moduleKey)}
                onPointerDown={(event) => event.stopPropagation()}
                style={{
                  height: CARD_HEIGHT,
                  left: position.x,
                  top: position.y,
                  width: CARD_WIDTH,
                }}
                type="button"
              >
                <div className="flex items-start gap-4">
                  <span className="grid size-20 shrink-0 place-items-center rounded-xl bg-[#eadbc4] text-base font-extrabold text-[#76502a]">
                    ДОП
                  </span>
                  <div className="min-w-0">
                    <span className="rounded-lg border border-[#c6a87d] bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#76502a]">
                      Тема преподавателя
                    </span>
                    <h3 className="mt-3 line-clamp-2 text-[30px] font-bold leading-[1.12] tracking-[-0.04em] text-ink">
                      {module.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-5 line-clamp-2 text-base leading-7 text-muted">
                  {module.description}
                </p>
                <div className="absolute inset-x-6 bottom-5 flex items-center justify-between border-t border-line pt-3 text-[13px] font-semibold text-muted">
                  <span>{module.estimatedMinutes} минут</span>
                  <span>
                    {module.status === "COMPLETED"
                      ? "Завершено"
                      : module.status === "BLOCKED"
                        ? "Нужна база"
                        : "В маршруте"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
