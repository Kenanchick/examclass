"use client";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  History,
  Save,
  Target,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  useCreateTeacherRouteModuleMutation,
  useTeacherKnowledgeProfileQuery,
  useTeacherLearningRouteQuery,
  useTeacherModuleActionMutation,
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
import { TeacherRouteActionDialog } from "@/features/learning-route/ui/teacher-route-action-dialog";
import { TeacherRouteModuleList } from "@/features/learning-route/ui/teacher-route-module-list";
import { TeacherSkillExplorer } from "@/features/learning-route/ui/teacher-skill-explorer";
import type { SkillActionRequest } from "@/features/learning-route/ui/teacher-skill-detail";
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
  const routeQuery = useTeacherLearningRouteQuery(
    studentId,
    hasAccessToken === true,
  );
  const profileQuery = useTeacherKnowledgeProfileQuery(
    studentId,
    hasAccessToken === true,
  );
  const historyQuery = useTeacherRouteHistoryQuery(
    studentId,
    hasAccessToken === true,
  );
  const activateStudent = useTeacherRouteWorkspaceStore(
    (state) => state.activateStudent,
  );
  const selectedSkillCode = useTeacherRouteWorkspaceStore(
    (state) => state.selectedSkillCode,
  );
  const skillSearch = useTeacherRouteWorkspaceStore(
    (state) => state.skillSearch,
  );
  const statusFilter = useTeacherRouteWorkspaceStore(
    (state) => state.statusFilter,
  );
  const showHiddenModules = useTeacherRouteWorkspaceStore(
    (state) => state.showHiddenModules,
  );
  const selectSkill = useTeacherRouteWorkspaceStore(
    (state) => state.selectSkill,
  );
  const setSkillSearch = useTeacherRouteWorkspaceStore(
    (state) => state.setSkillSearch,
  );
  const setStatusFilter = useTeacherRouteWorkspaceStore(
    (state) => state.setStatusFilter,
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

  const openModuleAction = (
    module: TeacherRouteModule,
    action: {
      action: string;
      direction?: "UP" | "DOWN";
      enabled?: boolean;
      title: string;
    },
  ) => {
    setActionError(null);
    setPendingAction({
      scope: "module",
      moduleKey: module.moduleKey,
      title: action.title,
      data: {
        action: action.action,
        direction: action.direction,
        enabled: action.enabled,
      },
    });
  };

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
    profileQuery.isPending
  ) {
    return (
      <StudentLayout>
        <main className="p-5 sm:p-8">
          <RequestState
            description="Собираем маршрут, профиль знаний и преподавательские отметки."
            title="Открываем траекторию…"
            variant="loading"
          />
        </main>
      </StudentLayout>
    );
  }

  if (
    routeQuery.isError ||
    profileQuery.isError ||
    !routeQuery.data ||
    !profileQuery.data
  ) {
    return (
      <StudentLayout>
        <main className="p-5 sm:p-8">
          <RequestState
            description="Проверьте, что ученик завершил стартовую диагностику и добавлен в ваш класс."
            onRetry={() => {
              void routeQuery.refetch();
              void profileQuery.refetch();
            }}
            title="Маршрут пока недоступен"
            variant="error"
          />
        </main>
      </StudentLayout>
    );
  }

  const route = routeQuery.data;
  const profile = profileQuery.data;

  return (
    <StudentLayout>
      <main className="min-w-0 p-4 sm:p-7 lg:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-muted transition hover:text-brand"
            href="/students"
          >
            <ArrowLeft className="size-4" /> К ученикам
          </Link>

          <header className="relative overflow-hidden rounded-[2rem] border border-[#c6ddf5] bg-[#eef6ff] px-6 py-8 sm:px-10 sm:py-10">
            <div className="absolute -right-20 -top-24 size-80 rounded-full border-[34px] border-white/65" />
            <div className="absolute -bottom-28 right-48 size-64 rounded-full bg-[#dceeff]/80" />
            <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.13em] text-brand">
                  <UsersRound className="size-4" /> Маршрут ученика
                </p>
                <h1 className="mt-3 text-4xl font-bold tracking-[-0.055em] text-ink sm:text-5xl">
                  {route.student.name}
                </h1>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted sm:text-base">
                  <span className="inline-flex items-center gap-2">
                    <Target className="size-4 text-brand" /> Цель{" "}
                    {route.goal.targetScore}+
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="size-4 text-brand" />
                    {formatExamDate(route.goal.examDate)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="size-4 text-brand" />
                    {route.goal.weeklyMinutes} минут в неделю
                  </span>
                </div>
              </div>

              <form
                className="grid w-full gap-2 rounded-2xl bg-white/75 p-4 shadow-[0_12px_30px_rgba(19,66,112,0.08)] backdrop-blur-sm sm:grid-cols-[140px_minmax(180px,1fr)_auto] xl:max-w-2xl"
                onSubmit={updateWeeklyLoad}
              >
                <input
                  className="h-11 rounded-xl border border-line bg-white px-3 text-sm font-semibold outline-none focus:border-brand"
                  min={30}
                  onChange={(event) => setWeeklyMinutes(event.target.value)}
                  step={15}
                  type="number"
                  value={weeklyMinutes}
                />
                <input
                  className="h-11 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-brand"
                  onChange={(event) => setWeeklyReason(event.target.value)}
                  placeholder="Причина изменения нагрузки"
                  value={weeklyReason}
                />
                <button
                  aria-label="Сохранить нагрузку"
                  className="grid h-11 min-w-11 cursor-pointer place-items-center rounded-xl bg-brand text-white disabled:opacity-50"
                  disabled={weeklyLoadMutation.isPending}
                  type="submit"
                >
                  <Save className="size-4" />
                </button>
                {weeklyMessage && (
                  <p className="text-xs font-semibold text-brand sm:col-span-3">
                    {weeklyMessage}
                  </p>
                )}
              </form>
            </div>
          </header>

          {route.isStale && (
            <p className="rounded-2xl border border-[#eed6a9] bg-[#fff9ed] px-5 py-3 text-sm font-semibold text-[#8c5a0a]">
              После последнего пересчёта появились новые данные. Автоматические
              части маршрута обновятся при следующем действии; зафиксированные
              модули сохранятся.
            </p>
          )}

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.8fr)]">
            <TeacherRouteModuleList
              isCreating={customModuleMutation.isPending}
              modules={route.modules}
              onAddCustom={(data) =>
                customModuleMutation.mutate({ studentId, data })
              }
              onModuleAction={openModuleAction}
              onSelectSkill={selectSkill}
              onToggleHidden={toggleHiddenModules}
              selectedSkillCode={selectedSkillCode}
              showHidden={showHiddenModules}
            />
            <TeacherSkillExplorer
              detail={skillDetailQuery.data}
              detailIsError={skillDetailQuery.isError}
              detailIsPending={skillDetailQuery.isPending}
              onAction={openSkillAction}
              onCloseDetail={() => selectSkill(null)}
              onRetryDetail={() => void skillDetailQuery.refetch()}
              onSearchChange={setSkillSearch}
              onSelectSkill={selectSkill}
              onStatusFilterChange={setStatusFilter}
              search={skillSearch}
              selectedSkillCode={selectedSkillCode}
              skills={profile.skills}
              statusFilter={statusFilter}
            />
          </div>

          <section className="rounded-[2rem] border border-line bg-white px-5 py-5 shadow-[0_16px_40px_rgba(15,43,76,0.04)] sm:px-7">
            <details>
              <summary className="flex cursor-pointer list-none items-center gap-3 text-lg font-bold text-ink">
                <History className="size-5 text-brand" />
                История ручных решений
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
                        {actionLabels[item.action] ?? item.action}
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

      <TeacherRouteActionDialog
        description="Изменение сохранится с вашим именем, причиной и точным временем. Его можно будет проверить в истории маршрута."
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
