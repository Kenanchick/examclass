import { gradeExactAnswer, normalizeShortAnswer } from './answer-grading';

describe('answer grading', () => {
  it('нормализует пробелы, десятичную запятую и знак минус', () => {
    expect(normalizeShortAnswer(' − 0,50 ')).toBe('-0.50');
  });

  it('считает равными десятичную и простую дробь', () => {
    expect(gradeExactAnswer('1/2', '0,5')).toBe(true);
  });

  it('поддерживает несколько допустимых ответов', () => {
    expect(gradeExactAnswer('7', '5 || 7')).toBe(true);
  });

  it('не пытается угадывать эквивалентность сложных выражений', () => {
    expect(gradeExactAnswer('sqrt(3)', '√3')).toBe(false);
  });
});
