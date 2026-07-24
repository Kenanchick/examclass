import type { LucideIcon } from "lucide-react";
import {
  Bot,
  ClipboardCheck,
  FileText,
  Headphones,
  House,
  MessagesSquare,
  MonitorUp,
  Star,
  Target,
  UsersRound,
} from "lucide-react";
import type { AccountMode } from "@/features/account-mode/model/use-account-mode-store";

export type StudentNavigationItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

const baseNavigation: StudentNavigationItem[] = [
  { label: "Главная", icon: House, href: "/dashboard" },
  { label: "Избранное", icon: Star, href: "/favorites" },
  { label: "Домашние", icon: ClipboardCheck, href: "/homework" },
  { label: "Варианты", icon: FileText },
  { label: "Сообщения", icon: MessagesSquare },
  { label: "AI Помощник", icon: Bot },
  { label: "Доска", icon: MonitorUp },
  { label: "Траектория подготовки", icon: Target },
  { label: "Поддержка", icon: Headphones },
];

const studentsNavigationItem: StudentNavigationItem = {
  label: "Ученики",
  icon: UsersRound,
  href: "/students",
};

export function getStudentNavigation(mode: AccountMode) {
  if (mode === "student") {
    return baseNavigation;
  }

  return [
    ...baseNavigation.slice(0, 3),
    studentsNavigationItem,
    ...baseNavigation.slice(3),
  ];
}
