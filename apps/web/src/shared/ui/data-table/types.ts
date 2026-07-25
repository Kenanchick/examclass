/**
 * Декларативное описание таблицы для разбора решений (задание 16 и др.).
 * Ячейки и заголовки — строки; фрагменты в $...$ рендерятся как формулы KaTeX.
 */

export type TableAlign = "left" | "center" | "right";

export type TableSpec = {
  headers: string[];
  rows: string[][];
  /** Выравнивание по столбцам (по умолчанию по центру). */
  align?: TableAlign[];
  caption?: string;
};
