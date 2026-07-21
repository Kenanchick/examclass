import type { TransformFnParams } from 'class-transformer';

export const normalizeEmail = ({
  value,
}: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim().toLowerCase() : undefined;

export const normalizeText = ({
  value,
}: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;
