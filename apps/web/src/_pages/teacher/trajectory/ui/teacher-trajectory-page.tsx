"use client";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  History,
  Save,
  Target,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  useCreateTeacherRouteModuleMutation,
  useTeacherLearningRouteQuery,
  useTeacherModuleActionMutation,
  useTeacherRoadmapQuery,
  useTeacherRouteHistoryQuery,
  useTeacherSkillActionMutation,
  useTeacherSkillDetailQuery,
  useUpdateTeacherWeeklyLoadMutation,
} from "@/entities/learning-route/api/use-teacher-route-query";
import type {
  TeacherModuleActionInput,
  TeacherRouteModule,
} from "@/entities/learning-route/model/teacher-route";
import { useRequireAuthModal } from "@/features/auth/modal/model/use-require-auth-modal";
import { useTeacherRouteWorkspaceStore } from "@/features/learning-route/model/use-teacher-route-workspace-store";
import { TeacherRoadmapBoard } from "@/features/learning-route/ui/teacher-roadmap-board";
import { TeacherRoadmapDetail } from "@/features/learning-route/ui/teacher-roadmap-detail";
import { TeacherRouteActionDialog } from "@/features/learning-route/ui/teacher-route-action-dialog";
import { TeacherRouteModuleList } from "@/features/learning-route/ui/teacher-route-module-list";
import {
  TeacherSkillDetailPanel,
  type SkillActionRequest,
} from "@/features/learning-route/ui/teacher-skill-detail";
import { getApiErrorMessage } from "@/shared/lib/get-api-error-message";
import { RequestState } from "@/shared/ui/request-state/request-state";
import { StudentLayout } from "@/widgets/student-layout/ui/student-layout";

type TeacherTrajectoryPageProps = {
  studentId: string;
};

type PendingAction =
  | {
      scope: "module";
      moduleKey: string;
      title: string;
      data: Omit<TeacherModuleActionInput, "reason">;
    }
  | {
      scope: "skill";
      skillCode: string;
      title: string;
      data: Omit<SkillActionRequest, "title">;
    };

const formatExamDate = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const actionLabels: Record<string, string> = {
  CONFIRM_SYSTEM_CONCLUSION: "Подтверждён вывод системы",
  CHANGE_SKILL_STATUS: "Изменён статус навыка",
  CLEAR_SKILL_STATUS: "Возвращён автоматический статус",
  MARK_TAUGHT: "Тема отмечена пройденной",
  MARK_REINFORCED: "Тема отмечена закреплённой",
  SCHEDULE_CONTROL: "Назначен контроль",
  SCHEDULE_REVIEW: "Назначено повторение",
  MOVE_MODULE: "Изменён порядок модулей",
  PIN_MODULE: "Модуль закреплён",
  UNPIN_MODULE: "Модуль откреплён",
  HIDE_MODULE: "Модуль скрыт",
  SHOW_MODULE: "Модуль возвращён",
  SET_MODULE_AUTOMATION: "Изменена автоматизация модуля",
  SET_SKILL_AUTOMATION: "Изменена автоматизация навыка",
  ADD_CUSTOM_MODULE: "Добавлена собственная тема",
  UPDATE_WEEKLY_LOAD: "Изменена недельная нагрузка",
  UPDATE_SKILL_COMMENT: "Обновлён комментарий к навыку",
};

export function TeacherTrajectoryPage({
  studentId,
}: TeacherTrajectoryPageProps) {
  const { hasAccessToken, openLogin } = useRequireAuthModal();
  const enabled = hasAccessToken === true;
  const routeQuery = useTeacherLearningRouteQuery(studentId, enabled);
  const roadmapQuery = useTeacherRoadmapQuery(studentId, enabled);
  const historyQuery = useTeacherRouteHistoryQuery(studentId, enabled);
  const activateStudent = useTeacherRouteWorkspaceStore(
    (state) => state.activateStudent,
  );
  const selectedExamNumber = useTeacherRouteWorkspaceStore(
    (state) => state.selectedExamNumber,
  );
  const selectedSkillCode = useTeacherRouteWorkspaceStore(
    (state) => state.selectedSkillCode,
  );
  const mapMode = useTeacherRouteWorkspaceStore((state) => state.mapMode);
  const editMode = useTeacherRouteWorkspaceStore((state) => state.editMode);
  const showHiddenModules = useTeacherRouteWorkspaceStore(
    (state) => state.showHiddenModules,
  );
  const selectExamNumber = useTeacherRouteWorkspaceStore(
    (state) => state.selectExamNumber,
  );
  const selectSkill = useTeacherRouteWorkspaceStore(
    (state) => state.selectSkill,
  );
  const setMapMode = useTeacherRouteWorkspaceStore(
    (state) => state.setMapMode,
  );
  const toggleEditMode = useTeacherRouteWorkspaceStore(
    (state) => state.toggleEditMode,
  );
  const toggleHiddenModules = useTeacherRouteWorkspaceStore(
    (state) => state.toggleHiddenModules,
  );
  const skillDetailQuery = useTeacherSkillDetailQuery(
    studentId,
    selectedSkillCode,
  );
  const skillMutation = useTeacherSkillActionMutation(studentId);
  const moduleMutation = useTeacherModuleActionMutation(studentId);
  const customModuleMutation = useCreateTeacherRouteModuleMutation(studentId);
  const weeklyLoadMutation = useUpdateTeacherWeeklyLoadMutation(studentId);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [weeklyMinutes, setWeeklyMinutes] = useState("");
  const [weeklyReason, setWeeklyReason] = useState("");
  const [weeklyMessage, setWeeklyMessage] = useState<string | null>(null);

  useEffect(() => {
    activateStudent(studentId);
  }, [activateStudent, studentId]);

  useEffect(() => {
    if (routeQuery.data) {
      setWeeklyMinutes(String(routeQuery.data.goal.weeklyMinutes));
    }
  }, [routeQuery.data]);

  const openModuleAction = ({
    moduleKey,
    title,
    data,
  }: {
    moduleKey: string;
    title: string;
    data: Omit<TeacherModuleActionInput, "reason">;
  }) => {
    setActionError(null);
    setPendingAction({ scope: "module", moduleKey, title, data });
  };

  const openListModuleAction = (
    module: TeacherRouteModule,
    action: {
      action: string;
      direction?: "UP" | "DOWN";
      enabled?: boolean;
      title: string;
    },
  ) =>
    openModuleAction({
      moduleKey: module.moduleKey,
      title: action.title,
      data: {
        action: action.action,
        direction: action.direction,
        enabled: action.enabled,
      },
    });

  const openSkillAction = (request: SkillActionRequest) => {
    if (!selectedSkillCode) return;
    const { title, ...data } = request;
    setActionError(null);
    setPendingAction({
      scope: "skill",
      skillCode: selectedSkillCode,
      title,
      data,
    });
  };

  const confirmAction = (reason: string) => {
    if (!pendingAction) return;
    setActionError(null);
    if (pendingAction.scope === "module") {
      moduleMutation.mutate(
        {
          studentId,
          moduleKey: pendingAction.moduleKey,
          data: { ...pendingAction.data, reason },
        },
        {
          onSuccess: () => setPendingAction(null),
          onError: (error) =>
            setActionError(
              getApiErrorMessage(error, "Не удалось изменить модуль."),
            ),
        },
      );
      return;
    }
    skillMutation.mutate(
      {
        studentId,
        skillCode: pendingAction.skillCode,
        data: { ...pendingAction.data, reason },
      },
      {
        onSuccess: () => setPendingAction(null),
        onError: (error) =>
          setActionError(
            getApiErrorMessage(error, "Не удалось изменить навык."),
          ),
      },
    );
  };

  const updateWeeklyLoad = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Number(weeklyMinutes);
    if (!Number.isFinite(value) || weeklyReason.trim().length < 3) return;
    setWeeklyMessage(null);
    weeklyLoadMutation.mutate(
      {
        studentId,
        weeklyMinutes: value,
        reason: weeklyReason.trim(),
      },
      {
        onSuccess: () => {
          setWeeklyReason("");
          setWeeklyMessage("Нагрузка обновлена, маршрут пересчитан.");
        },
        onError: (error) =>
          setWeeklyMessage(
            getApiErrorMessage(error, "Не удалось изменить нагрузку."),
          ),
      },
    );
  };

  if (hasAccessToken === false) {
    return (
      <StudentLayout>
        <main className="p-5 sm:p-8">
          <RequestState
            description="Войдите в аккаунт преподавателя, чтобы управлять маршрутом ученика."
            onRetry={openLogin}
            retryLabel="Войти"
            title="Маршрут доступен после входа"
            variant="empty"
          />
        </main>
      </StudentLayout>
    );
  }

  if (
    hasAccessToken === null ||
    routeQuery.isPending ||
    roadmapQuery.isPending
  ) {
    return (
      <StudentLayout>
        <main className="p-5 sm:p-8">
          <RequestState
            description="Располагаем 19 заданий, соединяем зависимости и собираем данные ученика."
            title="Строим визуальную траекторию…"
            variant="loading"
          />
        </main>
      </StudentLayout>
    );
  }

  if (
    routeQuery.isError ||
    roadmapQuery.isError ||
    !routeQuery.data ||
    !roadmapQuery.data
  ) {
    return (
      <StudentLayout>
        <main className="p-5 sm:p-8">
          <RequestState
            description="Проверьте, что ученик завершил стартовую диагностику и добавлен в ваш класс."
            onRetry={() => {
              void routeQuery.refetch();
              void roadmapQuery.refetch();
            }}
            title="Маршрут пока недоступен"
            variant="error"
          />
        </main>
      </StudentLayout>
    );
  }

  const route = routeQuery.data;
  const roadmap = roadmapQuery.data;
  const selectedNode =
    roadmap.nodes.find(
      (node) => node.examNumber === selectedExamNumber,
    ) ?? null;

  return (
    <StudentLayout>
      <main className="min-w-0 p-4 sm:p-6 lg:p-7">
        <div className="mx-auto max-w-[1760px] space-y-5">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-muted transition hover:text-brand"
            href="/students"
          >
            <ArrowLeft className="size-4" /> К ученикам
          </Link>

          <header className="relative overflow-hidden rounded-[2rem] border border-[#c6ddf5] bg-[#eef6ff] px-6 py-7 sm:px-9 sm:py-8">
            <div className="absolute -right-20 -top-24 size-80 rounded-full border-[34px] border-white/65" />
            <div className="absolute -bottom-28 right-48 size-64 rounded-full bg-[#dceeff]/80" />
            <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.13em] text-brand">
                  <UsersRound className="size-4" /> Персональная траектория
                </p>
                <h1 className="mt-2 text-4xl font-bold tracking-[-0.055em] text-ink sm:text-5xl">
                  {roadmap.student.name}
                </h1>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted sm:text-base">
                  <span className="inline-flex items-center gap-2">
                    <Target className="size-4 text-brand" /> Цель{" "}
                    {roadmap.goal.targetScore}+
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4 text-brand" />
                    {formatExamDate(roadmap.goal.examDate)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="size-4 text-brand" />
                    {roadmap.goal.weeklyMinutes} минут в неделю
                  </span>
                </div>
              </div>
              <div className="max-w-md text-sm leading-6 text-muted">
                Все задания ЕГЭ показаны как единый маршрут. Толстая линия —
                основной порядок, пунктир — важные связи между темами.
              </div>
            </div>
          </header>

          {route.isStale && (
            <p className="rounded-2xl border border-[#eed6a9] bg-[#fff9ed] px-5 py-3 text-sm font-semibold text-[#8c5a0a]">
              Появились новые результаты. Закреплённые преподавателем части
              сохранятся при обновлении маршрута.
            </p>
          )}

          <TeacherRoadmapBoard
            editMode={editMode}
            mode={mapMode}
            onEditModeToggle={toggleEditMode}
            onModeChange={setMapMode}
            onNodeOpen={selectExamNumber}
            roadmap={roadmap}
            selectedExamNumber={selectedExamNumber}
          />

          {editMode && (
            <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
              <TeacherRouteModuleList
                isCreating={customModuleMutation.isPending}
                modules={route.modules}
                onAddCustom={(data) =>
                  customModuleMutation.mutate({ studentId, data })
                }
                onModuleAction={openListModuleAction}
                onSelectSkill={selectSkill}
                onToggleHidden={toggleHiddenModules}
                selectedSkillCode={selectedSkillCode}
                showHidden={showHiddenModules}
              />
              <form
                className="rounded-[2rem] border border-line bg-white p-5 shadow-[0_16px_40px_rgba(15,43,76,0.04)]"
                onSubmit={updateWeeklyLoad}
              >
                <h2 className="text-xl font-bold tracking-[-0.035em] text-ink">
                  Недельная нагрузка
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Изменение нагрузки перестроит автоматическую часть маршрута.
                </p>
                <label className="mt-5 block text-sm font-bold text-ink">
                  Минут в неделю
                  <input
                    className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-brand"
                    min={30}
                    onChange={(event) => setWeeklyMinutes(event.target.value)}
                    step={15}
                    type="number"
                    value={weeklyMinutes}
                  />
                </label>
                <label className="mt-4 block text-sm font-bold text-ink">
                  Причина изменения
                  <input
                    className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
                    onChange={(event) => setWeeklyReason(event.target.value)}
                    placeholder="Например, изменилось расписание"
                    value={weeklyReason}
                  />
                </label>
                <button
                  className="mt-4 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand text-sm font-bold text-white disabled:opacity-50"
                  disabled={weeklyLoadMutation.isPending}
                  type="submit"
                >
                  <Save className="size-4" />
                  Сохранить нагрузку
                </button>
                {weeklyMessage && (
                  <p className="mt-3 text-sm font-semibold text-brand">
                    {weeklyMessage}
                  </p>
                )}
              </form>
            </section>
          )}

          <section className="rounded-[2rem] border border-line bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,43,76,0.04)] sm:px-7">
            <details>
              <summary className="flex cursor-pointer list-none items-center gap-3 text-lg font-bold text-ink">
                <History className="size-5 text-brand" />
                История решений преподавателя
                <span className="ml-auto text-sm font-semibold text-muted">
                  {historyQuery.data?.length ?? 0}
                </span>
              </summary>
              <div className="mt-5 divide-y divide-line border-t border-line">
                {(historyQuery.data ?? []).map((item) => (
                  <div
                    className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_auto]"
                    key={item.publicId}
                  >
                    <div>
                      <p className="font-bold text-ink">
                        {actionLabels[item.action] ?? "Изменён маршрут"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {item.reason}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-muted sm:text-right">
                      {item.author.name}
                      <br />
                      {new Intl.DateTimeFormat("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(item.createdAt))}
                    </p>
                  </div>
                ))}
                {historyQuery.data?.length === 0 && (
                  <p className="py-5 text-sm text-muted">
                    Ручных изменений пока не было.
                  </p>
                )}
              </div>
            </details>
          </section>
        </div>
      </main>

      {selectedNode && (
        <TeacherRoadmapDetail
          editMode={editMode}
          node={selectedNode}
          onClose={() => {
            selectSkill(null);
            selectExamNumber(null);
          }}
          onModuleAction={({ moduleKey, title, data }) =>
            openModuleAction({ moduleKey, title, data })
          }
          onSkillOpen={selectSkill}
        />
      )}

      {selectedSkillCode && selectedNode && (
        <>
          <button
            aria-label="Вернуться к обзору задания"
            className="fixed inset-0 z-[55] cursor-default bg-[#102840]/10"
            onClick={() => selectSkill(null)}
            type="button"
          />
          <aside className="fixed inset-x-3 bottom-3 z-[60] max-h-[84vh] overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[0_28px_80px_rgba(12,37,61,0.28)] sm:inset-y-4 sm:left-auto sm:right-4 sm:max-h-none sm:w-[520px]">
            <button
              aria-label="Вернуться к заданию"
              className="absolute right-4 top-4 z-10 grid size-10 cursor-pointer place-items-center rounded-xl bg-white text-muted shadow-sm transition hover:bg-panel hover:text-ink"
              onClick={() => selectSkill(null)}
              type="button"
            >
              <X className="size-5" />
            </button>
            <TeacherSkillDetailPanel
              detail={skillDetailQuery.data}
              isError={skillDetailQuery.isError}
              isPending={skillDetailQuery.isPending}
              onAction={openSkillAction}
              onClose={() => selectSkill(null)}
              onRetry={() => void skillDetailQuery.refetch()}
            />
          </aside>
        </>
      )}

      <TeacherRouteActionDialog
        description="Изменение сохранится с вашим именем, причиной и точным временем."
        error={actionError}
        isOpen={Boolean(pendingAction)}
        isPending={skillMutation.isPending || moduleMutation.isPending}
        onClose={() => {
          if (!skillMutation.isPending && !moduleMutation.isPending) {
            setPendingAction(null);
            setActionError(null);
          }
        }}
        onConfirm={confirmAction}
        title={pendingAction?.title ?? "Изменить маршрут"}
      />
    </StudentLayout>
  );
}
