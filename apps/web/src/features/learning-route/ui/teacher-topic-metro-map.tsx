"use client";

import {
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  Circle,
  Minus,
  Move,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  memo,
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
import type { TeacherRoadmapNode } from "@/entities/learning-route/model/teacher-route";

const METRO_WIDTH = 6800;
const METRO_HEIGHT = 6800;
const METRO_CENTER = { x: METRO_WIDTH / 2, y: METRO_HEIGHT / 2 };
const CORE_WIDTH = 580;
const CORE_HEIGHT = 300;
const SUBTOPIC_WIDTH = 530;
const SUBTOPIC_HEIGHT = 250;
const SKILL_WIDTH = 480;
const SKILL_HEIGHT = 168;
const SUBTOPIC_RADIUS_X = 760;
const SUBTOPIC_RADIUS_Y = 760;
const FIRST_SKILL_DISTANCE = 330;
const SKILL_DISTANCE_STEP = 255;
const SKILL_LABEL_OFFSET = 270;
const INITIAL_SCALE = 0.36;
const MIN_SCALE = 0.18;
const MAX_SCALE = 1.25;
const SKILL_FOCUS_SCALE = 0.72;
const SKILL_OPEN_DELAY = 540;

const branchPalette = [
  { color: "#0b527d", glow: "#7d9fb5" },
  { color: "#176558", glow: "#81a79e" },
  { color: "#8a5a25", glow: "#bca281" },
  { color: "#874553", glow: "#ba929b" },
  { color: "#4b5f7a", glow: "#929fad" },
  { color: "#496a50", glow: "#91a695" },
  { color: "#326673", glow: "#8fa9af" },
  { color: "#70513a", glow: "#a89484" },
] as const;

type MetroViewport = { x: number; y: number; scale: number };
type Point = { x: number; y: number };
type Subtopic = TeacherRoadmapNode["subtopics"][number];
type Skill = Subtopic["skills"][number];

type SkillLayout = {
  skill: Skill;
  station: Point;
  label: Point;
  isPassed: boolean;
};

type BranchLayout = {
  subtopic: Subtopic;
  angle: number;
  color: (typeof branchPalette)[number];
  hub: Point;
  skills: SkillLayout[];
};

const isSkillPassed = (skill: Skill) =>
  ["MASTERED", "TEACHER_CONFIRMED"].includes(skill.status);

const pointAlong = (point: Point, angle: number, distance: number): Point => ({
  x: point.x + Math.cos(angle) * distance,
  y: point.y + Math.sin(angle) * distance,
});

const coreToHubPath = (branch: BranchLayout) => {
  const controlFrom = pointAlong(METRO_CENTER, branch.angle, 260);
  const controlTo = pointAlong(branch.hub, branch.angle + Math.PI, 145);

  return `M ${METRO_CENTER.x} ${METRO_CENTER.y} C ${controlFrom.x} ${controlFrom.y}, ${controlTo.x} ${controlTo.y}, ${branch.hub.x} ${branch.hub.y}`;
};

const segmentPath = (from: Point, to: Point) =>
  `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

const buildBranchLayouts = (subtopics: Subtopic[]): BranchLayout[] => {
  const count = Math.max(1, subtopics.length);

  return subtopics.map((subtopic, branchIndex) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * branchIndex) / count;
    const color = branchPalette[branchIndex % branchPalette.length]!;
    const hub = {
      x: METRO_CENTER.x + Math.cos(angle) * SUBTOPIC_RADIUS_X,
      y: METRO_CENTER.y + Math.sin(angle) * SUBTOPIC_RADIUS_Y,
    };
    const tangent = {
      x: -Math.sin(angle),
      y: Math.cos(angle),
    };
    const skills = subtopic.skills.map((skill, skillIndex) => {
      const distance = FIRST_SKILL_DISTANCE + skillIndex * SKILL_DISTANCE_STEP;
      const station = pointAlong(hub, angle, distance);
      const side = skillIndex % 2 === 0 ? 1 : -1;
      const label = {
        x: station.x + tangent.x * SKILL_LABEL_OFFSET * side,
        y: station.y + tangent.y * SKILL_LABEL_OFFSET * side,
      };

      return {
        skill,
        station,
        label,
        isPassed: isSkillPassed(skill),
      };
    });

    return { subtopic, angle, color, hub, skills };
  });
};

type TeacherTopicMetroMapProps = {
  node: TeacherRoadmapNode;
  onClose: () => void;
  onReviewNode: () => void;
  onSkillOpen: (skillCode: string) => void;
  onSubtopicStatusChange: (action: {
    code: string;
    name: string;
    status: "MASTERED" | "UNSTUDIED";
  }) => Promise<void>;
};

function TeacherTopicMetroMapComponent({
  node,
  onClose,
  onReviewNode,
  onSkillOpen,
  onSubtopicStatusChange,
}: TeacherTopicMetroMapProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scaleLabelRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const pendingViewportRef = useRef<MetroViewport | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skillOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewportStateRef = useRef<MetroViewport>({
    x: 0,
    y: 0,
    scale: INITIAL_SCALE,
  });
  const dragRef = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [updatingSubtopicCode, setUpdatingSubtopicCode] = useState<
    string | null
  >(null);
  const [optimisticStatuses, setOptimisticStatuses] = useState<
    Record<string, "MASTERED" | "UNSTUDIED">
  >({});
  const displayedSubtopics = useMemo(
    () =>
      node.subtopics.map((subtopic) => {
        const status = optimisticStatuses[subtopic.code];
        if (!status) return subtopic;
        const isMastered = status === "MASTERED";

        return {
          ...subtopic,
          mastery: isMastered ? 1 : 0,
          masteredSkills: isMastered ? subtopic.skills.length : 0,
          isMastered,
          skills: subtopic.skills.map((skill) => ({
            ...skill,
            mastery: isMastered ? 1 : 0,
            status,
          })),
        };
      }),
    [node.subtopics, optimisticStatuses],
  );
  const branches = useMemo(
    () => buildBranchLayouts(displayedSubtopics),
    [displayedSubtopics],
  );

  const changeSubtopicStatus = useCallback(
    async (action: {
      code: string;
      name: string;
      status: "MASTERED" | "UNSTUDIED";
    }) => {
      setOptimisticStatuses((current) => ({
        ...current,
        [action.code]: action.status,
      }));
      setUpdatingSubtopicCode(action.code);

      try {
        await onSubtopicStatusChange(action);
      } catch {
        // Родитель показывает ошибку, а локальная подсветка откатывается ниже.
      } finally {
        setUpdatingSubtopicCode((current) =>
          current === action.code ? null : current,
        );
        setOptimisticStatuses((current) => {
          const next = { ...current };
          delete next[action.code];
          return next;
        });
      }
    },
    [onSubtopicStatusChange],
  );

  const commitViewport = useCallback((next: MetroViewport, animate = false) => {
    viewportStateRef.current = next;
    const canvas = canvasRef.current;

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (canvas) {
      canvas.classList.toggle("topic-metro-canvas--animated", animate);
      canvas.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.scale})`;
      if (animate) {
        transitionTimerRef.current = setTimeout(() => {
          canvas.classList.remove("topic-metro-canvas--animated");
          transitionTimerRef.current = null;
        }, 560);
      }
    }

    if (scaleLabelRef.current) {
      scaleLabelRef.current.textContent = `${Math.round(next.scale * 100)}%`;
    }
  }, []);

  const applyViewport = useCallback(
    (next: MetroViewport, animate = false) => {
      viewportStateRef.current = next;

      if (animate) {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        pendingViewportRef.current = null;
        commitViewport(next, true);
        return;
      }

      pendingViewportRef.current = next;
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const pending = pendingViewportRef.current;
        pendingViewportRef.current = null;
        if (pending) commitViewport(pending);
      });
    },
    [commitViewport],
  );

  const setScaleAtPoint = useCallback(
    (
      nextScale: number,
      clientX?: number,
      clientY?: number,
      animate = false,
    ) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const bounds = viewport.getBoundingClientRect();
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

  const focusPoint = useCallback(
    (
      point: Point,
      scale: number,
      horizontalPosition: "center" | "detail" = "center",
    ) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const bounds = viewport.getBoundingClientRect();
      const targetX =
        horizontalPosition === "detail" && bounds.width >= 960
          ? (bounds.width - 540) / 2
          : bounds.width / 2;

      applyViewport(
        {
          scale,
          x: targetX - point.x * scale,
          y: bounds.height / 2 - point.y * scale,
        },
        true,
      );
    },
    [applyViewport],
  );

  const focusBranch = useCallback(
    (branch: BranchLayout) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const bounds = viewport.getBoundingClientRect();
      const left = Math.min(
        branch.hub.x - SUBTOPIC_WIDTH / 2,
        ...branch.skills.map(({ label }) => label.x - SKILL_WIDTH / 2),
      );
      const right = Math.max(
        branch.hub.x + SUBTOPIC_WIDTH / 2,
        ...branch.skills.map(({ label }) => label.x + SKILL_WIDTH / 2),
      );
      const top = Math.min(
        branch.hub.y - SUBTOPIC_HEIGHT / 2,
        ...branch.skills.map(({ label }) => label.y - SKILL_HEIGHT / 2),
      );
      const bottom = Math.max(
        branch.hub.y + SUBTOPIC_HEIGHT / 2,
        ...branch.skills.map(({ label }) => label.y + SKILL_HEIGHT / 2),
      );
      const scale = Math.max(
        0.48,
        Math.min(
          0.62,
          (bounds.width - 160) / Math.max(1, right - left),
          (bounds.height - 160) / Math.max(1, bottom - top),
        ),
      );

      focusPoint(
        {
          x: (left + right) / 2,
          y: (top + bottom) / 2,
        },
        scale,
      );
    },
    [focusPoint],
  );

  const openSkillWithFocus = useCallback(
    (skillLayout: SkillLayout) => {
      if (skillOpenTimerRef.current) {
        clearTimeout(skillOpenTimerRef.current);
      }

      focusPoint(skillLayout.label, SKILL_FOCUS_SCALE, "detail");
      skillOpenTimerRef.current = setTimeout(() => {
        skillOpenTimerRef.current = null;
        onSkillOpen(skillLayout.skill.code);
      }, SKILL_OPEN_DELAY);
    },
    [focusPoint, onSkillOpen],
  );

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const bounds = viewport.getBoundingClientRect();
      const scale = INITIAL_SCALE;
      applyViewport({
        scale,
        x: bounds.width / 2 - METRO_CENTER.x * scale,
        y: bounds.height / 2 - METRO_CENTER.y * scale,
      });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [applyViewport]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateAnimationState = () => {
      viewport.classList.toggle(
        "topic-metro-viewport--paused",
        document.hidden,
      );
    };

    updateAnimationState();
    document.addEventListener("visibilitychange", updateAnimationState);
    return () =>
      document.removeEventListener("visibilitychange", updateAnimationState);
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      if (skillOpenTimerRef.current) {
        clearTimeout(skillOpenTimerRef.current);
      }
    },
    [],
  );

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      const factor = Math.exp(-event.deltaY * 0.008);
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
    const current = viewportStateRef.current;
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      startX: current.x,
      startY: current.y,
    };
    setIsDragging(true);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    applyViewport({
      scale: viewportStateRef.current.scale,
      x: drag.startX + event.clientX - drag.clientX,
      y: drag.startY + event.clientY - drag.clientY,
    });
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
  };

  return (
    <section className="topic-metro-overlay fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-[#f7fafe]">
      <header className="relative z-20 flex shrink-0 flex-wrap items-center gap-4 border-b border-[#dce7f0] bg-white/94 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6">
        <button
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-line bg-white px-4 text-sm font-bold text-ink transition hover:-translate-x-0.5 hover:border-[#9fc2df] hover:text-brand"
          onClick={onClose}
          type="button"
        >
          <ArrowLeft className="size-4" />К маршруту
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
            Метро-карта задания {node.examNumber}
          </p>
          <h2 className="truncate text-xl font-bold tracking-[-0.04em] text-ink sm:text-2xl">
            {node.title}
          </h2>
        </div>

        <div className="hidden items-center gap-4 text-xs font-semibold text-muted md:flex">
          <span className="inline-flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#2e8f67] shadow-[0_0_0_5px_rgb(46_143_103_/_12%)]" />
            Пройдено
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-3 rounded-full bg-[#bec6cd]" />
            Ещё впереди
          </span>
        </div>
      </header>

      <div
        className={`topic-metro-viewport relative min-h-0 flex-1 touch-none overflow-hidden ${
          isDragging
            ? "topic-metro-viewport--dragging cursor-grabbing"
            : "cursor-grab"
        }`}
        onPointerCancel={endDrag}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onWheel={onWheel}
        ref={viewportRef}
      >
        <div className="pointer-events-none absolute left-4 top-4 z-30 inline-flex items-center gap-2 rounded-full border border-line bg-white/90 px-3 py-2 text-xs font-semibold text-muted shadow-sm backdrop-blur">
          <Move className="size-4 text-brand" />
          Тяните карту · жестом меняйте масштаб
        </div>

        <div
          className="topic-metro-canvas absolute left-0 top-0 origin-top-left"
          ref={canvasRef}
          style={{ width: METRO_WIDTH, height: METRO_HEIGHT }}
        >
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0"
            height={METRO_HEIGHT}
            viewBox={`0 0 ${METRO_WIDTH} ${METRO_HEIGHT}`}
            width={METRO_WIDTH}
          >
            {branches.map((branch) => {
              const hubPath = coreToHubPath(branch);
              return (
                <g key={`branch-${branch.subtopic.code}`}>
                  {branch.subtopic.isMastered && (
                    <path
                      d={hubPath}
                      fill="none"
                      opacity="0.16"
                      stroke={branch.color.glow}
                      strokeLinecap="round"
                      strokeWidth="28"
                    />
                  )}
                  <path
                    d={hubPath}
                    fill="none"
                    opacity={branch.subtopic.isMastered ? 1 : 0.24}
                    stroke={
                      branch.subtopic.isMastered
                        ? branch.color.color
                        : "#aeb8c2"
                    }
                    strokeLinecap="round"
                    strokeWidth="16"
                  />
                  {branch.subtopic.isMastered && (
                    <path
                      className="topic-metro-flow"
                      d={hubPath}
                      fill="none"
                      stroke="#ffffff"
                      strokeLinecap="round"
                      strokeWidth="5"
                    />
                  )}

                  {branch.skills.map((skillLayout, skillIndex) => {
                    const from =
                      skillIndex === 0
                        ? branch.hub
                        : branch.skills[skillIndex - 1]!.station;
                    const lineColor = skillLayout.isPassed
                      ? branch.color.color
                      : "#bcc5cd";

                    return (
                      <g key={`line-${skillLayout.skill.code}`}>
                        {skillLayout.isPassed && (
                          <path
                            d={segmentPath(from, skillLayout.station)}
                            fill="none"
                            opacity="0.2"
                            stroke={branch.color.glow}
                            strokeLinecap="round"
                            strokeWidth="25"
                          />
                        )}
                        <path
                          d={segmentPath(from, skillLayout.station)}
                          fill="none"
                          opacity={skillLayout.isPassed ? 0.95 : 0.28}
                          stroke={lineColor}
                          strokeLinecap="round"
                          strokeWidth="11"
                        />
                        <path
                          d={segmentPath(
                            skillLayout.station,
                            skillLayout.label,
                          )}
                          fill="none"
                          opacity={skillLayout.isPassed ? 0.72 : 0.2}
                          stroke={lineColor}
                          strokeDasharray="8 10"
                          strokeLinecap="round"
                          strokeWidth="5"
                        />
                        <circle
                          cx={skillLayout.station.x}
                          cy={skillLayout.station.y}
                          fill={
                            skillLayout.isPassed
                              ? branch.color.color
                              : "#d2d8de"
                          }
                          r="18"
                          stroke="#ffffff"
                          strokeWidth="9"
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          <div
            aria-label="Сфокусироваться на центральной теме"
            className="topic-metro-core absolute z-20 cursor-zoom-in overflow-hidden rounded-[2rem] border-2 border-[#1c5e91] bg-[#073e68] p-8 text-white shadow-[0_28px_70px_rgba(7,62,104,0.28)]"
            onClick={() => focusPoint(METRO_CENTER, 0.46)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                focusPoint(METRO_CENTER, 0.46);
              }
            }}
            onPointerDown={(event) => event.stopPropagation()}
            role="button"
            style={{
              height: CORE_HEIGHT,
              left: METRO_CENTER.x - CORE_WIDTH / 2,
              top: METRO_CENTER.y - CORE_HEIGHT / 2,
              width: CORE_WIDTH,
            }}
            tabIndex={0}
          >
            <div className="absolute -right-10 -top-14 size-52 rounded-full bg-[#4ca2d8]/20 blur-2xl" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-start gap-5">
                <span className="grid size-20 shrink-0 place-items-center rounded-[1.6rem] bg-white text-[30px] font-extrabold text-[#073e68]">
                  {node.examNumber}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#a9d7f5]">
                    Центральная станция · {node.examPart}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-[40px] font-bold leading-[1.05] tracking-[-0.05em]">
                    {node.title}
                  </h3>
                </div>
              </div>
              <div className="mt-auto flex items-center gap-4">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/18">
                  <div
                    className="h-full rounded-full bg-[#76d6b2]"
                    style={{
                      width: `${Math.max(3, Math.round(node.mastery * 100))}%`,
                    }}
                  />
                </div>
                <span className="text-lg font-extrabold">
                  {Math.round(node.mastery * 100)}%
                </span>
                {node.isPassed && (
                  <button
                    className="inline-flex h-12 cursor-pointer items-center gap-2 rounded-2xl bg-[#e58910] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c96f08]"
                    onClick={onReviewNode}
                    type="button"
                  >
                    <CalendarClock className="size-5" />
                    На повторение
                  </button>
                )}
              </div>
            </div>
          </div>

          {branches.map((branch, branchIndex) => (
            <div key={branch.subtopic.code}>
              <article
                aria-label={`Приблизить ветку «${branch.subtopic.name}»`}
                className={`topic-metro-station absolute z-10 flex cursor-zoom-in flex-col rounded-[1.25rem] border-2 p-6 ${
                  branch.subtopic.isMastered
                    ? "topic-metro-station--mastered bg-white"
                    : "bg-[#f3f5f6] opacity-80 grayscale-[25%]"
                }`}
                onClick={() => focusBranch(branch)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    focusBranch(branch);
                  }
                }}
                onPointerDown={(event) => event.stopPropagation()}
                role="button"
                style={
                  {
                    "--metro-glow": branch.color.glow,
                    animationDelay: `${90 + branchIndex * 55}ms`,
                    borderColor: branch.subtopic.isMastered
                      ? branch.color.color
                      : "#cbd2d8",
                    color: branch.color.color,
                    height: SUBTOPIC_HEIGHT,
                    left: branch.hub.x - SUBTOPIC_WIDTH / 2,
                    top: branch.hub.y - SUBTOPIC_HEIGHT / 2,
                    width: SUBTOPIC_WIDTH,
                  } as CSSProperties
                }
                tabIndex={0}
              >
                <div className="flex items-start gap-5">
                  <span
                    className="grid size-14 shrink-0 place-items-center rounded-xl text-white"
                    style={{
                      background: branch.subtopic.isMastered
                        ? branch.color.color
                        : "#aeb7bf",
                    }}
                  >
                    {branch.subtopic.isMastered ? (
                      <Check className="size-7" strokeWidth={3} />
                    ) : (
                      <Circle className="size-6" strokeWidth={3} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[32px] font-bold leading-[1.08] tracking-[-0.035em] text-ink">
                      {branch.subtopic.name}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-muted">
                      {branch.subtopic.masteredSkills}/
                      {branch.subtopic.skills.length} блоков
                    </p>
                  </div>
                </div>
                <button
                  className="mt-auto inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-base font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
                  disabled={updatingSubtopicCode === branch.subtopic.code}
                  onClick={(event) => {
                    event.stopPropagation();
                    void changeSubtopicStatus({
                      code: branch.subtopic.code,
                      name: branch.subtopic.name,
                      status: branch.subtopic.isMastered
                        ? "UNSTUDIED"
                        : "MASTERED",
                    });
                  }}
                  style={{
                    background: branch.subtopic.isMastered
                      ? "#65717b"
                      : branch.color.color,
                  }}
                  type="button"
                >
                  {branch.subtopic.isMastered ? (
                    <RotateCcw className="size-4" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  {updatingSubtopicCode === branch.subtopic.code
                    ? "Сохраняем…"
                    : branch.subtopic.isMastered
                      ? "Вернуть ветку в не пройдено"
                      : "Отметить всю ветку"}
                </button>
              </article>

              {branch.skills.map((skillLayout) => (
                <button
                  className={`topic-metro-skill absolute z-20 flex cursor-zoom-in items-center gap-4 rounded-xl border-2 px-5 text-left transition hover:-translate-y-1 ${
                    skillLayout.isPassed
                      ? "bg-white"
                      : "border-[#d4d9de] bg-[#f0f2f4] text-[#68737d] opacity-80 grayscale-[25%]"
                  }`}
                  key={skillLayout.skill.code}
                  onClick={() => openSkillWithFocus(skillLayout)}
                  onPointerDown={(event) => event.stopPropagation()}
                  style={{
                    borderColor: skillLayout.isPassed
                      ? branch.color.color
                      : undefined,
                    boxShadow: skillLayout.isPassed
                      ? `0 14px 30px ${branch.color.glow}42`
                      : "0 8px 20px rgb(36 54 70 / 7%)",
                    height: SKILL_HEIGHT,
                    left: skillLayout.label.x - SKILL_WIDTH / 2,
                    top: skillLayout.label.y - SKILL_HEIGHT / 2,
                    width: SKILL_WIDTH,
                  }}
                  type="button"
                >
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-full text-white"
                    style={{
                      background: skillLayout.isPassed
                        ? branch.color.color
                        : "#abb4bc",
                    }}
                  >
                    {skillLayout.isPassed ? (
                      <Check className="size-6" strokeWidth={3} />
                    ) : (
                      <span className="size-3 rounded-full bg-white/85" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[26px] font-bold leading-[1.12] tracking-[-0.025em] text-ink">
                      {skillLayout.skill.name}
                    </span>
                    <span
                      className="mt-2 block text-base font-bold"
                      style={{
                        color: skillLayout.isPassed
                          ? branch.color.color
                          : "#818b94",
                      }}
                    >
                      {skillLayout.isPassed ? "Пройдено" : "Не пройдено"}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div
          className="absolute bottom-5 right-5 z-30 flex items-center gap-2 rounded-2xl border border-line bg-white/94 p-2 shadow-[0_16px_40px_rgba(15,43,76,0.13)] backdrop-blur"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            aria-label="Уменьшить метро-карту"
            className="roadmap-toolbar-button"
            onClick={() =>
              setScaleAtPoint(
                viewportStateRef.current.scale - 0.1,
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
            {Math.round(INITIAL_SCALE * 100)}%
          </span>
          <button
            aria-label="Увеличить метро-карту"
            className="roadmap-toolbar-button"
            onClick={() =>
              setScaleAtPoint(
                viewportStateRef.current.scale + 0.1,
                undefined,
                undefined,
                true,
              )
            }
            type="button"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export const TeacherTopicMetroMap = memo(
  TeacherTopicMetroMapComponent,
  (previous, next) => previous.node === next.node,
);
