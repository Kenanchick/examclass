"use client";

import {
  Crosshair,
  Edit3,
  Maximize2,
  Minus,
  Move,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
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
const REVIEW_FALLBACK_START_Y = 2740;
const DEFAULT_CUSTOM_START_Y = 3240;
const MIN_SCALE = 0.24;
const MAX_SCALE = 1.45;
const ARROW_END_GAP = 30;

type Viewport = { x: number; y: number; scale: number };
type BoardBox = { x: number; y: number; width: number; height: number };
type HighlightedLink =
  | { kind: "route"; from: number; to: number }
  | { kind: "review"; from: number; moduleKey: string }
  | { kind: "custom"; from: number }
  | null;

const statusPresentation: Record<
  TeacherRoadmapStatus,
  { color: string; background: string; border: string }
> = {
  MASTERED: {
    color: "#287651",
    background: "#edf8f2",
    border: "#a9d8bf",
  },
  LEARNING: {
    color: "#725211",
    background: "#fff8e8",
    border: "#ead19a",
  },
  CURRENT_PRIORITY: {
    color: "#ffffff",
    background: "#0b4977",
    border: "#0b4977",
  },
  AVAILABLE: {
    color: "#315c7e",
    background: "#f2f7fb",
    border: "#c8d8e5",
  },
  BLOCKED: {
    color: "#6c7279",
    background: "#f4f5f6",
    border: "#d5d9dd",
  },
  NEEDS_REVIEW: {
    color: "#9a4e32",
    background: "#fff2ed",
    border: "#e8bbaa",
  },
  INSUFFICIENT_DATA: {
    color: "#67547d",
    background: "#f7f2fb",
    border: "#d9c8e6",
  },
  TEACHER_ASSIGNED: {
    color: "#315394",
    background: "#eef3ff",
    border: "#b6c8ec",
  },
};

const nodeGridPosition = (examNumber: number) => {
  const index = examNumber - 1;
  const row = Math.floor(index / 4);
  const offset = index % 4;
  return { row, column: row % 2 === 0 ? offset : 3 - offset };
};

const nodePosition = (examNumber: number) => {
  const { row, column } = nodeGridPosition(examNumber);
  return {
    x: START_X + column * COLUMN_GAP,
    y: START_Y + row * ROW_GAP,
  };
};

const nodeBox = (examNumber: number): BoardBox => ({
  ...nodePosition(examNumber),
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
});

const nodeCenter = (examNumber: number) => {
  const position = nodePosition(examNumber);
  return {
    x: position.x + CARD_WIDTH / 2,
    y: position.y + CARD_HEIGHT / 2,
  };
};

const reviewNodePosition = (
  review: TeacherRoadmap["reviewNodes"][number],
  index: number,
) => {
  const source = nodePosition(review.sourceExamNumber);
  const { row, column } = nodeGridPosition(review.sourceExamNumber);

  if (column === 0) {
    return { x: 60, y: source.y - 10 };
  }
  if (row === 0) {
    return {
      x: source.x + (CARD_WIDTH - REVIEW_CARD_WIDTH) / 2,
      y: 70,
    };
  }
  if (column === 3) {
    return { x: source.x + CARD_WIDTH + 110, y: source.y - 10 };
  }
  if (row === 4) {
    return {
      x: source.x + (CARD_WIDTH - REVIEW_CARD_WIDTH) / 2,
      y: source.y + CARD_HEIGHT + 110,
    };
  }

  return {
    x: START_X + (index % 4) * COLUMN_GAP,
    y: REVIEW_FALLBACK_START_Y + Math.floor(index / 4) * ROW_GAP,
  };
};

const reviewBox = (
  review: TeacherRoadmap["reviewNodes"][number],
  index: number,
): BoardBox => ({
  ...reviewNodePosition(review, index),
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

const connectionPath = (from: number, to: number) => {
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
  review: TeacherRoadmap["reviewNodes"][number],
  index: number,
) => pathBetween(nodeBox(review.sourceExamNumber), reviewBox(review, index));

function AnimatedConnectionPath({
  color,
  d,
  markerEnd,
  onActiveChange,
  shimmerColor,
  width,
}: {
  color: string;
  d: string;
  markerEnd: string;
  onActiveChange?: (active: boolean) => void;
  shimmerColor: string;
  width: number;
}) {
  const setActive = (active: boolean) => {
    onActiveChange?.(active);
  };

  return (
    <g className="roadmap-link-group">
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
        className="roadmap-link-shimmer"
        d={d}
        fill="none"
        pathLength="1"
        stroke={shimmerColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={Math.max(2.5, width * 0.36)}
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
  onOpen,
  selected,
}: {
  node: TeacherRoadmapNode;
  connectionHighlighted: boolean;
  onOpen: () => void;
  selected: boolean;
}) {
  const presentation = statusPresentation[node.status];
  const position = nodePosition(node.examNumber);
  const isPerfect = node.mastery >= 0.995;

  return (
    <button
      aria-label={`Задание ${node.examNumber}: ${node.title}`}
      className={`roadmap-node absolute cursor-pointer overflow-hidden rounded-[2rem] border bg-white p-7 text-left shadow-[0_16px_40px_rgba(20,55,88,0.09)] outline-none transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_54px_rgba(20,55,88,0.16)] focus-visible:ring-4 focus-visible:ring-[#b8d7f4] ${
        node.isCurrent ? "roadmap-node--current" : ""
      } ${isPerfect ? "roadmap-node--perfect" : ""} ${
        selected ? "ring-4 ring-[#c9e2f8]" : ""
      } ${connectionHighlighted ? "roadmap-node--linked" : ""}`}
      onClick={onOpen}
      style={
        {
          "--roadmap-border": presentation.border,
          borderColor: presentation.border,
          height: CARD_HEIGHT,
          left: position.x,
          top: position.y,
          width: CARD_WIDTH,
        } as CSSProperties
      }
      type="button"
    >
      {isPerfect && (
        <span
          aria-hidden
          className="roadmap-perfect-shine pointer-events-none absolute inset-0"
        />
      )}
      <div className="flex h-full items-center gap-7">
        <span
          className="relative grid size-24 shrink-0 place-items-center rounded-[1.55rem] text-[28px] font-extrabold"
          style={{
            background: presentation.background,
            color: presentation.color,
          }}
        >
          {node.examNumber}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-3 text-[34px] font-bold leading-[1.1] tracking-[-0.045em] text-ink">
            {node.title}
          </h3>
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
  index,
  onOpen,
  onRemove,
}: {
  review: TeacherRoadmap["reviewNodes"][number];
  connectionHighlighted: boolean;
  index: number;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const position = reviewNodePosition(review, index);
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
      className={`roadmap-node absolute cursor-pointer overflow-hidden rounded-[2rem] border border-[#c96f08] bg-[#e58910] p-7 text-left text-white shadow-[0_18px_44px_rgba(184,105,0,0.24)] transition-[box-shadow,transform] duration-300 hover:-translate-y-1.5 hover:bg-[#d87908] hover:shadow-[0_26px_58px_rgba(184,105,0,0.34)] focus-visible:ring-4 focus-visible:ring-[#ffd99a] ${
        connectionHighlighted ? "roadmap-node--linked-review" : ""
      }`}
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
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          cancelOpen();
          onOpen();
        }
      }}
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
        <span className="grid size-20 shrink-0 place-items-center rounded-[1.4rem] bg-white/20 text-2xl font-extrabold text-white">
          {review.sourceExamNumber}
        </span>
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

type TeacherRoadmapBoardProps = {
  roadmap: TeacherRoadmap;
  editMode: boolean;
  selectedExamNumber: number | null;
  onEditModeToggle: () => void;
  onAddCustom: () => void;
  onCustomOpen: (moduleKey: string) => void;
  onNodeOpen: (examNumber: number) => void;
  onReviewRemove: (examNumber: number) => void;
};

export function TeacherRoadmapBoard({
  roadmap,
  editMode,
  selectedExamNumber,
  onEditModeToggle,
  onAddCustom,
  onCustomOpen,
  onNodeOpen,
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
  const visibleCustomNodes = useMemo(
    () =>
      editMode
        ? roadmap.customNodes
        : roadmap.customNodes.filter((module) => !module.isHidden),
    [editMode, roadmap.customNodes],
  );
  const reviewPositions = useMemo(
    () =>
      roadmap.reviewNodes.map((review, index) =>
        reviewNodePosition(review, index),
      ),
    [roadmap.reviewNodes],
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

  const applyViewport = useCallback((next: Viewport, animate = false) => {
    viewportStateRef.current = next;
    const canvas = canvasRef.current;

    if (viewportAnimationTimerRef.current) {
      clearTimeout(viewportAnimationTimerRef.current);
      viewportAnimationTimerRef.current = null;
    }

    if (canvas) {
      canvas.classList.toggle("roadmap-canvas--animated", animate);
      canvas.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.scale})`;
      if (animate) {
        viewportAnimationTimerRef.current = setTimeout(() => {
          canvas.classList.remove("roadmap-canvas--animated");
          viewportAnimationTimerRef.current = null;
        }, 620);
      }
    }

    if (scaleLabelRef.current) {
      scaleLabelRef.current.textContent = `${Math.round(next.scale * 100)}%`;
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
      const center = nodeCenter(examNumber);
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
      const center = nodeCenter(roadmap.route.currentExamNumber);
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
      if (viewportAnimationTimerRef.current) {
        clearTimeout(viewportAnimationTimerRef.current);
      }
    },
    [],
  );

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

  return (
    <section className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_22px_55px_rgba(15,43,76,0.07)]">
      <div className="flex flex-wrap items-center justify-end gap-3 border-b border-line px-4 py-3 sm:px-5">
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
            className="roadmap-toolbar-button"
            onClick={fitRoute}
            title="Весь маршрут"
            type="button"
          >
            <Maximize2 className="size-4" />
          </button>
          <button
            aria-label="Вернуться к текущей теме"
            className="roadmap-toolbar-button"
            onClick={() => centerNode(roadmap.route.currentExamNumber)}
            title="Текущая тема"
            type="button"
          >
            <Crosshair className="size-4" />
          </button>
          <button
            aria-label="Редактировать"
            className={`ml-1 inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-bold transition ${
              editMode
                ? "border-brand bg-brand text-white"
                : "border-line bg-white text-muted hover:text-brand"
            }`}
            onClick={onEditModeToggle}
            type="button"
          >
            <Edit3 className="size-4" />
            <span className="hidden sm:inline">Редактировать</span>
          </button>
          {editMode && (
            <button
              aria-label="Добавить"
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#dd8a12] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c97908]"
              onClick={onAddCustom}
              type="button"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Добавить</span>
            </button>
          )}
        </div>
      </div>

      <div
        className={`roadmap-viewport relative h-[760px] overflow-hidden bg-[#fbfcfe] touch-none sm:h-[860px] lg:h-[900px] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerCancel={endDrag}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onWheel={onWheel}
        ref={viewportElementRef}
      >
        <div className="pointer-events-none absolute left-5 top-4 z-30 inline-flex items-center gap-2 rounded-full border border-line bg-white/92 px-3 py-2 text-xs font-semibold text-muted shadow-sm backdrop-blur">
          <Move className="size-4 text-brand" />
          Тяните доску · масштабируйте жестом
        </div>

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
                  fill="#6f9fc5"
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
                  fill="#e19a2d"
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
                  fill="#d87300"
                />
              </marker>
            </defs>
            {roadmap.nodes.slice(0, -1).map((node) => {
              const to = node.examNumber + 1;
              return (
                <AnimatedConnectionPath
                  color="#79a8cc"
                  d={connectionPath(node.examNumber, node.examNumber + 1)}
                  markerEnd="url(#roadmap-arrow-main)"
                  key={`main-${node.examNumber}`}
                  onActiveChange={(active) =>
                    setHighlightedLink(
                      active
                        ? { kind: "route", from: node.examNumber, to }
                        : null,
                    )
                  }
                  shimmerColor="#e5f5ff"
                  width={9}
                />
              );
            })}
            {roadmap.reviewNodes.map((review, index) => (
              <AnimatedConnectionPath
                color="#d87300"
                d={reviewConnectionPath(review, index)}
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
                shimmerColor="#fff0c8"
                width={8}
              />
            ))}
            {visibleCustomNodes.length > 0 && (
              <AnimatedConnectionPath
                color="#d9901a"
                d={pathBetween(nodeBox(19), customNodeBox(0, customStartY))}
                markerEnd="url(#roadmap-arrow-custom)"
                onActiveChange={(active) =>
                  setHighlightedLink(
                    active ? { kind: "custom", from: 19 } : null,
                  )
                }
                shimmerColor="#fff0c8"
                width={7}
              />
            )}
          </svg>

          {roadmap.nodes.map((node) => (
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
                node={node}
                onOpen={() => {
                  onNodeOpen(node.examNumber);
                  centerNode(node.examNumber);
                }}
                selected={selectedExamNumber === node.examNumber}
              />
            </div>
          ))}

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
                index={index}
                onOpen={() => {
                  onNodeOpen(review.sourceExamNumber);
                  centerNode(review.sourceExamNumber);
                }}
                onRemove={() => onReviewRemove(review.sourceExamNumber)}
                review={review}
              />
            </div>
          ))}

          {visibleCustomNodes.length > 0 && (
            <div
              className="pointer-events-none absolute flex items-center gap-3"
              style={{ left: START_X, top: customStartY - 64 }}
            >
              <span className="grid size-9 place-items-center rounded-xl bg-[#fff2cf] font-extrabold text-[#ad6500]">
                +
              </span>
              <span className="text-sm font-bold uppercase tracking-[0.12em] text-[#ad6500]">
                Дополнительные темы преподавателя
              </span>
            </div>
          )}
          {visibleCustomNodes.map((module, index) => {
            const position = customNodePosition(index, customStartY);
            return (
              <button
                className={`roadmap-node pointer-events-auto absolute cursor-pointer overflow-hidden rounded-[2rem] border border-[#f0bd5f] bg-[#fffaf0] p-7 text-left shadow-[0_16px_40px_rgba(184,105,0,0.12)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_50px_rgba(184,105,0,0.2)] ${
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
                  <span className="grid size-20 shrink-0 place-items-center rounded-[1.4rem] bg-[#ffe7b0] text-base font-extrabold text-[#a85f00]">
                    ДОП
                  </span>
                  <div className="min-w-0">
                    <span className="rounded-full bg-[#ffe7b0] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#a85f00]">
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
