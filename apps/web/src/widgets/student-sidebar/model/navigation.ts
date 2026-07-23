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
} from "lucide-react";

export type StudentNavigationItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

export const studentNavigation: StudentNavigationItem[] = [
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
