"use client";

import {
  BookCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  History,
  Lock,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { TeacherSkillDetail } from "@/entities/learning-route/model/teacher-route";

export type SkillActionRequest = {
  action: string;
  title: string;
  status?: string;
  comment?: string;
  enabled?: boolean;
};

type TeacherSkillDetailProps = {
  detail: TeacherSkillDetail | undefined;
  isError: boolean;
  isPending: boolean;
  onAction: (request: SkillActionRequest) => void;
  onClose: () => void;
  onRetry: () => void;
};

const statusOptions = [
  ["UNSTUDIED", "Ещё не изучалось"],
  ["INSUFFICIENT_DATA", "Недостаточно данных"],
  ["WEAK", "Слабый навык"],
  ["LEARNING", "Изучается"],
  ["NEEDS_REINFORCEMENT", "Требует закрепления"],
  ["MASTERED", "Освоено"],
  ["NEEDS_REVIEW", "Требует повторения"],
  ["TEACHER_CONFIRMED", "Подтверждено преподавателем"],
] as const;

const statusLabels = new Map<string, string>(statusOptions);

const percent = (value: number | null | undefined) =>
  value === null || value === undefined ? "—" : `${Math.round(value * 100)}%`;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-muted">
        <span>{label}</span>
        <span>{percent(value)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel">
        <span
          className="block h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${Math.round((value ?? 0) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function TeacherSkillDetailPanel({
  detail,
  isError,
  isPending,
  onAction,
  onClose,
  onRetry,
}: TeacherSkillDetailProps) {
  const [manualStatus, setManualStatus] = useState("LEARNING");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (detail) {
      setManualStatus(detail.effectiveStatus);
      setComment(detail.teacherControl?.comment ?? "");
    }
  }, [detail]);

  if (isPending) {
    return (
      <div className="grid min-h-80 place-items-center p-8 text-center text-sm font-semibold text-muted">
        Загружаем доказательства и историю навыка…
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="grid min-h-80 place-items-center p-8 text-center">
        <div>
          <p className="font-bold text-ink">Не удалось открыть навык</p>
          <button
            className="mt-3 cursor-pointer text-sm font-bold text-brand"
            onClick={onRetry}
            type="button"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  const systemReasons = detail.systemState?.explanation?.reasons ?? [];
  const autoStatusEnabled = detail.teacherControl?.autoStatusEnabled ?? true;
  const blockingPrerequisites = detail.prerequisiteLinks.filter(
    (link) =>
      link.type === "REQUIRED" &&
      !["MASTERED", "TEACHER_CONFIRMED"].includes(
        link.prerequisite.skillStates[0]?.status ?? "",
      ),
  );

  return (
    <div className="max-h-[78vh] overflow-y-auto p-5 scrollbar-thin sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-brand">
            Проверяемый навык
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-ink">
            {detail.name}
          </h3>
          {detail.description && (
            <p className="mt-2 text-sm leading-6 text-muted">
              {detail.description}
            </p>
          )}
        </div>
        <button
          aria-label="Закрыть навык"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl text-muted transition hover:bg-panel hover:text-ink"
          onClick={onClose}
          type="button"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-6 grid gap-4 rounded-2xl bg-panel/60 p-4 sm:grid-cols-3">
        <Metric label="Владение" value={detail.systemState?.mastery} />
        <Metric
          label="Уверенность системы"
          value={detail.systemState?.confidence}
        />
        <Metric label="Стабильность" value={detail.systemState?.stability} />
      </div>

      <div className="mt-5 rounded-2xl border border-line p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" />
          <div>
            <p className="font-bold text-ink">Вывод системы</p>
            <p className="mt-1 text-sm font-semibold text-brand">
              {detail.systemState
                ? (statusLabels.get(detail.systemState.status) ??
                  detail.systemState.status)
                : "Недостаточно данных"}
            </p>
            {systemReasons.map((reason) => (
              <p className="mt-2 text-sm leading-6 text-muted" key={reason}>
                {reason}
              </p>
            ))}
          </div>
        </div>
        <button
          className="mt-4 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-brand/8 px-3 text-sm font-bold text-brand transition hover:bg-brand/14"
          onClick={() =>
            onAction({
              action: "CONFIRM_SYSTEM_CONCLUSION",
              title: "Подтвердить вывод системы",
            })
          }
          type="button"
        >
          <CheckCircle2 className="size-4" />
          Подтвердить вывод
        </button>
      </div>

      {blockingPrerequisites.length > 0 && (
        <div className="mt-5 border-l-2 border-[#d48a22] pl-4">
          <p className="font-bold text-ink">Блокирующие пробелы</p>
          <div className="mt-2 space-y-2">
            {blockingPrerequisites.map((link) => (
              <p
                className="text-sm leading-6 text-muted"
                key={link.prerequisite.code}
              >
                <span className="font-bold text-[#935506]">
                  {link.prerequisite.name}
                </span>
                {link.rationale ? ` — ${link.rationale}` : ""}
              </p>
            ))}
          </div>
        </div>
      )}

      {detail.teacherControl && (
        <div className="mt-5 rounded-2xl border border-line p-4">
          <p className="font-bold text-ink">Педагогическое решение</p>
          <div className="mt-3 space-y-2 text-sm leading-6 text-muted">
            {detail.teacherControl.systemConclusionConfirmedAt && (
              <p>
                Вывод системы подтверждён{" "}
                {formatDateTime(
                  detail.teacherControl.systemConclusionConfirmedAt,
                )}
              </p>
            )}
            {detail.teacherControl.instructionStatus === "TAUGHT" && (
              <p>Тема пройдена на занятии — ожидается проверка практикой.</p>
            )}
            {detail.teacherControl.instructionStatus === "REINFORCED" && (
              <p>Тема закреплена с преподавателем — ожидается контроль.</p>
            )}
            {detail.teacherControl.reviewScheduledAt && (
              <p>
                Повторение назначено на{" "}
                {formatDateTime(detail.teacherControl.reviewScheduledAt)}.
              </p>
            )}
            {detail.teacherControl.controlScheduledAt && (
              <p>
                Контроль назначен на{" "}
                {formatDateTime(detail.teacherControl.controlScheduledAt)}.
              </p>
            )}
            {!detail.teacherControl.autoStatusEnabled && (
              <p>
                Автоматический статус отключён. Используется ручная оценка:{" "}
                <span className="font-bold text-ink">
                  {statusLabels.get(detail.teacherControl.manualStatus ?? "") ??
                    detail.teacherControl.manualStatus ??
                    "не указана"}
                </span>
                .
              </p>
            )}
            {detail.teacherControl.comment && (
              <p className="border-l-2 border-brand/25 pl-3 italic">
                {detail.teacherControl.comment}
              </p>
            )}
            <p className="text-xs">
              Последнее изменение: {detail.teacherControl.lastAuthor.name},{" "}
              {formatDateTime(detail.teacherControl.updatedAt)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="text-sm font-bold uppercase tracking-[0.1em] text-muted">
          Работа преподавателя
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <button
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm font-bold text-ink transition hover:border-brand/40 hover:bg-[#f7fbff]"
            onClick={() =>
              onAction({
                action: "MARK_TAUGHT",
                title: "Отметить тему пройденной",
              })
            }
            type="button"
          >
            <BookCheck className="size-4 text-brand" /> Пройдено на занятии
          </button>
          <button
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm font-bold text-ink transition hover:border-brand/40 hover:bg-[#f7fbff]"
            onClick={() =>
              onAction({
                action: "MARK_REINFORCED",
                title: "Отметить тему закреплённой",
              })
            }
            type="button"
          >
            <CheckCircle2 className="size-4 text-brand" /> Закреплено с учителем
          </button>
          <button
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm font-bold text-ink transition hover:border-brand/40 hover:bg-[#f7fbff]"
            onClick={() =>
              onAction({
                action: "SCHEDULE_CONTROL",
                title: "Назначить контроль навыка",
              })
            }
            type="button"
          >
            <ClipboardCheck className="size-4 text-brand" /> Назначить контроль
          </button>
          <button
            className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm font-bold text-ink transition hover:border-brand/40 hover:bg-[#f7fbff]"
            onClick={() =>
              onAction({
                action: "SCHEDULE_REVIEW",
                title: "Поставить навык на повторение",
              })
            }
            type="button"
          >
            <CalendarClock className="size-4 text-brand" /> На повторение
          </button>
        </div>
        <p className="mt-3 text-xs leading-5 text-muted">
          «Пройдено» фиксирует факт занятия, но не делает навык освоенным без
          подтверждения практикой или контролем.
        </p>
      </div>

      <div className="mt-6 border-t border-line pt-6">
        <label className="text-sm font-bold text-ink" htmlFor="manual-status">
          Ручной статус навыка
        </label>
        <div className="mt-2 flex gap-2">
          <select
            className="min-h-12 min-w-0 flex-1 cursor-pointer rounded-xl border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
            id="manual-status"
            onChange={(event) => setManualStatus(event.target.value)}
            value={manualStatus}
          >
            {statusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            className="cursor-pointer rounded-xl bg-brand px-4 text-sm font-bold text-white"
            onClick={() =>
              onAction({
                action: "CHANGE_SKILL_STATUS",
                title: "Изменить статус навыка",
                status: manualStatus,
              })
            }
            type="button"
          >
            Сохранить
          </button>
        </div>
        <button
          className="mt-3 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-brand"
          onClick={() =>
            onAction({
              action: "SET_SKILL_AUTOMATION",
              enabled: !autoStatusEnabled,
              title: autoStatusEnabled
                ? "Отключить автоматический статус"
                : "Вернуть автоматический статус",
            })
          }
          type="button"
        >
          {!autoStatusEnabled ? (
            <RefreshCw className="size-4" />
          ) : (
            <Lock className="size-4" />
          )}
          {!autoStatusEnabled
            ? "Вернуть автоматический расчёт"
            : "Зафиксировать статус вручную"}
        </button>
      </div>

      <div className="mt-6 border-t border-line pt-6">
        <label
          className="flex items-center gap-2 text-sm font-bold text-ink"
          htmlFor="skill-comment"
        >
          <MessageSquareText className="size-4 text-brand" /> Комментарий
        </label>
        <textarea
          className="mt-2 min-h-24 w-full resize-none rounded-xl border border-line px-4 py-3 text-sm leading-6 outline-none focus:border-brand focus:ring-4 focus:ring-brand/10"
          id="skill-comment"
          onChange={(event) => setComment(event.target.value)}
          placeholder="Наблюдения после занятия"
          value={comment}
        />
        <button
          className="mt-2 cursor-pointer text-sm font-bold text-brand"
          onClick={() =>
            onAction({
              action: "UPDATE_SKILL_COMMENT",
              title: "Сохранить комментарий",
              comment,
            })
          }
          type="button"
        >
          Сохранить комментарий
        </button>
      </div>

      <div className="mt-7 border-t border-line pt-6">
        <p className="flex items-center gap-2 font-bold text-ink">
          <ClipboardCheck className="size-4 text-brand" />
          Что повлияло на вывод
        </p>
        <div className="mt-3 space-y-3">
          {detail.skillEvidence.slice(0, 8).map((item) => (
            <div
              className="rounded-xl bg-panel/55 px-4 py-3 text-sm"
              key={item.id}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold text-ink">{item.source}</span>
                <span className="font-bold text-brand">
                  {Math.round(item.score * 100)}%
                </span>
              </div>
              <p className="mt-1 line-clamp-2 leading-5 text-muted">
                {item.assessmentItem?.task?.statement ??
                  item.assessmentItem?.promptSnapshot ??
                  item.reason}
              </p>
              <p className="mt-1 text-xs text-muted">
                {formatDate(item.occurredAt)} · {item.independence}
                {item.errorType ? ` · ${item.errorType}` : ""}
              </p>
            </div>
          ))}
          {detail.skillEvidence.length === 0 && (
            <p className="text-sm leading-6 text-muted">
              Подтверждающих попыток пока нет.
            </p>
          )}
        </div>
      </div>

      <div className="mt-7 border-t border-line pt-6">
        <p className="flex items-center gap-2 font-bold text-ink">
          <History className="size-4 text-brand" /> Как менялся уровень
        </p>
        <div className="mt-4 flex h-28 items-end gap-2">
          {[...detail.skillStateRevisions]
            .reverse()
            .slice(-12)
            .map((revision) => (
              <div
                className="group relative flex min-w-0 flex-1 items-end"
                key={`${revision.calculatedAt}-${revision.mastery}`}
                title={`${formatDate(revision.calculatedAt)}: ${percent(revision.mastery)}`}
              >
                <span
                  className="block w-full rounded-t-md bg-brand/70 transition group-hover:bg-brand"
                  style={{
                    height: `${Math.max(8, Math.round(revision.mastery * 100))}%`,
                  }}
                />
              </div>
            ))}
        </div>
        {detail.skillStateRevisions.length === 0 && (
          <p className="mt-3 text-sm text-muted">
            История начнёт накапливаться после следующего пересчёта профиля.
          </p>
        )}
      </div>
    </div>
  );
}
