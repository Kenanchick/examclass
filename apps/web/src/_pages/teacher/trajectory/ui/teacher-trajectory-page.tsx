"use client";

import { ArrowLeft, Map, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useDeleteTeacherNodeReviewMutation,
  useTeacherModuleActionMutation,
  useTeacherNodeReviewMutation,
  useTeacherRoadmapOrderMutation,
  useTeacherRoadmapQuery,
  useTeacherSkillActionMutation,
  useTeacherSkillDetailQuery,
  useTeacherSubtopicStatusMutation,
} from "@/entities/learning-route/api/use-teacher-route-query";
import type {
  TeacherModuleActionInput,
  TeacherSkillActionInput,
} from "@/entities/learning-route/model/teacher-route";
import { useRequireAuthModal } from "@/features/auth/modal/model/use-require-auth-modal";
import { useTeacherRouteWorkspaceStore } from "@/features/learning-route/model/use-teacher-route-workspace-store";
import { TeacherCustomModuleDetail } from "@/features/learning-route/ui/teacher-custom-roadmap";
import { TeacherRoadmapBoard } from "@/features/learning-route/ui/teacher-roadmap-board";
import { TeacherRouteActionDialog } from "@/features/learning-route/ui/teacher-route-action-dialog";
import {
  TeacherSkillDetailPanel,
  type SkillActionRequest,
} from "@/features/learning-route/ui/teacher-skill-detail";
import { TeacherTopicMetroMap } from "@/features/learning-route/ui/teacher-topic-metro-map";
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

export function TeacherTrajectoryPage({
  studentId,
}: TeacherTrajectoryPageProps) {
  const { hasAccessToken, openLogin } = useRequireAuthModal();
  const enabled = hasAccessToken === true;
  const roadmapQuery = useTeacherRoadmapQuery(studentId, enabled);
  const roadmapOrderMutation = useTeacherRoadmapOrderMutation(studentId);
  const activateStudent = useTeacherRouteWorkspaceStore(
    (state) => state.activateStudent,
  );
  const selectedExamNumber = useTeacherRouteWorkspaceStore(
    (state) => state.selectedExamNumber,
  );
  const selectedSkillCode = useTeacherRouteWorkspaceStore(
    (state) => state.selectedSkillCode,
  );
  const editMode = useTeacherRouteWorkspaceStore((state) => state.editMode);
  const selectExamNumber = useTeacherRouteWorkspaceStore(
    (state) => state.selectExamNumber,
  );
  const selectSkill = useTeacherRouteWorkspaceStore(
    (state) => state.selectSkill,
  );
  const toggleEditMode = useTeacherRouteWorkspaceStore(
    (state) => state.toggleEditMode,
  );
  const skillDetailQuery = useTeacherSkillDetailQuery(
    studentId,
    selectedSkillCode,
  );
  const skillMutation = useTeacherSkillActionMutation(studentId);
  const subtopicMutation = useTeacherSubtopicStatusMutation(studentId);
  const nodeReviewMutation = useTeacherNodeReviewMutation(studentId);
  const deleteNodeReviewMutation =
    useDeleteTeacherNodeReviewMutation(studentId);
  const moduleMutation = useTeacherModuleActionMutation(studentId);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedCustomModuleKey, setSelectedCustomModuleKey] = useState<
    string | null
  >(null);

  useEffect(() => {
    activateStudent(studentId);
  }, [activateStudent, studentId]);

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

  const openSkillAction = (request: SkillActionRequest) => {
    if (!selectedSkillCode) return;
    const { title, immediate, ...data } = request;
    setActionError(null);
    if (immediate) {
      const skillData: TeacherSkillActionInput = {
        ...data,
        reason:
          data.action === "SCHEDULE_REVIEW"
            ? "Добавлено преподавателем в повторение"
            : data.status === "UNSTUDIED"
              ? "Возвращено преподавателем в состояние «Не пройдено»"
              : "Отмечено преподавателем как пройденное",
        ...(data.action === "SCHEDULE_REVIEW" && selectedExamNumber
          ? { sourceExamNumber: selectedExamNumber }
          : {}),
      };
      skillMutation.mutate(
        { studentId, skillCode: selectedSkillCode, data: skillData },
        {
          onError: (error) =>
            setActionError(
              getApiErrorMessage(error, "Не удалось изменить навык."),
            ),
        },
      );
      return;
    }
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

  if (hasAccessToken === null || roadmapQuery.isPending) {
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

  if (roadmapQuery.isError || !roadmapQuery.data) {
    return (
      <StudentLayout>
        <main className="p-5 sm:p-8">
          <RequestState
            description="Проверьте, что ученик завершил стартовую диагностику и добавлен в ваш класс."
            onRetry={() => {
              void roadmapQuery.refetch();
            }}
            title="Маршрут пока недоступен"
            variant="error"
          />
        </main>
      </StudentLayout>
    );
  }

  const roadmap = roadmapQuery.data;
  const selectedNode =
    roadmap.nodes.find((node) => node.examNumber === selectedExamNumber) ??
    null;
  const selectedCustomModule =
    roadmap.customNodes.find(
      (module) => module.moduleKey === selectedCustomModuleKey,
    ) ?? null;

  return (
    <StudentLayout>
      <main className="fixed inset-0 z-[55] min-w-0 bg-[#f8fbfd]">
        <div className="h-full">
          <div
            aria-hidden={Boolean(selectedNode)}
            className={`h-full origin-center transition-[opacity,transform,filter] duration-500 ${
              selectedNode
                ? "pointer-events-none -translate-x-10 scale-[0.97] opacity-0 blur-[2px]"
                : ""
            }`}
          >
            <TeacherRoadmapBoard
              editMode={editMode}
              header={
                <header className="flex min-w-0 items-center gap-3">
                  <Link
                    aria-label="К ученикам"
                    className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-white text-muted transition hover:border-[#a8c7df] hover:text-brand"
                    href="/students"
                  >
                    <ArrowLeft className="size-4" />
                  </Link>
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4ff] text-brand">
                    <Map className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand">
                      Персональная карта
                    </p>
                    <h1 className="truncate text-lg font-bold tracking-[-0.04em] text-ink sm:text-xl">
                      {roadmap.student.name}
                    </h1>
                  </div>
                </header>
              }
              isOrderSaving={roadmapOrderMutation.isPending}
              onCustomOpen={(moduleKey) => {
                selectExamNumber(null);
                selectSkill(null);
                setSelectedCustomModuleKey(moduleKey);
              }}
              onEditModeToggle={toggleEditMode}
              onNodeOpen={(examNumber) => {
                setSelectedCustomModuleKey(null);
                selectExamNumber(examNumber);
              }}
              onOrderSave={async (examNumbers) => {
                try {
                  await roadmapOrderMutation.mutateAsync({
                    studentId,
                    data: {
                      examNumbers,
                      reason:
                        "Преподаватель изменил порядок прохождения экзаменационных заданий",
                    },
                  });
                } catch (error) {
                  throw new Error(
                    getApiErrorMessage(
                      error,
                      "Не удалось сохранить порядок заданий.",
                    ),
                  );
                }
              }}
              onReviewRemove={(examNumber) => {
                setActionError(null);
                deleteNodeReviewMutation.mutate(
                  { studentId, examNumber },
                  {
                    onError: (error) =>
                      setActionError(
                        getApiErrorMessage(
                          error,
                          "Не удалось удалить карточку повторения.",
                        ),
                      ),
                  },
                );
              }}
              paused={Boolean(selectedNode)}
              roadmap={roadmap}
              selectedExamNumber={selectedExamNumber}
            />
          </div>
        </div>
      </main>

      {selectedNode && (
        <TeacherTopicMetroMap
          node={selectedNode}
          onClose={() => {
            selectSkill(null);
            selectExamNumber(null);
          }}
          onSubtopicStatusChange={({ code, name, status }) => {
            setActionError(null);
            subtopicMutation.mutate(
              {
                studentId,
                subtopicCode: code,
                data: {
                  status,
                  reason:
                    status === "MASTERED"
                      ? `Отмечено преподавателем как пройденное: «${name}»`
                      : `Возвращено преподавателем в состояние «Не пройдено»: «${name}»`,
                },
              },
              {
                onError: (error) =>
                  setActionError(
                    getApiErrorMessage(error, "Не удалось отметить подтему."),
                  ),
              },
            );
          }}
          onReviewNode={() => {
            setActionError(null);
            nodeReviewMutation.mutate(
              { studentId, examNumber: selectedNode.examNumber },
              {
                onError: (error) =>
                  setActionError(
                    getApiErrorMessage(
                      error,
                      "Не удалось отправить задание на повторение.",
                    ),
                  ),
              },
            );
          }}
          onSkillOpen={selectSkill}
        />
      )}

      {selectedCustomModule && (
        <TeacherCustomModuleDetail
          editMode={editMode}
          module={selectedCustomModule}
          onAction={openModuleAction}
          onClose={() => setSelectedCustomModuleKey(null)}
        />
      )}

      {selectedSkillCode && selectedNode && (
        <>
          <button
            aria-label="Вернуться к обзору задания"
            className="fixed inset-0 z-[70] cursor-default bg-[#102840]/10"
            onClick={() => selectSkill(null)}
            type="button"
          />
          <aside className="fixed inset-x-3 bottom-3 z-[75] max-h-[84vh] overflow-hidden rounded-[1.75rem] border border-line bg-white shadow-[0_28px_80px_rgba(12,37,61,0.28)] sm:inset-y-4 sm:left-auto sm:right-4 sm:max-h-none sm:w-[520px]">
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
