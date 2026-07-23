import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { ExamPart, PrismaClient, TaskStatus } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const graphAndMoreTasks = [
  // ========== ГРУППА A: Задача 11 — f(x) = log_a(x) по графику ==========
  {
    publicId: 'Q2L8GA',
    topicSlug: 'ege-11-logarithms',
    statement: `На рисунке изображён график функции $f(x) = \\log_a x$. Найдите значение $f(8)$.

![График функции](/tasks/log-1.svg)

**Аналоги:** [Q5N3HB](/tasks/Q5N3HB) · [Q8P6JC](/tasks/Q8P6JC)`,
    correctAnswer: '3',
    referenceSolution: `**Решение**

Точка $(2; 1)$ принадлежит графику. Составим уравнение:

$$1 = \\log_a 2 \\implies a = 2$$

Получили $f(x) = \\log_2 x$. Тогда:

$$f(8) = \\log_2 8 = 3$$

**Ответ:** $3$`,
    difficulty: 2,
    source: 'Реальные задания (ЕГЭ, ФИПИ)',
  },
  {
    publicId: 'Q5N3HB',
    topicSlug: 'ege-11-logarithms',
    statement: `На рисунке изображён график функции $f(x) = \\log_a x$. Найдите значение $f(9)$.

![График функции](/tasks/log-2.svg)

**Аналоги:** [Q2L8GA](/tasks/Q2L8GA) · [Q8P6JC](/tasks/Q8P6JC)`,
    correctAnswer: '2',
    referenceSolution: `**Решение**

Точка $(3; 1)$ принадлежит графику. Составим уравнение:

$$1 = \\log_a 3 \\implies a = 3$$

Получили $f(x) = \\log_3 x$. Тогда:

$$f(9) = \\log_3 9 = 2$$

**Ответ:** $2$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'Q8P6JC',
    topicSlug: 'ege-11-logarithms',
    statement: `На рисунке изображён график функции $f(x) = \\log_a x$. Найдите значение $f(25)$.

![График функции](/tasks/log-3.svg)

**Аналоги:** [Q2L8GA](/tasks/Q2L8GA) · [Q5N3HB](/tasks/Q5N3HB)`,
    correctAnswer: '2',
    referenceSolution: `**Решение**

Точка $(5; 1)$ принадлежит графику. Составим уравнение:

$$1 = \\log_a 5 \\implies a = 5$$

Получили $f(x) = \\log_5 x$. Тогда:

$$f(25) = \\log_5 25 = 2$$

**Ответ:** $2$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА B: Задача 11 — f(x) = log_a(x + b) по графику ==========
  {
    publicId: 'S3R7KD',
    topicSlug: 'ege-11-logarithms',
    statement: `На рисунке изображён график функции $f(x) = \\log_a(x + b)$. Найдите $f(29)$.

![График функции](/tasks/logshift-1.svg)

**Аналоги:** [S6U1MF](/tasks/S6U1MF) · [S9W4PG](/tasks/S9W4PG)`,
    correctAnswer: '10',
    referenceSolution: `**Решение**

По рисунку графику принадлежат точки $(1; 4)$ и $(-2; 0)$. Подставим их в функцию:

$$\\begin{cases} 4 = \\log_a(1 + b) \\\\ 0 = \\log_a(-2 + b) \\end{cases}$$

По определению логарифма:

$$\\begin{cases} a^4 = 1 + b \\\\ 1 = -2 + b \\end{cases}$$

Из второго уравнения $b = 3$, тогда $a^4 = 4$, значит $a = \\sqrt{2}$.

Получаем $f(x) = \\log_{\\sqrt{2}}(x + 3)$. Тогда:

$$f(29) = \\log_{\\sqrt{2}}(29 + 3) = 2\\log_2 32 = 2 \\cdot 5 = 10$$

**Ответ:** $10$`,
    difficulty: 3,
    source: 'Сборник И.В. Ященко',
  },
  {
    publicId: 'S6U1MF',
    topicSlug: 'ege-11-logarithms',
    statement: `На рисунке изображён график функции $f(x) = \\log_a(x + b)$. Найдите $f(21)$.

![График функции](/tasks/logshift-2.svg)

**Аналоги:** [S3R7KD](/tasks/S3R7KD) · [S9W4PG](/tasks/S9W4PG)`,
    correctAnswer: '4',
    referenceSolution: `**Решение**

По рисунку графику принадлежат точки $(1; 2)$ и $(-3; 0)$. Подставим их в функцию:

$$\\begin{cases} 2 = \\log_a(1 + b) \\\\ 0 = \\log_a(-3 + b) \\end{cases}$$

По определению логарифма:

$$\\begin{cases} a^2 = 1 + b \\\\ 1 = -3 + b \\end{cases}$$

Из второго уравнения $b = 4$, тогда $a^2 = 5$, значит $a = \\sqrt{5}$.

Получаем $f(x) = \\log_{\\sqrt{5}}(x + 4)$. Тогда:

$$f(21) = \\log_{\\sqrt{5}}(21 + 4) = 2\\log_5 25 = 2 \\cdot 2 = 4$$

**Ответ:** $4$`,
    difficulty: 3,
    source: 'Ященко (аналог)',
  },
  {
    publicId: 'S9W4PG',
    topicSlug: 'ege-11-logarithms',
    statement: `На рисунке изображён график функции $f(x) = \\log_a(x + b)$. Найдите $f(25)$.

![График функции](/tasks/logshift-3.svg)

**Аналоги:** [S3R7KD](/tasks/S3R7KD) · [S6U1MF](/tasks/S6U1MF)`,
    correctAnswer: '6',
    referenceSolution: `**Решение**

По рисунку графику принадлежат точки $(1; 2)$ и $(-1; 0)$. Подставим их в функцию:

$$\\begin{cases} 2 = \\log_a(1 + b) \\\\ 0 = \\log_a(-1 + b) \\end{cases}$$

По определению логарифма:

$$\\begin{cases} a^2 = 1 + b \\\\ 1 = -1 + b \\end{cases}$$

Из второго уравнения $b = 2$, тогда $a^2 = 3$, значит $a = \\sqrt{3}$.

Получаем $f(x) = \\log_{\\sqrt{3}}(x + 2)$. Тогда:

$$f(25) = \\log_{\\sqrt{3}}(25 + 2) = 2\\log_3 27 = 2 \\cdot 3 = 6$$

**Ответ:** $6$`,
    difficulty: 3,
    source: 'Ященко (аналог)',
  },

  // ========== ГРУППА C: Задача 11 — парабола по вершине и точке ==========
  {
    publicId: 'P2B5VH',
    topicSlug: 'ege-11-parabolas',
    statement: `На рисунке изображён график функции $f(x) = a(x - h)^2 + k$. Найдите значение $f(6)$.

![График функции](/tasks/parabola-v1.svg)

**Аналоги:** [P5D8WJ](/tasks/P5D8WJ) · [P8F1YK](/tasks/P8F1YK)`,
    correctAnswer: '13',
    referenceSolution: `**Решение**

По рисунку вершина параболы — точка $(2; -3)$, значит $h = 2$, $k = -3$:

$$f(x) = a(x - 2)^2 - 3$$

График проходит через точку $(4; 1)$. Подставим:

$$1 = a(4 - 2)^2 - 3$$

$$4a = 4 \\implies a = 1$$

Получили $f(x) = (x - 2)^2 - 3$. Тогда:

$$f(6) = (6 - 2)^2 - 3 = 16 - 3 = 13$$

**Ответ:** $13$`,
    difficulty: 2,
    source: 'ФИПИ',
  },
  {
    publicId: 'P5D8WJ',
    topicSlug: 'ege-11-parabolas',
    statement: `На рисунке изображён график функции $f(x) = a(x - h)^2 + k$. Найдите значение $f(5)$.

![График функции](/tasks/parabola-v2.svg)

**Аналоги:** [P2B5VH](/tasks/P2B5VH) · [P8F1YK](/tasks/P8F1YK)`,
    correctAnswer: '12',
    referenceSolution: `**Решение**

По рисунку вершина параболы — точка $(1; -4)$, значит $h = 1$, $k = -4$:

$$f(x) = a(x - 1)^2 - 4$$

График проходит через точку $(3; 0)$. Подставим:

$$0 = a(3 - 1)^2 - 4$$

$$4a = 4 \\implies a = 1$$

Получили $f(x) = (x - 1)^2 - 4$. Тогда:

$$f(5) = (5 - 1)^2 - 4 = 16 - 4 = 12$$

**Ответ:** $12$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'P8F1YK',
    topicSlug: 'ege-11-parabolas',
    statement: `На рисунке изображён график функции $f(x) = a(x - h)^2 + k$. Найдите значение $f(3)$.

![График функции](/tasks/parabola-v3.svg)

**Аналоги:** [P2B5VH](/tasks/P2B5VH) · [P5D8WJ](/tasks/P5D8WJ)`,
    correctAnswer: '-5',
    referenceSolution: `**Решение**

По рисунку вершина параболы — точка $(0; 4)$, значит $h = 0$, $k = 4$:

$$f(x) = ax^2 + 4$$

График проходит через точку $(2; 0)$. Подставим:

$$0 = a \\cdot 2^2 + 4$$

$$4a = -4 \\implies a = -1$$

Получили $f(x) = -x^2 + 4$. Тогда:

$$f(3) = -9 + 4 = -5$$

**Ответ:** $-5$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА D: Задача 5 — независимые события ==========
  {
    publicId: 'N2H6ZL',
    topicSlug: 'ege-05-independent-events',
    statement: `Вероятность попадания в мишень при одном выстреле равна $0{,}8$. Стрелок делает два выстрела. Найдите вероятность того, что он попадёт в мишень оба раза.

**Аналоги:** [N5K9XM](/tasks/N5K9XM) · [N8M2QP](/tasks/N8M2QP)`,
    correctAnswer: '0,64',
    referenceSolution: `**Решение**

Выстрелы — независимые события, поэтому вероятности перемножаются:

$$P = 0{,}8 \\cdot 0{,}8 = 0{,}64$$

**Ответ:** $0{,}64$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'N5K9XM',
    topicSlug: 'ege-05-independent-events',
    statement: `Вероятность попадания в мишень при одном выстреле равна $0{,}6$. Стрелок делает два выстрела. Найдите вероятность того, что он попадёт в мишень оба раза.

**Аналоги:** [N2H6ZL](/tasks/N2H6ZL) · [N8M2QP](/tasks/N8M2QP)`,
    correctAnswer: '0,36',
    referenceSolution: `**Решение**

Для независимых событий вероятности перемножаются:

$$P = 0{,}6 \\cdot 0{,}6 = 0{,}36$$

**Ответ:** $0{,}36$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'N8M2QP',
    topicSlug: 'ege-05-independent-events',
    statement: `Вероятность попадания в мишень при одном выстреле равна $0{,}9$. Стрелок делает два выстрела. Найдите вероятность того, что он попадёт в мишень оба раза.

**Аналоги:** [N2H6ZL](/tasks/N2H6ZL) · [N5K9XM](/tasks/N5K9XM)`,
    correctAnswer: '0,81',
    referenceSolution: `**Решение**

Для независимых событий вероятности перемножаются:

$$P = 0{,}9 \\cdot 0{,}9 = 0{,}81$$

**Ответ:** $0{,}81$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА E: Задача 7 — сумма логарифмов ==========
  {
    publicId: 'E3T5RA',
    topicSlug: 'ege-07-logarithms',
    statement: `Найдите значение выражения: $\\log_6 4 + \\log_6 9$.

**Аналоги:** [E6V8SB](/tasks/E6V8SB) · [E9X2TC](/tasks/E9X2TC)`,
    correctAnswer: '2',
    referenceSolution: `**Решение**

Сумма логарифмов равна логарифму произведения:

$$\\log_6 4 + \\log_6 9 = \\log_6(4 \\cdot 9) = \\log_6 36 = 2$$

**Ответ:** $2$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'E6V8SB',
    topicSlug: 'ege-07-logarithms',
    statement: `Найдите значение выражения: $\\log_4 8 + \\log_4 2$.

**Аналоги:** [E3T5RA](/tasks/E3T5RA) · [E9X2TC](/tasks/E9X2TC)`,
    correctAnswer: '2',
    referenceSolution: `**Решение**

Сумма логарифмов равна логарифму произведения:

$$\\log_4 8 + \\log_4 2 = \\log_4(8 \\cdot 2) = \\log_4 16 = 2$$

**Ответ:** $2$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'E9X2TC',
    topicSlug: 'ege-07-logarithms',
    statement: `Найдите значение выражения: $\\lg 4 + \\lg 25$.

**Аналоги:** [E3T5RA](/tasks/E3T5RA) · [E6V8SB](/tasks/E6V8SB)`,
    correctAnswer: '2',
    referenceSolution: `**Решение**

Сумма логарифмов равна логарифму произведения:

$$\\lg 4 + \\lg 25 = \\lg(4 \\cdot 25) = \\lg 100 = 2$$

**Ответ:** $2$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА F: Задача 10 — совместная работа ==========
  {
    publicId: 'R2Y7UD',
    topicSlug: 'ege-10-work',
    statement: `Два рабочих, работая вместе, могут выполнить заказ за $12$ дней. Первый рабочий, работая один, выполняет его за $20$ дней. За сколько дней выполнит заказ второй рабочий, работая один?

**Аналоги:** [R5A1WE](/tasks/R5A1WE) · [R8C4XF](/tasks/R8C4XF)`,
    correctAnswer: '30',
    referenceSolution: `**Решение**

Производительность первого рабочего — $\\dfrac{1}{20}$ заказа в день, обоих вместе — $\\dfrac{1}{12}$ заказа в день.

Производительность второго рабочего:

$$\\dfrac{1}{12} - \\dfrac{1}{20} = \\dfrac{5 - 3}{60} = \\dfrac{2}{60} = \\dfrac{1}{30}$$

Значит, второй рабочий выполнит заказ за $30$ дней.

**Ответ:** $30$`,
    difficulty: 2,
    source: 'ФИПИ',
  },
  {
    publicId: 'R5A1WE',
    topicSlug: 'ege-10-work',
    statement: `Два рабочих, работая вместе, могут выполнить заказ за $8$ дней. Первый рабочий, работая один, выполняет его за $12$ дней. За сколько дней выполнит заказ второй рабочий, работая один?

**Аналоги:** [R2Y7UD](/tasks/R2Y7UD) · [R8C4XF](/tasks/R8C4XF)`,
    correctAnswer: '24',
    referenceSolution: `**Решение**

Производительность второго рабочего:

$$\\dfrac{1}{8} - \\dfrac{1}{12} = \\dfrac{3 - 2}{24} = \\dfrac{1}{24}$$

Значит, второй рабочий выполнит заказ за $24$ дня.

**Ответ:** $24$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'R8C4XF',
    topicSlug: 'ege-10-work',
    statement: `Два рабочих, работая вместе, могут выполнить заказ за $6$ дней. Первый рабочий, работая один, выполняет его за $18$ дней. За сколько дней выполнит заказ второй рабочий, работая один?

**Аналоги:** [R2Y7UD](/tasks/R2Y7UD) · [R5A1WE](/tasks/R5A1WE)`,
    correctAnswer: '9',
    referenceSolution: `**Решение**

Производительность второго рабочего:

$$\\dfrac{1}{6} - \\dfrac{1}{18} = \\dfrac{3 - 1}{18} = \\dfrac{2}{18} = \\dfrac{1}{9}$$

Значит, второй рабочий выполнит заказ за $9$ дней.

**Ответ:** $9$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА G: Задача 8 — физический смысл производной ==========
  {
    publicId: 'K4E6YG',
    topicSlug: 'ege-08-physical-meaning',
    statement: `Материальная точка движется прямолинейно по закону $x(t) = t^2 - 4t + 3$ (координата в метрах, время в секундах). Найдите её скорость в момент времени $t = 5$ с (в м/с).

**Аналоги:** [K7G9ZH](/tasks/K7G9ZH) · [K1J3AI](/tasks/K1J3AI)`,
    correctAnswer: '6',
    referenceSolution: `**Решение**

Скорость — это производная координаты по времени:

$$v(t) = x'(t) = 2t - 4$$

В момент $t = 5$:

$$v(5) = 2 \\cdot 5 - 4 = 6$$

**Ответ:** $6$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'K7G9ZH',
    topicSlug: 'ege-08-physical-meaning',
    statement: `Материальная точка движется прямолинейно по закону $x(t) = t^2 - 6t + 1$ (координата в метрах, время в секундах). Найдите её скорость в момент времени $t = 8$ с (в м/с).

**Аналоги:** [K4E6YG](/tasks/K4E6YG) · [K1J3AI](/tasks/K1J3AI)`,
    correctAnswer: '10',
    referenceSolution: `**Решение**

Скорость — производная координаты:

$$v(t) = x'(t) = 2t - 6$$

В момент $t = 8$:

$$v(8) = 2 \\cdot 8 - 6 = 10$$

**Ответ:** $10$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'K1J3AI',
    topicSlug: 'ege-08-physical-meaning',
    statement: `Материальная точка движется прямолинейно по закону $x(t) = 2t^2 - 8t + 5$ (координата в метрах, время в секундах). Найдите её скорость в момент времени $t = 3$ с (в м/с).

**Аналоги:** [K4E6YG](/tasks/K4E6YG) · [K7G9ZH](/tasks/K7G9ZH)`,
    correctAnswer: '4',
    referenceSolution: `**Решение**

Скорость — производная координаты:

$$v(t) = x'(t) = 4t - 8$$

В момент $t = 3$:

$$v(3) = 4 \\cdot 3 - 8 = 4$$

**Ответ:** $4$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА H: Задача 1 — углы параллелограмма ==========
  {
    publicId: 'U5L8BJ',
    topicSlug: 'ege-01-figure-angles',
    statement: `Один угол параллелограмма больше другого на $70°$. Найдите больший угол параллелограмма. Ответ дайте в градусах.

**Аналоги:** [U8N2CK](/tasks/U8N2CK) · [U1P5DL](/tasks/U1P5DL)`,
    correctAnswer: '125',
    referenceSolution: `**Решение**

Пусть меньший угол параллелограмма равен $x°$. Тогда больший угол, односторонний с ним, равен $(x + 70)°$.

Сумма односторонних углов параллелограмма равна $180°$:

$$x + (x + 70) = 180$$

$$2x = 110$$

$$x = 55$$

Больший угол: $55 + 70 = 125°$.

**Ответ:** $125$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'U8N2CK',
    topicSlug: 'ege-01-figure-angles',
    statement: `Один угол параллелограмма больше другого на $40°$. Найдите больший угол параллелограмма. Ответ дайте в градусах.

**Аналоги:** [U5L8BJ](/tasks/U5L8BJ) · [U1P5DL](/tasks/U1P5DL)`,
    correctAnswer: '110',
    referenceSolution: `**Решение**

Пусть меньший угол равен $x°$, тогда больший равен $(x + 40)°$. Сумма односторонних углов равна $180°$:

$$x + (x + 40) = 180$$

$$2x = 140$$

$$x = 70$$

Больший угол: $70 + 40 = 110°$.

**Ответ:** $110$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'U1P5DL',
    topicSlug: 'ege-01-figure-angles',
    statement: `Один угол параллелограмма больше другого на $100°$. Найдите больший угол параллелограмма. Ответ дайте в градусах.

**Аналоги:** [U5L8BJ](/tasks/U5L8BJ) · [U8N2CK](/tasks/U8N2CK)`,
    correctAnswer: '140',
    referenceSolution: `**Решение**

Пусть меньший угол равен $x°$, тогда больший равен $(x + 100)°$. Сумма односторонних углов равна $180°$:

$$x + (x + 100) = 180$$

$$2x = 80$$

$$x = 40$$

Больший угол: $40 + 100 = 140°$.

**Ответ:** $140$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА I: Задача 12 — наименьшее значение кубической функции ==========
  {
    publicId: 'M6Q9EM',
    topicSlug: 'ege-12-extrema-derivative',
    statement: `Найдите наименьшее значение функции $y = x^3 - 3x + 5$ на отрезке $[0; 3]$.

**Аналоги:** [M9S3FN](/tasks/M9S3FN) · [M2U6GO](/tasks/M2U6GO)`,
    correctAnswer: '3',
    referenceSolution: `**Решение**

Найдём производную:

$$y' = 3x^2 - 3 = 3(x^2 - 1)$$

Критические точки: $y' = 0$ при $x = 1$ (точка $x = -1$ не входит в отрезок).

Сравним значения функции в критической точке и на концах отрезка:

$$y(0) = 5$$

$$y(1) = 1 - 3 + 5 = 3$$

$$y(3) = 27 - 9 + 5 = 23$$

Наименьшее значение — $3$.

**Ответ:** $3$`,
    difficulty: 2,
    source: 'ФИПИ',
  },
  {
    publicId: 'M9S3FN',
    topicSlug: 'ege-12-extrema-derivative',
    statement: `Найдите наименьшее значение функции $y = x^3 - 12x + 1$ на отрезке $[0; 3]$.

**Аналоги:** [M6Q9EM](/tasks/M6Q9EM) · [M2U6GO](/tasks/M2U6GO)`,
    correctAnswer: '-15',
    referenceSolution: `**Решение**

Найдём производную:

$$y' = 3x^2 - 12 = 3(x^2 - 4)$$

Критические точки: $y' = 0$ при $x = 2$ (точка $x = -2$ не входит в отрезок).

Сравним значения:

$$y(0) = 1$$

$$y(2) = 8 - 24 + 1 = -15$$

$$y(3) = 27 - 36 + 1 = -8$$

Наименьшее значение — $-15$.

**Ответ:** $-15$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'M2U6GO',
    topicSlug: 'ege-12-extrema-derivative',
    statement: `Найдите наименьшее значение функции $y = x^3 - 27x + 10$ на отрезке $[0; 4]$.

**Аналоги:** [M6Q9EM](/tasks/M6Q9EM) · [M9S3FN](/tasks/M9S3FN)`,
    correctAnswer: '-44',
    referenceSolution: `**Решение**

Найдём производную:

$$y' = 3x^2 - 27 = 3(x^2 - 9)$$

Критические точки: $y' = 0$ при $x = 3$ (точка $x = -3$ не входит в отрезок).

Сравним значения:

$$y(0) = 10$$

$$y(3) = 27 - 81 + 10 = -44$$

$$y(4) = 64 - 108 + 10 = -34$$

Наименьшее значение — $-44$.

**Ответ:** $-44$`,
    difficulty: 3,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА J: Задача 3 — площадь поверхности куба ==========
  {
    publicId: 'B7W1HP',
    topicSlug: 'ege-03-cube',
    statement: `Площадь поверхности куба равна $24$. Найдите его ребро.

**Аналоги:** [B1Y4JQ](/tasks/B1Y4JQ) · [B4A7KR](/tasks/B4A7KR)`,
    correctAnswer: '2',
    referenceSolution: `**Решение**

Площадь поверхности куба с ребром $a$:

$$S = 6a^2$$

Выразим ребро:

$$a = \\sqrt{\\dfrac{S}{6}} = \\sqrt{\\dfrac{24}{6}} = \\sqrt{4} = 2$$

**Ответ:** $2$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'B1Y4JQ',
    topicSlug: 'ege-03-cube',
    statement: `Площадь поверхности куба равна $54$. Найдите его ребро.

**Аналоги:** [B7W1HP](/tasks/B7W1HP) · [B4A7KR](/tasks/B4A7KR)`,
    correctAnswer: '3',
    referenceSolution: `**Решение**

Из формулы площади поверхности куба $S = 6a^2$:

$$a = \\sqrt{\\dfrac{54}{6}} = \\sqrt{9} = 3$$

**Ответ:** $3$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'B4A7KR',
    topicSlug: 'ege-03-cube',
    statement: `Площадь поверхности куба равна $96$. Найдите его ребро.

**Аналоги:** [B7W1HP](/tasks/B7W1HP) · [B1Y4JQ](/tasks/B1Y4JQ)`,
    correctAnswer: '4',
    referenceSolution: `**Решение**

Из формулы площади поверхности куба $S = 6a^2$:

$$a = \\sqrt{\\dfrac{96}{6}} = \\sqrt{16} = 4$$

**Ответ:** $4$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
];

async function main() {
  const profileMathSubject = await prisma.subject.findUnique({
    where: { code: 'profile-math-ege' },
  });

  if (!profileMathSubject) {
    throw new Error('Profile math subject not found. Run seed.ts first.');
  }

  const topics = await prisma.topic.findMany({
    where: { subjectId: profileMathSubject.id },
  });

  const topicMap = new Map(topics.map((t) => [t.slug, t.id]));

  let added = 0;

  for (const task of graphAndMoreTasks) {
    const topicId = topicMap.get(task.topicSlug);

    if (!topicId) {
      console.warn(`⚠ Тема ${task.topicSlug} не найдена, пропускаем ${task.publicId}`);
      continue;
    }

    await prisma.task.upsert({
      where: { publicId: task.publicId },
      update: {
        topicId,
        examPart: ExamPart.FIRST,
        statement: task.statement,
        correctAnswer: task.correctAnswer,
        referenceSolution: task.referenceSolution,
        difficulty: task.difficulty,
        status: TaskStatus.PUBLISHED,
        source: task.source,
      },
      create: {
        publicId: task.publicId,
        topicId,
        examPart: ExamPart.FIRST,
        statement: task.statement,
        correctAnswer: task.correctAnswer,
        referenceSolution: task.referenceSolution,
        difficulty: task.difficulty,
        status: TaskStatus.PUBLISHED,
        source: task.source,
      },
    });

    added++;
    console.log(`✓ ${task.publicId} — ${task.topicSlug}`);
  }

  console.log(`\n✓ Добавлено ${added} задач (10 групп × 3 аналога)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
