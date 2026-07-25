"use client";

import {
  Crosshair,
  Edit3,
  Focus,
  Maximize2,
  Minus,
  Move,
  Plus,
  Route,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
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

const BOARD_WIDTH = 2240;
const BOARD_HEIGHT = 1390;
const CARD_WIDTH = 340;
const CARD_HEIGHT = 210;
const START_X = 140;
const START_Y = 110;
const COLUMN_GAP = 420;
const ROW_GAP = 310;
const MIN_SCALE = 0.3;
const MAX_SCALE = 1.45;

type Viewport = { x: number; y: number; scale: number };

const statusPresentation: Record<
  TeacherRoadmapStatus,
  { label: string; color: string; background: string; border: string }
> = {
  MASTERED: {
    label: "Освоено",
    color: "#287651",
    background: "#edf8f2",
    border: "#a9d8bf",
  },
  LEARNING: {
    label: "Изучается",
    color: "#725211",
    background: "#fff8e8",
    border: "#ead19a",
  },
  CURRENT_PRIORITY: {
    label: "Сейчас в работе",
    color: "#ffffff",
    background: "#0b4977",
    border: "#0b4977",
  },
  AVAILABLE: {
    label: "Доступно",
    color: "#315c7e",
    background: "#f2f7fb",
    border: "#c8d8e5",
  },
  BLOCKED: {
    label: "Нужна база",
    color: "#6c7279",
    background: "#f4f5f6",
    border: "#d5d9dd",
  },
  NEEDS_REVIEW: {
    label: "Повторить",
    color: "#9a4e32",
    background: "#fff2ed",
    border: "#e8bbaa",
  },
  INSUFFICIENT_DATA: {
    label: "Уточнить уровень",
    color: "#67547d",
    background: "#f7f2fb",
    border: "#d9c8e6",
  },
  TEACHER_ASSIGNED: {
    label: "Назначено вами",
    color: "#315394",
    background: "#eef3ff",
    border: "#b6c8ec",
  },
};

const nodePosition = (examNumber: number) => {
  const index = examNumber - 1;
  const row = Math.floor(index / 5);
  const offset = index % 5;
  const column = row % 2 === 0 ? offset : 4 - offset;

  return {
    x: START_X + column * COLUMN_GAP,
    y: START_Y + row * ROW_GAP,
  };
};

const nodeCenter = (examNumber: number) => {
  const position = nodePosition(examNumber);
  return {
    x: position.x + CARD_WIDTH / 2,
    y: position.y + CARD_HEIGHT / 2,
  };
};

const connectionPath = (from: number, to: number) => {
  const start = nodeCenter(from);
  const end = nodeCenter(to);
  const horizontal = Math.abs(end.x - start.x) > Math.abs(end.y - start.y);

  if (horizontal) {
    const middle = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} C ${middle} ${start.y}, ${middle} ${end.y}, ${end.x} ${end.y}`;
  }

  const middle = (start.y + end.y) / 2;
  return `M ${start.x} ${start.y} C ${start.x} ${middle}, ${end.x} ${middle}, ${end.x} ${end.y}`;
};

function ProgressRing({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  const radius = 25;
  const circumference = Math.PI * radius * 2;
  const dash = circumference * Math.max(0, Math.min(1, value));

  return (
    <div className="relative grid size-[62px] shrink-0 place-items-center">
      <svg aria-hidden className="-rotate-90" height="62" width="62">
        <circle
          cx="31"
          cy="31"
          fill="none"
          r={radius}
          stroke="#e7edf2"
          strokeWidth="6"
        />
        <circle
          className="roadmap-progress-ring"
          cx="31"
          cy="31"
          fill="none"
          r={radius}
          stroke={color}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          strokeWidth="6"
        />
      </svg>
      <span className="absolute text-sm font-bold text-ink">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

function RoadmapCard({
  node,
  onOpen,
  selected,
}: {
  node: TeacherRoadmapNode;
  onOpen: () => void;
  selected: boolean;
}) {
  const presentation = statusPresentation[node.status];
  const position = nodePosition(node.examNumber);
  const subtopics = node.subtopics.slice(0, 2);

  return (
    <button
      aria-label={`Задание ${node.examNumber}: ${node.title}`}
      className={`roadmap-node absolute cursor-pointer overflow-hidden rounded-[1.65rem] border bg-white p-5 text-left shadow-[0_14px_35px_rgba(20,55,88,0.08)] outline-none transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(20,55,88,0.14)] focus-visible:ring-4 focus-visible:ring-[#b8d7f4] ${
        node.isCurrent ? "roadmap-node--current" : ""
      } ${selected ? "ring-4 ring-[#c9e2f8]" : ""}`}
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
      <div className="flex items-start gap-4">
        <span
          className="grid size-12 shrink-0 place-items-center rounded-2xl text-lg font-bold"
          style={{
            background: presentation.background,
            color: presentation.color,
          }}
        >
          {node.examNumber}
        </span>
        <div className="min-w-0 flex-1">
          <span
            className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em]"
            style={{
              background: presentation.background,
              color: presentation.color,
            }}
          >
            {presentation.label}
          </span>
          <h3 className="mt-2 line-clamp-2 text-[19px] font-bold leading-[1.15] tracking-[-0.035em] text-ink">
            {node.title}
          </h3>
        </div>
        <ProgressRing color={presentation.color} value={node.mastery} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {subtopics.map((subtopic) => (
          <span
            className="max-w-full truncate rounded-lg bg-panel px-2.5 py-1.5 text-xs font-semibold text-muted"
            key={subtopic.name}
          >
            {subtopic.name}
          </span>
        ))}
        {node.subtopics.length > 2 && (
          <span className="rounded-lg bg-panel px-2.5 py-1.5 text-xs font-semibold text-muted">
            +{node.subtopics.length - 2}
          </span>
        )}
      </div>

      <div className="absolute inset-x-5 bottom-4 flex items-center justify-between border-t border-line pt-3 text-xs font-semibold text-muted">
        <span>{node.examPart}</span>
        <span>Уверенность {Math.round(node.confidence * 100)}%</span>
      </div>
    </button>
  );
}

type TeacherRoadmapBoardProps = {
  roadmap: TeacherRoadmap;
  mode: "PERSONAL" | "FULL";
  editMode: boolean;
  selectedExamNumber: number | null;
  onEditModeToggle: () => void;
  onModeChange: (mode: "PERSONAL" | "FULL") => void;
  onNodeOpen: (examNumber: number) => void;
};

export function TeacherRoadmapBoard({
  roadmap,
  mode,
  editMode,
  selectedExamNumber,
  onEditModeToggle,
  onModeChange,
  onNodeOpen,
}: TeacherRoadmapBoardProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    scale: 0.58,
  });
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fitRoute = useCallback(() => {
    const element = viewportRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const scale = Math.max(
      MIN_SCALE,
      Math.min(
        0.9,
        (bounds.width - 48) / BOARD_WIDTH,
        (bounds.height - 48) / BOARD_HEIGHT,
      ),
    );
    setViewport({
      scale,
      x: (bounds.width - BOARD_WIDTH * scale) / 2,
      y: (bounds.height - BOARD_HEIGHT * scale) / 2,
    });
  }, []);

  const centerNode = useCallback((examNumber: number) => {
    const element = viewportRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const center = nodeCenter(examNumber);
    setViewport((current) => ({
      ...current,
      x: bounds.width / 2 - center.x * current.scale,
      y: bounds.height / 2 - center.y * current.scale,
    }));
  }, []);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      const element = viewportRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const scale = bounds.width < 700 ? 0.52 : 0.72;
      const center = nodeCenter(roadmap.route.currentExamNumber);
      setViewport({
        scale,
        x: bounds.width / 2 - center.x * scale,
        y: bounds.height / 2 - center.y * scale,
      });
    });
    return () => cancelAnimationFrame(animationFrame);
  }, [roadmap.route.currentExamNumber]);

  const setScaleAtPoint = useCallback(
    (nextScale: number, clientX?: number, clientY?: number) => {
      const element = viewportRef.current;
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const pointX = (clientX ?? bounds.left + bounds.width / 2) - bounds.left;
      const pointY = (clientY ?? bounds.top + bounds.height / 2) - bounds.top;

      setViewport((current) => {
        const scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nextScale));
        const worldX = (pointX - current.x) / current.scale;
        const worldY = (pointY - current.y) / current.scale;
        return {
          scale,
          x: pointX - worldX * scale,
          y: pointY - worldY * scale,
        };
      });
    },
    [],
  );

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      const factor = Math.exp(-event.deltaY * 0.009);
      setScaleAtPoint(viewport.scale * factor, event.clientX, event.clientY);
      return;
    }
    setViewport((current) => ({
      ...current,
      x: current.x - event.deltaX,
      y: current.y - event.deltaY,
    }));
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: viewport.x,
      startY: viewport.y,
    };
    setIsDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setViewport((current) => ({
      ...current,
      x: drag.startX + event.clientX - drag.x,
      y: drag.startY + event.clientY - drag.y,
    }));
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
  };

  const visibleDependencies = useMemo(() => {
    if (mode === "FULL") return roadmap.connections;
    const emphasized = new Set(
      roadmap.nodes
        .filter((node) =>
          [
            "CURRENT_PRIORITY",
            "BLOCKED",
            "LEARNING",
            "NEEDS_REVIEW",
            "TEACHER_ASSIGNED",
          ].includes(node.status),
        )
        .map((node) => node.examNumber),
    );
    return roadmap.connections.filter(
      (connection) =>
        emphasized.has(connection.from) || emphasized.has(connection.to),
    );
  }, [mode, roadmap.connections, roadmap.nodes]);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-[0_22px_55px_rgba(15,43,76,0.07)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
        <div className="inline-flex rounded-xl bg-panel p-1">
          {(
            [
              { value: "PERSONAL", label: "Мой маршрут", Icon: Route },
              { value: "FULL", label: "Вся карта", Icon: Sparkles },
            ] as const
          ).map(({ value, label, Icon }) => (
            <button
              className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-bold transition ${
                mode === value
                  ? "bg-white text-brand shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
              key={value}
              onClick={() => onModeChange(value)}
              type="button"
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            aria-label="Уменьшить масштаб"
            className="roadmap-toolbar-button"
            onClick={() => setScaleAtPoint(viewport.scale - 0.12)}
            type="button"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-12 text-center text-xs font-bold text-muted">
            {Math.round(viewport.scale * 100)}%
          </span>
          <button
            aria-label="Увеличить масштаб"
            className="roadmap-toolbar-button"
            onClick={() => setScaleAtPoint(viewport.scale + 0.12)}
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
        </div>
      </div>

      <div
        className={`roadmap-viewport relative h-[660px] overflow-hidden bg-[#fbfcfe] touch-none sm:h-[720px] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerCancel={endDrag}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onWheel={onWheel}
        ref={viewportRef}
      >
        <div className="pointer-events-none absolute left-5 top-4 z-30 inline-flex items-center gap-2 rounded-full border border-line bg-white/92 px-3 py-2 text-xs font-semibold text-muted shadow-sm backdrop-blur">
          <Move className="size-4 text-brand" />
          Тяните доску · масштабируйте жестом
        </div>

        <div
          className="roadmap-canvas absolute left-0 top-0 origin-top-left"
          style={{
            height: BOARD_HEIGHT,
            transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`,
            width: BOARD_WIDTH,
          }}
        >
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-visible"
            height={BOARD_HEIGHT}
            viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
            width={BOARD_WIDTH}
          >
            <defs>
              <marker
                id="roadmap-arrow-main"
                markerHeight="8"
                markerWidth="8"
                orient="auto"
                refX="7"
                refY="4"
              >
                <path d="M0,0 L8,4 L0,8 Z" fill="#7da8ca" />
              </marker>
              <marker
                id="roadmap-arrow-secondary"
                markerHeight="7"
                markerWidth="7"
                orient="auto"
                refX="6"
                refY="3.5"
              >
                <path d="M0,0 L7,3.5 L0,7 Z" fill="#bdc9d3" />
              </marker>
            </defs>
            {roadmap.nodes.slice(0, -1).map((node) => (
              <path
                className="roadmap-main-line"
                d={connectionPath(node.examNumber, node.examNumber + 1)}
                fill="none"
                key={`main-${node.examNumber}`}
                markerEnd="url(#roadmap-arrow-main)"
                stroke="#8bb3d2"
                strokeLinecap="round"
                strokeWidth="7"
              />
            ))}
            {visibleDependencies.map((connection) => (
              <path
                className="roadmap-secondary-line"
                d={connectionPath(connection.from, connection.to)}
                fill="none"
                key={`${connection.from}-${connection.to}`}
                markerEnd="url(#roadmap-arrow-secondary)"
                stroke="#c9d3dc"
                strokeDasharray="8 10"
                strokeLinecap="round"
                strokeWidth="3"
              />
            ))}
          </svg>

          {roadmap.nodes.map((node) => (
            <div
              className="pointer-events-auto"
              key={node.examNumber}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <RoadmapCard
                node={node}
                onOpen={() => {
                  onNodeOpen(node.examNumber);
                  centerNode(node.examNumber);
                }}
                selected={selectedExamNumber === node.examNumber}
              />
            </div>
          ))}

          <div
            className="roadmap-mascot pointer-events-none absolute z-20"
            style={{
              left: nodePosition(roadmap.route.currentExamNumber).x - 74,
              top: nodePosition(roadmap.route.currentExamNumber).y + 118,
            }}
          >
            <Image
              alt=""
              className="h-auto w-[92px] object-contain drop-shadow-[0_12px_12px_rgba(27,71,109,0.14)]"
              height={112}
              src="/fox.png"
              width={92}
            />
          </div>
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-5 py-3">
        {Object.entries(statusPresentation).map(([status, presentation]) => (
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted"
            key={status}
          >
            <span
              className="size-2.5 rounded-full"
              style={{ background: presentation.color }}
            />
            {presentation.label}
          </span>
        ))}
        <span className="ml-auto hidden items-center gap-2 text-xs font-semibold text-muted lg:inline-flex">
          <Focus className="size-4 text-brand" />
          Нажмите на узел, чтобы увидеть навыки и причины
        </span>
      </footer>
    </section>
  );
}
