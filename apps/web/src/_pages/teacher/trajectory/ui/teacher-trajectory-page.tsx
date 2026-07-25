"use client";

import { ArrowLeft, Map, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  useCreateTeacherRouteModuleMutation,
  useDeleteTeacherNodeReviewMutation,
  useTeacherModuleActionMutation,
  useTeacherNodeReviewMutation,
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
import {
  TeacherCustomModuleDetail,
  TeacherCustomModuleDialog,
} from "@/features/learning-route/ui/teacher-custom-roadmap";
import { TeacherRoadmapBoard } from "@/features/learning-route/ui/teacher-roadmap-board";
import { TeacherRoadmapDetail } from "@/features/learning-route/ui/teacher-roadmap-detail";
import { TeacherRouteActionDialog } from "@/features/learning-route/ui/teacher-route-action-dialog";
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

export function TeacherTrajectoryPage({
  studentId,
}: TeacherTrajectoryPageProps) {
  const { hasAccessToken, openLogin } = useRequireAuthModal();
  const enabled = hasAccessToken === true;
  const roadmapQuery = useTeacherRoadmapQuery(studentId, enabled);
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
  const customModuleMutation = useCreateTeacherRouteModuleMutation(studentId);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
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
      <main className="min-w-0 p-4 sm:p-6 lg:p-7">
        <div className="mx-auto max-w-[1760px] space-y-5">
          <Link
            className="inline-flex items-center gap-2 text-sm font-bold text-muted transition hover:text-brand"
            href="/students"
          >
            <ArrowLeft className="size-4" /> К ученикам
          </Link>

          <header className="flex flex-wrap items-end gap-x-4 gap-y-1 px-1">
            <span className="mb-1 grid size-11 place-items-center rounded-2xl bg-[#eaf4ff] text-brand">
              <Map className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">
                Персональная карта
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-[-0.05em] text-ink sm:text-4xl">
                {roadmap.student.name}
              </h1>
            </div>
          </header>

          <TeacherRoadmapBoard
            editMode={editMode}
            onAddCustom={() => setIsCustomDialogOpen(true)}
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
            roadmap={roadmap}
            selectedExamNumber={selectedExamNumber}
          />
        </div>
      </main>

      {selectedNode && (
        <TeacherRoadmapDetail
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

      <TeacherCustomModuleDialog
        isOpen={isCustomDialogOpen}
        isPending={customModuleMutation.isPending}
        onClose={() => {
          if (!customModuleMutation.isPending) setIsCustomDialogOpen(false);
        }}
        onCreate={(data) =>
          customModuleMutation.mutate(
            { studentId, data },
            {
              onSuccess: () => setIsCustomDialogOpen(false),
            },
          )
        }
      />
    </StudentLayout>
  );
}
