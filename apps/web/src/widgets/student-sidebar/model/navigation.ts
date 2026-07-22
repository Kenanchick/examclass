import type { LucideIcon } from "lucide-react";
import {
  Bot,
  ClipboardCheck,
  FileText,
  Headphones,
  House,
  MessagesSquare,
  MonitorUp,
  Target,
} from "lucide-react";

export type StudentNavigationItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

export const studentNavigation: StudentNavigationItem[] = [
  { label: "Главная", icon: House, active: true },
  { label: "Домашние", icon: ClipboardCheck },
  { label: "Варианты", icon: FileText },
  { label: "Сообщения", icon: MessagesSquare },
  { label: "AI Помощник", icon: Bot },
  { label: "Доска", icon: MonitorUp },
  { label: "Траектория подготовки", icon: Target },
  { label: "Поддержка", icon: Headphones },
];
