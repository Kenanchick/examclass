"use client";

import {
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  LocateFixed,
  Minus,
  Move,
  Plus,
  RotateCcw,
  Sparkles,
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
import type { TeacherRoadmapNode } from "@/entities/learning-route/model/teacher-route";

const METRO_WIDTH = 4000;
const METRO_HEIGHT = 3500;
const METRO_CENTER = { x: METRO_WIDTH / 2, y: METRO_HEIGHT / 2 };
const CORE_WIDTH = 520;
const CORE_HEIGHT = 270;
const SUBTOPIC_WIDTH = 380;
const SUBTOPIC_HEIGHT = 180;
const SKILL_WIDTH = 280;
const SKILL_HEIGHT = 96;
const SUBTOPIC_RADIUS_X = 650;
const SUBTOPIC_RADIUS_Y = 500;
const FIRST_SKILL_DISTANCE = 320;
const SKILL_DISTANCE_STEP = 145;
const SKILL_LABEL_OFFSET = 150;
const MIN_SCALE = 0.2;
const MAX_SCALE = 1.25;

const branchPalette = [
  { color: "#2578b5", tint: "#eaf5fd", glow: "#86c9f3" },
  { color: "#15836f", tint: "#e8f7f3", glow: "#76d6c2" },
  { color: "#d2760c", tint: "#fff3df", glow: "#f3bf6c" },
  { color: "#c34f78", tint: "#fdeef4", glow: "#ef9ebb" },
  { color: "#7955b7", tint: "#f3eefc", glow: "#bea8e7" },
  { color: "#3b8a4e", tint: "#edf8ef", glow: "#91d29e" },
  { color: "#167f9c", tint: "#eaf7fa", glow: "#83cbdc" },
  { color: "#a86118", tint: "#fff4e7", glow: "#e6b47c" },
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
  }) => void;
};

export function TeacherTopicMetroMap({
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
  const viewportStateRef = useRef<MetroViewport>({
    x: 0,
    y: 0,
    scale: 0.42,
  });
  const dragRef = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const branches = useMemo(
    () => buildBranchLayouts(node.subtopics),
    [node.subtopics],
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

  const fitMap = useCallback(
    (animate = false) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const bounds = viewport.getBoundingClientRect();
      const fittedScale = Math.min(
        0.72,
        (bounds.width - 72) / METRO_WIDTH,
        (bounds.height - 72) / METRO_HEIGHT,
      );
      const scale = Math.max(MIN_SCALE, fittedScale);
      applyViewport(
        {
          scale,
          x: (bounds.width - METRO_WIDTH * scale) / 2,
          y: (bounds.height - METRO_HEIGHT * scale) / 2,
        },
        animate,
      );
    },
    [applyViewport],
  );

  const centerMap = useCallback(
    (animate = true) => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const bounds = viewport.getBoundingClientRect();
      const scale = Math.max(0.42, viewportStateRef.current.scale);
      applyViewport(
        {
          scale,
          x: bounds.width / 2 - METRO_CENTER.x * scale,
          y: bounds.height / 2 - METRO_CENTER.y * scale,
        },
        animate,
      );
    },
    [applyViewport],
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

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => centerMap(false));

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [centerMap]);

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
                      opacity="0.22"
                      stroke={branch.color.glow}
                      strokeLinecap="round"
                      strokeWidth="34"
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
            className="topic-metro-core absolute z-20 overflow-hidden rounded-[2.4rem] border-2 border-[#1c5e91] bg-[#073e68] p-8 text-white shadow-[0_34px_90px_rgba(7,62,104,0.32)]"
            onPointerDown={(event) => event.stopPropagation()}
            style={{
              height: CORE_HEIGHT,
              left: METRO_CENTER.x - CORE_WIDTH / 2,
              top: METRO_CENTER.y - CORE_HEIGHT / 2,
              width: CORE_WIDTH,
            }}
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
                className={`topic-metro-station absolute z-10 flex flex-col rounded-[1.8rem] border-2 p-5 ${
                  branch.subtopic.isMastered
                    ? "topic-metro-station--mastered bg-white"
                    : "bg-[#f1f4f6] opacity-70 grayscale-[35%]"
                }`}
                onPointerDown={(event) => event.stopPropagation()}
                style={
                  {
                    "--metro-glow": branch.color.glow,
                    animationDelay: `${90 + branchIndex * 55}ms`,
                    background: branch.subtopic.isMastered
                      ? `linear-gradient(145deg, #ffffff, ${branch.color.tint})`
                      : undefined,
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
              >
                <div className="flex items-start gap-4">
                  <span
                    className="grid size-12 shrink-0 place-items-center rounded-2xl text-white"
                    style={{
                      background: branch.subtopic.isMastered
                        ? branch.color.color
                        : "#aeb7bf",
                    }}
                  >
                    {branch.subtopic.isMastered ? (
                      <Check className="size-6" strokeWidth={3} />
                    ) : (
                      <Sparkles className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[25px] font-bold leading-[1.08] tracking-[-0.035em] text-ink">
                      {branch.subtopic.name}
                    </p>
                    <p className="mt-1 text-base font-semibold text-muted">
                      {branch.subtopic.masteredSkills}/
                      {branch.subtopic.skills.length} навыков
                    </p>
                  </div>
                </div>
                <button
                  className="mt-auto inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                  onClick={() =>
                    onSubtopicStatusChange({
                      code: branch.subtopic.code,
                      name: branch.subtopic.name,
                      status: branch.subtopic.isMastered
                        ? "UNSTUDIED"
                        : "MASTERED",
                    })
                  }
                  style={{
                    background: branch.subtopic.isMastered
                      ? "#7b8791"
                      : branch.color.color,
                  }}
                  type="button"
                >
                  {branch.subtopic.isMastered ? (
                    <RotateCcw className="size-4" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  {branch.subtopic.isMastered
                    ? "Вернуть в не пройдено"
                    : "Отметить пройденной"}
                </button>
              </article>

              {branch.skills.map((skillLayout, skillIndex) => (
                <button
                  className={`topic-metro-skill absolute z-20 flex cursor-pointer items-center gap-3 rounded-[1.35rem] border px-4 text-left transition hover:-translate-y-1 ${
                    skillLayout.isPassed
                      ? "bg-white"
                      : "border-[#d6dce1] bg-[#eef1f3] text-[#75808a] opacity-75 grayscale-[45%]"
                  }`}
                  key={skillLayout.skill.code}
                  onClick={() => onSkillOpen(skillLayout.skill.code)}
                  onPointerDown={(event) => event.stopPropagation()}
                  style={{
                    animationDelay: `${180 + branchIndex * 55 + skillIndex * 25}ms`,
                    borderColor: skillLayout.isPassed
                      ? branch.color.color
                      : undefined,
                    boxShadow: skillLayout.isPassed
                      ? `0 16px 38px ${branch.color.glow}55`
                      : "0 10px 24px rgb(36 54 70 / 8%)",
                    height: SKILL_HEIGHT,
                    left: skillLayout.label.x - SKILL_WIDTH / 2,
                    top: skillLayout.label.y - SKILL_HEIGHT / 2,
                    width: SKILL_WIDTH,
                  }}
                  type="button"
                >
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full text-white"
                    style={{
                      background: skillLayout.isPassed
                        ? branch.color.color
                        : "#abb4bc",
                    }}
                  >
                    {skillLayout.isPassed ? (
                      <Check className="size-5" strokeWidth={3} />
                    ) : (
                      <span className="size-2.5 rounded-full bg-white/80" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-[19px] font-bold leading-[1.08] tracking-[-0.025em] text-ink">
                      {skillLayout.skill.name}
                    </span>
                    <span
                      className="mt-1 block text-sm font-bold"
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

        <div className="absolute bottom-5 right-5 z-30 flex items-center gap-2 rounded-2xl border border-line bg-white/94 p-2 shadow-[0_16px_40px_rgba(15,43,76,0.13)] backdrop-blur">
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
            42%
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
          <button
            aria-label="Показать всю метро-карту"
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 text-xs font-bold text-muted transition hover:border-[#a8c7df] hover:text-brand"
            onClick={() => fitMap(true)}
            title="Вся карта"
            type="button"
          >
            <Sparkles className="size-4" />
            <span className="hidden sm:inline">Вся карта</span>
          </button>
          <button
            aria-label="Вернуться к центральной станции"
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-line bg-white px-3 text-xs font-bold text-muted transition hover:border-[#a8c7df] hover:text-brand"
            onClick={() => centerMap(true)}
            title="Центральная станция"
            type="button"
          >
            <LocateFixed className="size-4" />
            <span className="hidden sm:inline">В центр</span>
          </button>
        </div>
      </div>
    </section>
  );
}
