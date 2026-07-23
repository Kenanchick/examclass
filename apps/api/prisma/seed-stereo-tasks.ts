import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { ExamPart, PrismaClient, TaskStatus, TopicStatus } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const newSubtopics = [
  { parentSlug: 'ege-03-stereometry', slug: 'ege-03-prism', name: 'Призма', sortOrder: 8 },
  { parentSlug: 'ege-11-function-graphs', slug: 'ege-11-exponential', name: 'Показательная функция', sortOrder: 7 },
];

const stereoAndMoreTasks = [
  // ========== ГРУППА K: Задача 3 — отсечение призмы плоскостью (с рисунком в условии и решении) ==========
  {
    publicId: 'Z3P7KM',
    topicSlug: 'ege-03-prism',
    statement: `Площадь боковой поверхности треугольной призмы равна $60$. Через среднюю линию основания призмы проведена плоскость, параллельная боковому ребру. Найдите площадь боковой поверхности отсечённой треугольной призмы.

![Чертёж задачи](/tasks/prism-cut.svg)

**Аналоги:** [Z6R2LN](/tasks/Z6R2LN) · [Z9T5MQ](/tasks/Z9T5MQ)`,
    correctAnswer: '30',
    referenceSolution: `**Решение**

Площадь боковой поверхности треугольной призмы складывается из трёх площадей боковых граней.

![Призма с обозначениями](/tasks/prism-labeled.svg)

В данном случае $S = ah + bh + ch$.

После усечения по средней линии каждая сторона основания отсечённой призмы вдвое меньше: $\\dfrac{a}{2}$, $\\dfrac{b}{2}$, $\\dfrac{c}{2}$, а высота $h$ остаётся той же. Тогда:

$$S' = \\dfrac{a}{2}h + \\dfrac{b}{2}h + \\dfrac{c}{2}h = \\dfrac{1}{2}(ah + bh + ch) = \\dfrac{S}{2}$$

Мы доказали, что площадь боковой поверхности отсечённой призмы вдвое меньше исходной:

$$S' = \\dfrac{60}{2} = 30$$

**Ответ:** $30$`,
    difficulty: 2,
    source: 'NeoFamily',
  },
  {
    publicId: 'Z6R2LN',
    topicSlug: 'ege-03-prism',
    statement: `Площадь боковой поверхности треугольной призмы равна $100$. Через среднюю линию основания призмы проведена плоскость, параллельная боковому ребру. Найдите площадь боковой поверхности отсечённой треугольной призмы.

![Чертёж задачи](/tasks/prism-cut.svg)

**Аналоги:** [Z3P7KM](/tasks/Z3P7KM) · [Z9T5MQ](/tasks/Z9T5MQ)`,
    correctAnswer: '50',
    referenceSolution: `**Решение**

Площадь боковой поверхности призмы: $S = ah + bh + ch$.

![Призма с обозначениями](/tasks/prism-labeled.svg)

Отсечённая по средней линии призма имеет стороны основания $\\dfrac{a}{2}$, $\\dfrac{b}{2}$, $\\dfrac{c}{2}$ при той же высоте $h$, поэтому её площадь боковой поверхности вдвое меньше:

$$S' = \\dfrac{S}{2} = \\dfrac{100}{2} = 50$$

**Ответ:** $50$`,
    difficulty: 2,
    source: 'NeoFamily (аналог)',
  },
  {
    publicId: 'Z9T5MQ',
    topicSlug: 'ege-03-prism',
    statement: `Площадь боковой поверхности треугольной призмы равна $84$. Через среднюю линию основания призмы проведена плоскость, параллельная боковому ребру. Найдите площадь боковой поверхности отсечённой треугольной призмы.

![Чертёж задачи](/tasks/prism-cut.svg)

**Аналоги:** [Z3P7KM](/tasks/Z3P7KM) · [Z6R2LN](/tasks/Z6R2LN)`,
    correctAnswer: '42',
    referenceSolution: `**Решение**

Площадь боковой поверхности призмы: $S = ah + bh + ch$.

![Призма с обозначениями](/tasks/prism-labeled.svg)

Отсечённая по средней линии призма имеет стороны основания вдвое меньше при той же высоте, поэтому:

$$S' = \\dfrac{S}{2} = \\dfrac{84}{2} = 42$$

**Ответ:** $42$`,
    difficulty: 2,
    source: 'NeoFamily (аналог)',
  },

  // ========== ГРУППА L: Задача 3 — конус и цилиндр (с рисунками) ==========
  {
    publicId: 'C3V8NB',
    topicSlug: 'ege-03-cone',
    statement: `Во сколько раз уменьшится объём конуса, если его высоту уменьшить в $3$ раза?

![Чертёж задачи](/tasks/cone.svg)

**Аналоги:** [C6X1PD](/tasks/C6X1PD) · [C9Z4RE](/tasks/C9Z4RE)`,
    correctAnswer: '3',
    referenceSolution: `**Решение**

Объём конуса:

$$V = \\dfrac{1}{3}\\pi r^2 h$$

Объём прямо пропорционален высоте. Если высоту уменьшить в $3$ раза:

$$V' = \\dfrac{1}{3}\\pi r^2 \\cdot \\dfrac{h}{3} = \\dfrac{V}{3}$$

Объём уменьшится в $3$ раза.

**Ответ:** $3$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'C6X1PD',
    topicSlug: 'ege-03-cone',
    statement: `Во сколько раз уменьшится объём конуса, если радиус его основания уменьшить в $2$ раза?

![Чертёж задачи](/tasks/cone.svg)

**Аналоги:** [C3V8NB](/tasks/C3V8NB) · [C9Z4RE](/tasks/C9Z4RE)`,
    correctAnswer: '4',
    referenceSolution: `**Решение**

Объём конуса:

$$V = \\dfrac{1}{3}\\pi r^2 h$$

Радиус входит в формулу в квадрате. Если радиус уменьшить в $2$ раза:

$$V' = \\dfrac{1}{3}\\pi \\left(\\dfrac{r}{2}\\right)^2 h = \\dfrac{1}{3}\\pi \\cdot \\dfrac{r^2}{4} \\cdot h = \\dfrac{V}{4}$$

Объём уменьшится в $4$ раза.

**Ответ:** $4$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'C9Z4RE',
    topicSlug: 'ege-03-cylinder',
    statement: `Во сколько раз увеличится объём цилиндра, если его высоту увеличить в $5$ раз?

![Чертёж задачи](/tasks/cylinder.svg)

**Аналоги:** [C3V8NB](/tasks/C3V8NB) · [C6X1PD](/tasks/C6X1PD)`,
    correctAnswer: '5',
    referenceSolution: `**Решение**

Объём цилиндра:

$$V = \\pi r^2 h$$

Объём прямо пропорционален высоте. Если высоту увеличить в $5$ раз:

$$V' = \\pi r^2 \\cdot 5h = 5V$$

Объём увеличится в $5$ раз.

**Ответ:** $5$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА M: Задача 11 — показательная функция (с клетками) ==========
  {
    publicId: 'X4E7GS',
    topicSlug: 'ege-11-exponential',
    statement: `На рисунке изображён график функции $f(x) = a^x$. Найдите значение $f(3)$.

![График функции](/tasks/exp-1.svg)

**Аналоги:** [X7H2JU](/tasks/X7H2JU) · [X1K5LW](/tasks/X1K5LW)`,
    correctAnswer: '8',
    referenceSolution: `**Решение**

Точка $(2; 4)$ принадлежит графику. Составим уравнение:

$$4 = a^2 \\implies a = 2$$

Получили $f(x) = 2^x$. Тогда:

$$f(3) = 2^3 = 8$$

**Ответ:** $8$`,
    difficulty: 2,
    source: 'ФИПИ',
  },
  {
    publicId: 'X7H2JU',
    topicSlug: 'ege-11-exponential',
    statement: `На рисунке изображён график функции $f(x) = a^x$. Найдите значение $f(1)$.

![График функции](/tasks/exp-2.svg)

**Аналоги:** [X4E7GS](/tasks/X4E7GS) · [X1K5LW](/tasks/X1K5LW)`,
    correctAnswer: '0,5',
    referenceSolution: `**Решение**

Точка $(-2; 4)$ принадлежит графику. Составим уравнение:

$$4 = a^{-2} \\implies a^2 = \\dfrac{1}{4} \\implies a = \\dfrac{1}{2}$$

Получили $f(x) = \\left(\\dfrac{1}{2}\\right)^x$. Тогда:

$$f(1) = \\dfrac{1}{2} = 0{,}5$$

**Ответ:** $0{,}5$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'X1K5LW',
    topicSlug: 'ege-11-exponential',
    statement: `На рисунке изображён график функции $f(x) = a^x$. Найдите значение $f(1)$.

![График функции](/tasks/exp-3.svg)

**Аналоги:** [X4E7GS](/tasks/X4E7GS) · [X7H2JU](/tasks/X7H2JU)`,
    correctAnswer: '0,2',
    referenceSolution: `**Решение**

Точка $(-1; 5)$ принадлежит графику. Составим уравнение:

$$5 = a^{-1} \\implies a = \\dfrac{1}{5}$$

Получили $f(x) = \\left(\\dfrac{1}{5}\\right)^x$. Тогда:

$$f(1) = \\dfrac{1}{5} = 0{,}2$$

**Ответ:** $0{,}2$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА N: Задача 6 — иррациональные уравнения ==========
  {
    publicId: 'I5M3NX',
    topicSlug: 'ege-06-irrational',
    statement: `Решите уравнение: $\\sqrt{x + 3} = 4$.

**Аналоги:** [I8P6OY](/tasks/I8P6OY) · [I1R9PZ](/tasks/I1R9PZ)`,
    correctAnswer: '13',
    referenceSolution: `**Решение**

Возводим обе части уравнения в квадрат:

$$x + 3 = 16$$

$$x = 13$$

**Проверка:** $\\sqrt{13 + 3} = \\sqrt{16} = 4$ — верно.

**Ответ:** $13$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'I8P6OY',
    topicSlug: 'ege-06-irrational',
    statement: `Решите уравнение: $\\sqrt{2x - 1} = 3$.

**Аналоги:** [I5M3NX](/tasks/I5M3NX) · [I1R9PZ](/tasks/I1R9PZ)`,
    correctAnswer: '5',
    referenceSolution: `**Решение**

Возводим обе части в квадрат:

$$2x - 1 = 9$$

$$2x = 10$$

$$x = 5$$

**Проверка:** $\\sqrt{2 \\cdot 5 - 1} = \\sqrt{9} = 3$ — верно.

**Ответ:** $5$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'I1R9PZ',
    topicSlug: 'ege-06-irrational',
    statement: `Решите уравнение: $\\sqrt{x - 5} = 6$.

**Аналоги:** [I5M3NX](/tasks/I5M3NX) · [I8P6OY](/tasks/I8P6OY)`,
    correctAnswer: '41',
    referenceSolution: `**Решение**

Возводим обе части в квадрат:

$$x - 5 = 36$$

$$x = 41$$

**Проверка:** $\\sqrt{41 - 5} = \\sqrt{36} = 6$ — верно.

**Ответ:** $41$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА O: Задача 6 — тригонометрические уравнения ==========
  {
    publicId: 'T2U4QA',
    topicSlug: 'ege-06-trigonometric',
    statement: `Решите уравнение: $\\cos x = \\dfrac{\\sqrt{2}}{2}$. В ответе укажите наименьший положительный корень в градусах.

**Аналоги:** [T5W7QB](/tasks/T5W7QB) · [T8Y1QC](/tasks/T8Y1QC)`,
    correctAnswer: '45',
    referenceSolution: `**Решение**

По таблице значений тригонометрических функций:

$$\\cos x = \\dfrac{\\sqrt{2}}{2} \\implies x = \\pm 45° + 360°k, \\quad k \\in \\mathbb{Z}$$

Наименьший положительный корень: $x = 45°$.

**Ответ:** $45$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'T5W7QB',
    topicSlug: 'ege-06-trigonometric',
    statement: `Решите уравнение: $\\mathrm{tg}\\,x = \\sqrt{3}$. В ответе укажите наименьший положительный корень в градусах.

**Аналоги:** [T2U4QA](/tasks/T2U4QA) · [T8Y1QC](/tasks/T8Y1QC)`,
    correctAnswer: '60',
    referenceSolution: `**Решение**

По таблице значений тригонометрических функций:

$$\\mathrm{tg}\\,x = \\sqrt{3} \\implies x = 60° + 180°k, \\quad k \\in \\mathbb{Z}$$

Наименьший положительный корень: $x = 60°$.

**Ответ:** $60$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'T8Y1QC',
    topicSlug: 'ege-06-trigonometric',
    statement: `Решите уравнение: $\\sin x = \\dfrac{1}{2}$. В ответе укажите наименьший положительный корень в градусах.

**Аналоги:** [T2U4QA](/tasks/T2U4QA) · [T5W7QB](/tasks/T5W7QB)`,
    correctAnswer: '30',
    referenceSolution: `**Решение**

По таблице значений тригонометрических функций:

$$\\sin x = \\dfrac{1}{2} \\implies x = 30° + 360°k \\text{ или } x = 150° + 360°k, \\quad k \\in \\mathbb{Z}$$

Наименьший положительный корень: $x = 30°$.

**Ответ:** $30$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА P: Задача 7 — степени ==========
  {
    publicId: 'E6I3RD',
    topicSlug: 'ege-07-powers',
    statement: `Найдите значение выражения: $\\dfrac{2^3 \\cdot 2^5}{2^6}$.

**Аналоги:** [E9O6RE](/tasks/E9O6RE) · [E2A9RF](/tasks/E2A9RF)`,
    correctAnswer: '4',
    referenceSolution: `**Решение**

При умножении степени складываются, при делении — вычитаются:

$$\\dfrac{2^3 \\cdot 2^5}{2^6} = \\dfrac{2^{3+5}}{2^6} = \\dfrac{2^8}{2^6} = 2^{8-6} = 2^2 = 4$$

**Ответ:** $4$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'E9O6RE',
    topicSlug: 'ege-07-powers',
    statement: `Найдите значение выражения: $\\dfrac{3^7}{3^4 \\cdot 3^2}$.

**Аналоги:** [E6I3RD](/tasks/E6I3RD) · [E2A9RF](/tasks/E2A9RF)`,
    correctAnswer: '3',
    referenceSolution: `**Решение**

$$\\dfrac{3^7}{3^4 \\cdot 3^2} = \\dfrac{3^7}{3^{4+2}} = \\dfrac{3^7}{3^6} = 3^{7-6} = 3$$

**Ответ:** $3$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'E2A9RF',
    topicSlug: 'ege-07-powers',
    statement: `Найдите значение выражения: $\\dfrac{(5^2)^3}{5^4}$.

**Аналоги:** [E6I3RD](/tasks/E6I3RD) · [E9O6RE](/tasks/E9O6RE)`,
    correctAnswer: '25',
    referenceSolution: `**Решение**

При возведении степени в степень показатели перемножаются:

$$\\dfrac{(5^2)^3}{5^4} = \\dfrac{5^{2 \\cdot 3}}{5^4} = \\dfrac{5^6}{5^4} = 5^{6-4} = 5^2 = 25$$

**Ответ:** $25$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА Q: Задача 9 — экономические величины ==========
  {
    publicId: 'F4S7SG',
    topicSlug: 'ege-09-economic-quantities',
    statement: `Объём спроса $q$ (единиц в месяц) на товар задаётся формулой $q = 400 - 20p$, где $p$ — цена товара (в тыс. руб.). Найдите цену товара (в тыс. руб.), при которой объём спроса составит $100$ единиц.

**Аналоги:** [F7U1SH](/tasks/F7U1SH) · [F1W4SI](/tasks/F1W4SI)`,
    correctAnswer: '15',
    referenceSolution: `**Решение**

Подставляем $q = 100$ в формулу спроса:

$$100 = 400 - 20p$$

$$20p = 300$$

$$p = 15$$

**Ответ:** $15$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'F7U1SH',
    topicSlug: 'ege-09-economic-quantities',
    statement: `Объём спроса $q$ (единиц в месяц) на товар задаётся формулой $q = 300 - 15p$, где $p$ — цена товара (в тыс. руб.). Найдите цену товара (в тыс. руб.), при которой объём спроса составит $60$ единиц.

**Аналоги:** [F4S7SG](/tasks/F4S7SG) · [F1W4SI](/tasks/F1W4SI)`,
    correctAnswer: '16',
    referenceSolution: `**Решение**

Подставляем $q = 60$:

$$60 = 300 - 15p$$

$$15p = 240$$

$$p = 16$$

**Ответ:** $16$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'F1W4SI',
    topicSlug: 'ege-09-economic-quantities',
    statement: `Объём спроса $q$ (единиц в месяц) на товар задаётся формулой $q = 500 - 25p$, где $p$ — цена товара (в тыс. руб.). Найдите цену товара (в тыс. руб.), при которой объём спроса составит $150$ единиц.

**Аналоги:** [F4S7SG](/tasks/F4S7SG) · [F7U1SH](/tasks/F7U1SH)`,
    correctAnswer: '14',
    referenceSolution: `**Решение**

Подставляем $q = 150$:

$$150 = 500 - 25p$$

$$25p = 350$$

$$p = 14$$

**Ответ:** $14$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА R: Задача 10 — проценты ==========
  {
    publicId: 'G6Y3TJ',
    topicSlug: 'ege-10-percentages',
    statement: `Цена на товар составляла $8000$ рублей. После снижения цены на $15\\%$ сколько рублей стал стоить товар?

**Аналоги:** [G9A6TK](/tasks/G9A6TK) · [G2C9TL](/tasks/G2C9TL)`,
    correctAnswer: '6800',
    referenceSolution: `**Решение**

После снижения на $15\\%$ товар стоит $85\\%$ от исходной цены:

$$8000 \\cdot 0{,}85 = 6800$$

**Ответ:** $6800$ рублей`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'G9A6TK',
    topicSlug: 'ege-10-percentages',
    statement: `Цена на товар составляла $12000$ рублей. После повышения цены на $25\\%$ сколько рублей стал стоить товар?

**Аналоги:** [G6Y3TJ](/tasks/G6Y3TJ) · [G2C9TL](/tasks/G2C9TL)`,
    correctAnswer: '15000',
    referenceSolution: `**Решение**

После повышения на $25\\%$ товар стоит $125\\%$ от исходной цены:

$$12000 \\cdot 1{,}25 = 15000$$

**Ответ:** $15000$ рублей`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'G2C9TL',
    topicSlug: 'ege-10-percentages',
    statement: `Цена на товар составляла $5000$ рублей. После снижения цены на $30\\%$ сколько рублей стал стоить товар?

**Аналоги:** [G6Y3TJ](/tasks/G6Y3TJ) · [G9A6TK](/tasks/G9A6TK)`,
    correctAnswer: '3500',
    referenceSolution: `**Решение**

После снижения на $30\\%$ товар стоит $70\\%$ от исходной цены:

$$5000 \\cdot 0{,}7 = 3500$$

**Ответ:** $3500$ рублей`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА S: Задача 2 — длина вектора по точкам ==========
  {
    publicId: 'H8E5UM',
    topicSlug: 'ege-02-coordinates',
    statement: `Даны точки $A(1; 3)$ и $B(4; 7)$. Найдите длину вектора $\\vec{AB}$.

**Аналоги:** [H1G8UN](/tasks/H1G8UN) · [H4J1UO](/tasks/H4J1UO)`,
    correctAnswer: '5',
    referenceSolution: `**Решение**

Координаты вектора $\\vec{AB}$:

$$\\vec{AB} = (4 - 1; 7 - 3) = (3; 4)$$

Длина вектора:

$$|\\vec{AB}| = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$$

**Ответ:** $5$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'H1G8UN',
    topicSlug: 'ege-02-coordinates',
    statement: `Даны точки $A(2; 1)$ и $B(8; 9)$. Найдите длину вектора $\\vec{AB}$.

**Аналоги:** [H8E5UM](/tasks/H8E5UM) · [H4J1UO](/tasks/H4J1UO)`,
    correctAnswer: '10',
    referenceSolution: `**Решение**

Координаты вектора $\\vec{AB}$:

$$\\vec{AB} = (8 - 2; 9 - 1) = (6; 8)$$

Длина вектора:

$$|\\vec{AB}| = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$$

**Ответ:** $10$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'H4J1UO',
    topicSlug: 'ege-02-coordinates',
    statement: `Даны точки $A(0; 1)$ и $B(5; 13)$. Найдите длину вектора $\\vec{AB}$.

**Аналоги:** [H8E5UM](/tasks/H8E5UM) · [H1G8UN](/tasks/H1G8UN)`,
    correctAnswer: '13',
    referenceSolution: `**Решение**

Координаты вектора $\\vec{AB}$:

$$\\vec{AB} = (5 - 0; 13 - 1) = (5; 12)$$

Длина вектора:

$$|\\vec{AB}| = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13$$

**Ответ:** $13$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА T: Задача 4 — кубик и монета ==========
  {
    publicId: 'J6K3VP',
    topicSlug: 'ege-04-classical-definition',
    statement: `Бросают игральный кубик. Найдите вероятность того, что выпадет чётное число.

**Аналоги:** [J9M6VQ](/tasks/J9M6VQ) · [J2P9VR](/tasks/J2P9VR)`,
    correctAnswer: '0,5',
    referenceSolution: `**Решение**

Всего исходов — $6$ (грани кубика). Чётные числа: $2, 4, 6$ — всего $3$ благоприятных исхода.

$$P = \\dfrac{3}{6} = 0{,}5$$

**Ответ:** $0{,}5$`,
    difficulty: 1,
    source: 'ФИПИ',
  },
  {
    publicId: 'J9M6VQ',
    topicSlug: 'ege-04-classical-definition',
    statement: `Монету бросают два раза. Найдите вероятность того, что оба раза выпадет орёл.

**Аналоги:** [J6K3VP](/tasks/J6K3VP) · [J2P9VR](/tasks/J2P9VR)`,
    correctAnswer: '0,25',
    referenceSolution: `**Решение**

Всего исходов: $2 \\cdot 2 = 4$ (ОО, ОР, РО, РР). Благоприятный исход один — ОО.

$$P = \\dfrac{1}{4} = 0{,}25$$

**Ответ:** $0{,}25$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'J2P9VR',
    topicSlug: 'ege-04-classical-definition',
    statement: `Бросают игральный кубик. Найдите вероятность того, что выпадет число не больше $3$.

**Аналоги:** [J6K3VP](/tasks/J6K3VP) · [J9M6VQ](/tasks/J9M6VQ)`,
    correctAnswer: '0,5',
    referenceSolution: `**Решение**

Всего исходов — $6$. Числа не больше $3$: это $1, 2, 3$ — всего $3$ благоприятных исхода.

$$P = \\dfrac{3}{6} = 0{,}5$$

**Ответ:** $0{,}5$`,
    difficulty: 1,
    source: 'ФИПИ (аналог)',
  },

  // ========== ГРУППА U: Задача 12 — наибольшее значение квадратичной функции ==========
  {
    publicId: 'L4N7WS',
    topicSlug: 'ege-12-extrema-derivative',
    statement: `Найдите наибольшее значение функции $y = -x^2 + 4x + 1$ на отрезке $[0; 5]$.

**Аналоги:** [L7Q1WT](/tasks/L7Q1WT) · [L1S4WU](/tasks/L1S4WU)`,
    correctAnswer: '5',
    referenceSolution: `**Решение**

Найдём производную:

$$y' = -2x + 4$$

Критическая точка: $y' = 0$ при $x = 2$ — вершина параболы, ветви направлены вниз, значит это точка максимума.

$$y(2) = -4 + 8 + 1 = 5$$

На концах отрезка: $y(0) = 1$, $y(5) = -25 + 20 + 1 = -4$ — оба меньше.

**Ответ:** $5$`,
    difficulty: 2,
    source: 'ФИПИ',
  },
  {
    publicId: 'L7Q1WT',
    topicSlug: 'ege-12-extrema-derivative',
    statement: `Найдите наибольшее значение функции $y = -x^2 + 6x - 2$ на отрезке $[0; 4]$.

**Аналоги:** [L4N7WS](/tasks/L4N7WS) · [L1S4WU](/tasks/L1S4WU)`,
    correctAnswer: '7',
    referenceSolution: `**Решение**

Найдём производную:

$$y' = -2x + 6$$

Критическая точка: $x = 3$ — точка максимума (ветви параболы вниз).

$$y(3) = -9 + 18 - 2 = 7$$

На концах отрезка: $y(0) = -2$, $y(4) = -16 + 24 - 2 = 6$ — оба меньше.

**Ответ:** $7$`,
    difficulty: 2,
    source: 'ФИПИ (аналог)',
  },
  {
    publicId: 'L1S4WU',
    topicSlug: 'ege-12-extrema-derivative',
    statement: `Найдите наибольшее значение функции $y = -x^2 + 8x + 3$ на отрезке $[1; 6]$.

**Аналоги:** [L4N7WS](/tasks/L4N7WS) · [L7Q1WT](/tasks/L7Q1WT)`,
    correctAnswer: '19',
    referenceSolution: `**Решение**

Найдём производную:

$$y' = -2x + 8$$

Критическая точка: $x = 4$ — точка максимума (ветви параболы вниз).

$$y(4) = -16 + 32 + 3 = 19$$

На концах отрезка: $y(1) = -1 + 8 + 3 = 10$, $y(6) = -36 + 48 + 3 = 15$ — оба меньше.

**Ответ:** $19$`,
    difficulty: 2,
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

  for (const subtopic of newSubtopics) {
    const parentId = topicMap.get(subtopic.parentSlug);

    if (!parentId) {
      throw new Error(`Parent topic ${subtopic.parentSlug} not found`);
    }

    const saved = await prisma.topic.upsert({
      where: {
        subjectId_slug: {
          subjectId: profileMathSubject.id,
          slug: subtopic.slug,
        },
      },
      update: {
        name: subtopic.name,
        parentId,
        sortOrder: subtopic.sortOrder,
        status: TopicStatus.PUBLISHED,
      },
      create: {
        subjectId: profileMathSubject.id,
        parentId,
        slug: subtopic.slug,
        name: subtopic.name,
        sortOrder: subtopic.sortOrder,
        status: TopicStatus.PUBLISHED,
      },
    });

    topicMap.set(saved.slug, saved.id);
    console.log(`✓ Подтема "${subtopic.name}" создана`);
  }

  let added = 0;

  for (const task of stereoAndMoreTasks) {
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

  console.log(`\n✓ Добавлено ${added} задач (11 групп × 3 аналога)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
