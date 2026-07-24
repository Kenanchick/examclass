"use client";

import { UsersRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toggleSelection, toggleSelectionGroup } from "../lib/selection";
import type { TeacherHomeworkStudent } from "../model/teacher-homework";

type TeacherHomeworkStudentSelectorProps = {
  students: TeacherHomeworkStudent[];
  selectedStudentIds: string[];
  errorMessage?: string;
  onSelectionChange: (studentIds: string[]) => void;
};

type StudentGroup = {
  id: string;
  title: string;
  students: TeacherHomeworkStudent[];
};

const searchFieldClassName =
  "mt-2 h-12 w-full rounded-2xl border border-line bg-white px-4 pr-10 text-base text-ink outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-4 focus:ring-brand/10";

function getStudentGroups(students: TeacherHomeworkStudent[]) {
  const groupsById = new Map<string, StudentGroup>();

  for (const student of students) {
    const group = groupsById.get(student.classroom.id);

    if (group) {
      group.students.push(student);
      continue;
    }

    groupsById.set(student.classroom.id, {
      id: student.classroom.id,
      title: student.classroom.title,
      students: [student],
    });
  }

  return [...groupsById.values()];
}

export function TeacherHomeworkStudentSelector({
  students,
  selectedStudentIds,
  errorMessage,
  onSelectionChange,
}: TeacherHomeworkStudentSelectorProps) {
  const [studentSearch, setStudentSearch] = useState("");
  const normalizedSearch = studentSearch.trim().toLocaleLowerCase();
  const visibleStudents = useMemo(
    () =>
      students.filter((student) => {
        if (!normalizedSearch) {
          return true;
        }

        return [student.name, student.email, student.classroom.title].some(
          (value) => value.toLocaleLowerCase().includes(normalizedSearch),
        );
      }),
    [normalizedSearch, students],
  );
  const studentGroups = useMemo(
    () => getStudentGroups(visibleStudents),
    [visibleStudents],
  );
  const selectedStudentIdSet = new Set(selectedStudentIds);

  return (
    <fieldset className="border-t border-line pt-7">
      <legend className="flex items-center gap-2 text-base font-bold text-ink">
        <UsersRound className="size-5 text-brand" />
        Кому назначить
      </legend>
      <p className="mt-2 text-sm leading-6 text-muted">
        Можно выбрать одного ученика, несколько человек или целый класс.
      </p>

      <label className="relative mt-4 block">
        <input
          className={searchFieldClassName}
          onChange={(event) => setStudentSearch(event.target.value)}
          placeholder="Найти по имени, email или классу"
          type="search"
          value={studentSearch}
        />
        {studentSearch && (
          <button
            className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-muted transition hover:bg-panel hover:text-ink"
            onClick={() => setStudentSearch("")}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
            <span className="sr-only">Очистить поиск учеников</span>
          </button>
        )}
      </label>

      {studentGroups.length > 0 ? (
        <div className="mt-4 max-h-105 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
          {studentGroups.map((group) => {
            const groupStudentIds = group.students.map((student) => student.id);
            const selectedInGroup = groupStudentIds.filter((studentId) =>
              selectedStudentIdSet.has(studentId),
            ).length;
            const isGroupSelected = selectedInGroup === group.students.length;

            return (
              <div
                className="rounded-2xl border border-line bg-page/60 p-3"
                key={group.id}
              >
                <div className="flex items-center justify-between gap-3 px-1 pb-3">
                  <div>
                    <p className="font-bold text-ink">{group.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      Выбрано: {selectedInGroup} из {group.students.length}
                    </p>
                  </div>
                  <button
                    className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand transition hover:bg-brand/10"
                    onClick={() =>
                      onSelectionChange(
                        toggleSelectionGroup(
                          selectedStudentIds,
                          groupStudentIds,
                        ),
                      )
                    }
                    type="button"
                  >
                    {isGroupSelected ? "Снять выбор" : "Выбрать класс"}
                  </button>
                </div>

                <div className="space-y-1">
                  {group.students.map((student) => {
                    const isSelected = selectedStudentIdSet.has(student.id);

                    return (
                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                          isSelected
                            ? "bg-white text-ink shadow-[0_2px_8px_rgba(15,43,76,0.05)]"
                            : "text-muted hover:bg-white/70"
                        }`}
                        key={student.id}
                      >
                        <input
                          checked={isSelected}
                          className="size-4 accent-brand"
                          onChange={() =>
                            onSelectionChange(
                              toggleSelection(selectedStudentIds, student.id),
                            )
                          }
                          type="checkbox"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-ink">
                            {student.name}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {student.email}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 px-1 py-5 text-center text-sm text-muted">
          {students.length === 0
            ? "Ученики пока не добавлены."
            : "По этому запросу учеников не найдено."}
        </div>
      )}

      {errorMessage && (
        <p className="mt-3 text-sm font-medium text-danger">{errorMessage}</p>
      )}
    </fieldset>
  );
}
