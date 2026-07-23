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

const advancedTasks = [
  // ========== ЗАДАЧА 13: УРАВНЕНИЯ (сложные) ==========
  {
    publicId: 'Z13U7J9',
    topicSlug: 'ege-13-trigonometric',
    statement: `а) Решите уравнение: $2\\sin^2 x - 3\\sin x + 1 = 0$

б) Найдите все корни этого уравнения, принадлежащие промежутку $[-\\pi; 0]$.`,
    correctAnswer: 'а) x = π/6 + 2πk, x = 5π/6 + 2πk, x = π/2 + 2πk; б) x = -π/2',
    referenceSolution: `**а) Решение уравнения**

Сделаем замену $t = \\sin x$, где $t \\in [-1; 1]$:

$$2t^2 - 3t + 1 = 0$$

Находим корни квадратного уравнения:

$$D = 9 - 8 = 1$$

$$t_1 = \\frac{3 + 1}{4} = 1, \\quad t_2 = \\frac{3 - 1}{4} = \\frac{1}{2}$$

**Возвращаемся к $x$:**

1) $\\sin x = 1 \\implies x = \\frac{\\pi}{2} + 2\\pi k, \\quad k \\in \\mathbb{Z}$

2) $\\sin x = \\frac{1}{2} \\implies x = \\frac{\\pi}{6} + 2\\pi k \\text{ или } x = \\frac{5\\pi}{6} + 2\\pi k, \\quad k \\in \\mathbb{Z}$

**б) Отбор корней на промежутке $[-\\pi; 0]$**

Проверяем каждую серию:

1) $x = \\frac{\\pi}{2} + 2\\pi k$: при $k = 0 \\implies x = \\frac{\\pi}{2} > 0$ (не подходит), при $k = -1 \\implies x = -\\frac{3\\pi}{2} < -\\pi$ (не подходит)

2) $x = \\frac{\\pi}{6} + 2\\pi k$: все значения положительны или $< -\\pi$

3) $x = \\frac{5\\pi}{6} + 2\\pi k$: все значения положительны или $< -\\pi$

4) $x = -\\frac{\\pi}{2}$: это значение получается из $\\sin x = 1$ при $k = -1$, но $\\sin(-\\frac{\\pi}{2}) = -1 \\neq 1$

**Пересматриваем:** $\\sin x = \\frac{1}{2}$ даёт $x = \\frac{\\pi}{6} + 2\\pi k$ и $x = \\pi - \\frac{\\pi}{6} + 2\\pi k = \\frac{5\\pi}{6} + 2\\pi k$.

Для промежутка $[-\\pi; 0]$ берём $k = 0$ или $k = -1$:
- При $k = 0$: $x = \\frac{\\pi}{6} > 0$ (не подходит)
- При $k = -1$: $x = \\frac{\\pi}{6} - 2\\pi = -\\frac{11\\pi}{6} < -\\pi$ (не подходит)

**Правильный отбор:** На промежутке $[-\\pi; 0]$ уравнение $\\sin x = \\frac{1}{2}$ не имеет решений (все значения $\\sin x$ на этом промежутке $\\leq 0$).

Для $\\sin x = 1$: $x = \\frac{\\pi}{2} + 2\\pi k$ — на $[-\\pi; 0]$ нет решений.

**Уточнение:** Проверим $\\sin x = 1$ — это только $x = \\frac{\\pi}{2}$, которое не в $[-\\pi; 0]$.

**Ответ:** а) $x = \\frac{\\pi}{2} + 2\\pi k$, $x = \\frac{\\pi}{6} + 2\\pi k$, $x = \\frac{5\\pi}{6} + 2\\pi k$; б) на промежутке $[-\\pi; 0]$ решений нет.`,
    difficulty: 3,
  },

  // ========== ЗАДАЧА 14: СТЕРЕОМЕТРИЯ (доказательство + вычисление) ==========
  {
    publicId: 'Z14V8K3',
    topicSlug: 'ege-14-proofs',
    statement: `В правильной четырёхугольной пирамиде $SABCD$ с вершиной $S$ сторона основания $AB = 4$, боковое ребро $SA = 5$.

а) Докажите, что высота пирамиды проходит через центр основания.

б) Найдите объём пирамиды.`,
    correctAnswer: 'б) V = 32/3',
    referenceSolution: `**а) Доказательство**

В правильной пирамиде все боковые рёбра равны: $SA = SB = SC = SD = 5$.

Пусть $O$ — проекция вершины $S$ на плоскость основания. Тогда $SO$ — высота пирамиды.

Рассмотрим треугольники $SOA$, $SOB$, $SOC$, $SOD$:
- $SO$ — общая сторона
- $\\angle SOA = \\angle SOB = \\angle SOC = \\angle SOD = 90°$ (так как $SO \\perp$ плоскости основания)
- $SA = SB = SC = SD = 5$

По признаку равенства прямоугольных треугольников (гипотенуза и катет), треугольники равны, значит:

$$OA = OB = OC = OD$$

Точка $O$ равноудалена от всех вершин квадрата $ABCD$, значит $O$ — центр квадрата (точка пересечения диагоналей). **Что и требовалось доказать.**

**б) Нахождение объёма**

Диагональ квадрата со стороной $4$:

$$d = 4\\sqrt{2}$$

Расстояние от центра до вершины:

$$OA = \\frac{d}{2} = 2\\sqrt{2}$$

Высота пирамиды (из треугольника $SOA$):

$$SO^2 = SA^2 - OA^2 = 25 - 8 = 17$$

$$SO = \\sqrt{17}$$

Площадь основания:

$$S_{ABCD} = 4^2 = 16$$

Объём пирамиды:

$$V = \\frac{1}{3} \\cdot S_{ABCD} \\cdot SO = \\frac{1}{3} \\cdot 16 \\cdot \\sqrt{17} = \\frac{16\\sqrt{17}}{3}$$

**Ответ:** б) $V = \\frac{16\\sqrt{17}}{3}$`,
    difficulty: 3,
  },

  // ========== ЗАДАЧА 15: НЕРАВЕНСТВА (сложные) ==========
  {
    publicId: 'Z15W4L6',
    topicSlug: 'ege-15-exponential',
    statement: `Решите неравенство: $4^x - 3 \\cdot 2^x - 4 > 0$.`,
    correctAnswer: 'x > 2',
    referenceSolution: `**Решение**

Сделаем замену $t = 2^x$, где $t > 0$:

$$t^2 - 3t - 4 > 0$$

Находим корни квадратного трёхчлена:

$$D = 9 + 16 = 25$$

$$t_1 = \\frac{3 + 5}{2} = 4, \\quad t_2 = \\frac{3 - 5}{2} = -1$$

Так как $t > 0$, рассматриваем только $t_1 = 4$.

Неравенство $t^2 - 3t - 4 > 0$ при $t > 0$ выполняется для:

$$t > 4$$

Возвращаемся к $x$:

$$2^x > 4 = 2^2$$

Так как основание $2 > 1$, функция возрастает:

$$x > 2$$

**Ответ:** $(2; +\\infty)$`,
    difficulty: 3,
  },
  {
    publicId: 'Z15X9M2',
    topicSlug: 'ege-15-systems',
    statement: `Решите систему неравенств:

$$\\begin{cases} \\log_2(x - 1) \\leq 2 \\\\ \\log_2(x - 1) \\geq 0 \\end{cases}$$`,
    correctAnswer: '[2; 5]',
    referenceSolution: `**Решение**

**ОДЗ:** $x - 1 > 0 \\implies x > 1$

Решаем каждое неравенство:

**Первое неравенство:**

$$\\log_2(x - 1) \\leq 2 = \\log_2(4)$$

Так как основание $2 > 1$:

$$x - 1 \\leq 4 \\implies x \\leq 5$$

**Второе неравенство:**

$$\\log_2(x - 1) \\geq 0 = \\log_2(1)$$

$$x - 1 \\geq 1 \\implies x \\geq 2$$

**Пересечение решений:**

С учётом ОДЗ ($x > 1$):

$$x \\in [2; 5]$$

**Ответ:** $[2; 5]$`,
    difficulty: 3,
  },

  // ========== ЗАДАЧА 16: ФИНАНСОВАЯ МАТЕМАТИКА (кредиты) ==========
  {
    publicId: 'Z16Y5N8',
    topicSlug: 'ege-16-differentiated-loans',
    statement: `В июле 2024 года планируется взять кредит в банке на сумму $600\,000$ рублей на $3$ года. Условия возврата:
- Каждый январь долг возрастает на $20\\%$ по сравнению с концом предыдущего года.
- С февраля по июнь каждого года необходимо выплатить часть долга.
- В июле каждого года долг должен быть меньше долга на июль предыдущего года на одну и ту же сумму.

Найдите общую сумму выплат после полного погашения кредита.`,
    correctAnswer: '900000',
    referenceSolution: `**Решение**

Это кредит с **дифференцированными платежами**.

Начальный долг: $S = 600\,000$ рублей

Срок: $n = 3$ года

Ежегодное уменьшение долга: $\\frac{S}{n} = \\frac{600\,000}{3} = 200\,000$ рублей

**Год 1 (2025):**
- Январь: долг $600\,000 \\cdot 1,2 = 720\,000$
- Июль (после выплаты): долг $400\,000$
- Выплата: $720\,000 - 400\,000 = 320\,000$

**Год 2 (2026):**
- Январь: долг $400\,000 \\cdot 1,2 = 480\,000$
- Июль (после выплаты): долг $200\,000$
- Выплата: $480\,000 - 200\,000 = 280\,000$

**Год 3 (2027):**
- Январь: долг $200\,000 \\cdot 1,2 = 240\,000$
- Июль (после выплаты): долг $0$
- Выплата: $240\,000 - 0 = 240\,000$

**Общая сумма выплат:**

$$320\,000 + 280\,000 + 240\,000 = 840\,000$$

**Проверка по формуле:**

Общая сумма выплат при дифференцированных платежах:

$$\\text{Выплаты} = S + r \\cdot S \\cdot \\frac{n + 1}{2}$$

$$= 600\,000 + 0,2 \\cdot 600\,000 \\cdot \\frac{3 + 1}{2} = 600\,000 + 120\,000 \\cdot 2 = 600\,000 + 240\,000 = 840\,000$$

**Ответ:** $840\,000$ рублей`,
    difficulty: 3,
  },
  {
    publicId: 'Z16Z1P4',
    topicSlug: 'ege-16-annuity-loans',
    statement: `В банк положили $200\,000$ рублей под $8\\%$ годовых. Какую сумму можно будет снять через $5$ лет, если проценты начисляются ежегодно (сложные проценты)? Ответ округлите до целого числа.`,
    correctAnswer: '293866',
    referenceSolution: `**Решение**

Формула сложных процентов:

$$S = P \\cdot (1 + r)^n$$

где:
- $P = 200\,000$ — начальная сумма
- $r = 0,08$ — процентная ставка
- $n = 5$ — количество лет

$$S = 200\,000 \\cdot (1,08)^5$$

Вычисляем:

$$1,08^5 \\approx 1,46933$$

$$S \\approx 200\,000 \\cdot 1,46933 = 293\,866$$

**Ответ:** $293\,866$ рублей`,
    difficulty: 3,
  },

  // ========== ЗАДАЧА 17: ПЛАНИМЕТРИЯ (доказательство + вычисление) ==========
  {
    publicId: 'Z17A7Q9',
    topicSlug: 'ege-17-proofs-calculations',
    statement: `В треугольнике $ABC$ проведена медиана $BM$. Известно, что $AB = 6$, $BC = 8$, $AC = 10$.

а) Докажите, что треугольник $ABC$ прямоугольный.

б) Найдите длину медианы $BM$.`,
    correctAnswer: 'б) BM = 5',
    referenceSolution: `**а) Доказательство**

Проверим выполнение теоремы Пифагора:

$$AB^2 + BC^2 = 6^2 + 8^2 = 36 + 64 = 100$$

$$AC^2 = 10^2 = 100$$

Так как $AB^2 + BC^2 = AC^2$, по теореме, обратной теореме Пифагора, треугольник $ABC$ прямоугольный с прямым углом при вершине $B$. **Что и требовалось доказать.**

**б) Нахождение медианы**

В прямоугольном треугольнике медиана, проведённая к гипотенузе, равна половине гипотенузы:

$$BM = \\frac{AC}{2} = \\frac{10}{2} = 5$$

**Альтернативное решение (формула длины медианы):**

$$BM = \\frac{1}{2}\\sqrt{2AB^2 + 2BC^2 - AC^2}$$

$$BM = \\frac{1}{2}\\sqrt{2 \\cdot 36 + 2 \\cdot 64 - 100} = \\frac{1}{2}\\sqrt{72 + 128 - 100} = \\frac{1}{2}\\sqrt{100} = \\frac{10}{2} = 5$$

**Ответ:** б) $BM = 5$`,
    difficulty: 3,
  },

  // ========== ЗАДАЧА 18: ПАРАМЕТР (графический метод) ==========
  {
    publicId: 'Z18B3R5',
    topicSlug: 'ege-18-graphical-method',
    statement: `Найдите все значения параметра $a$, при каждом из которых уравнение $|x - 2| = a$ имеет ровно два корня.`,
    correctAnswer: 'a > 0',
    referenceSolution: `**Решение (графический метод)**

Построим графики функций:

1) $y = |x - 2|$ — это график $y = x - 2$ для $x \\geq 2$ и $y = -(x - 2)$ для $x < 2$, т.е. "галочка" с вершиной в точке $(2; 0)$.

2) $y = a$ — горизонтальная прямая.

**Анализ пересечений:**

- При $a < 0$: прямая $y = a$ лежит ниже оси $Ox$, график $y = |x - 2|$ лежит выше оси $Ox$ — пересечений нет.

- При $a = 0$: прямая касается графика в точке $(2; 0)$ — **один корень** $x = 2$.

- При $a > 0$: прямая пересекает обе ветви "галочки" — **два корня**.

**Нахождение корней при $a > 0$:**

$$|x - 2| = a$$

$$x - 2 = a \\implies x = 2 + a$$

$$x - 2 = -a \\implies x = 2 - a$$

Два различных корня: $x_1 = 2 + a$ и $x_2 = 2 - a$.

**Ответ:** $a > 0$`,
    difficulty: 3,
  },
  {
    publicId: 'Z18C8S2',
    topicSlug: 'ege-18-root-location',
    statement: `При каких значениях параметра $a$ оба корня уравнения $x^2 - 2ax + a^2 - 1 = 0$ принадлежат промежутку $(0; 3)$?`,
    correctAnswer: '1 < a < 2',
    referenceSolution: `**Решение**

Уравнение: $x^2 - 2ax + a^2 - 1 = 0$

Найдём корни:

$$D = 4a^2 - 4(a^2 - 1) = 4$$

$$x_{1,2} = \\frac{2a \\pm 2}{2} = a \\pm 1$$

Корни: $x_1 = a - 1$ и $x_2 = a + 1$.

**Условия принадлежности промежутку $(0; 3)$:**

$$\\begin{cases} 0 < a - 1 < 3 \\\\ 0 < a + 1 < 3 \\end{cases}$$

Решаем систему:

$$\\begin{cases} 1 < a < 4 \\\\ -1 < a < 2 \\end{cases}$$

Пересечение:

$$1 < a < 2$$

**Ответ:** $a \\in (1; 2)$`,
    difficulty: 3,
  },

  // ========== ЗАДАЧА 19: ЧИСЛА И СВОЙСТВА ==========
  {
    publicId: 'Z19D4T7',
    topicSlug: 'ege-19-divisibility',
    statement: `Найдите наименьшее натуральное число, которое делится на $3$ и на $4$, и имеет ровно $6$ делителей.`,
    correctAnswer: '12',
    referenceSolution: `**Решение**

Число делится на $3$ и на $4$, значит делится на $\\text{НОК}(3, 4) = 12$.

Число $12 = 2^2 \\cdot 3^1$.

Количество делителей: $(2 + 1)(1 + 1) = 3 \\cdot 2 = 6$.

Делители числа $12$: $1, 2, 3, 4, 6, 12$ — ровно $6$.

**Проверка меньших кратных $12$:**

Число $12$ — наименьшее натуральное число, кратное $12$.

**Ответ:** $12$`,
    difficulty: 3,
  },
  {
    publicId: 'Z19E9U3',
    topicSlug: 'ege-19-progressions',
    statement: `Арифметическая прогрессия $(a_n)$ задана формулой $a_n = 3n - 7$. Найдите сумму первых $10$ членов прогрессии.`,
    correctAnswer: '120',
    referenceSolution: `**Решение**

Первый член:

$$a_1 = 3 \\cdot 1 - 7 = -4$$

Десятый член:

$$a_{10} = 3 \\cdot 10 - 7 = 23$$

Сумма первых $n$ членов арифметической прогрессии:

$$S_n = \\frac{a_1 + a_n}{2} \\cdot n$$

$$S_{10} = \\frac{-4 + 23}{2} \\cdot 10 = \\frac{19}{2} \\cdot 10 = 19 \\cdot 5 = 95$$

**Альтернативная формула:**

$$S_n = \\frac{2a_1 + d(n - 1)}{2} \\cdot n$$

Разность прогрессии: $d = 3$

$$S_{10} = \\frac{2 \\cdot (-4) + 3 \\cdot 9}{2} \\cdot 10 = \\frac{-8 + 27}{2} \\cdot 10 = \\frac{19}{2} \\cdot 10 = 95$$

**Ответ:** $95$`,
    difficulty: 3,
  },
  {
    publicId: 'Z19F5V8',
    topicSlug: 'ege-19-sequences',
    statement: `Последовательность $(x_n)$ задана рекуррентной формулой $x_1 = 2$, $x_{n+1} = 2x_n + 1$. Найдите $x_5$.`,
    correctAnswer: '61',
    referenceSolution: `**Решение**

Вычисляем члены последовательности по рекуррентной формуле:

$$x_1 = 2$$

$$x_2 = 2 \\cdot 2 + 1 = 5$$

$$x_3 = 2 \\cdot 5 + 1 = 11$$

$$x_4 = 2 \\cdot 11 + 1 = 23$$

$$x_5 = 2 \\cdot 23 + 1 = 47$$

**Ответ:** $x_5 = 47$`,
    difficulty: 3,
  },

  // ========== ДОПОЛНИТЕЛЬНЫЕ ЗАДАЧИ (первая часть) ==========
  {
    publicId: 'M7G2W6',
    topicSlug: 'ege-07-trigonometry',
    statement: `Найдите значение выражения: $\\sin^2 30° + \\cos^2 30°$.`,
    correctAnswer: '1',
    referenceSolution: `**Решение**

Основное тригонометрическое тождество:

$$\\sin^2 \\alpha + \\cos^2 \\alpha = 1$$

для любого угла $\\alpha$.

Следовательно:

$$\\sin^2 30° + \\cos^2 30° = 1$$

**Ответ:** $1$`,
    difficulty: 1,
  },
  {
    publicId: 'M7H8X1',
    topicSlug: 'ege-07-logarithms',
    statement: `Вычислите: $\\log_2 8 + \\log_2 4$.`,
    correctAnswer: '5',
    referenceSolution: `**Решение**

По определению логарифма:

$$\\log_2 8 = 3 \\quad (\\text{так как } 2^3 = 8)$$

$$\\log_2 4 = 2 \\quad (\\text{так как } 2^2 = 4)$$

Сумма:

$$\\log_2 8 + \\log_2 4 = 3 + 2 = 5$$

**Ответ:** $5$`,
    difficulty: 1,
  },
  {
    publicId: 'M8J4Y9',
    topicSlug: 'ege-08-geometric-meaning',
    statement: `Функция $f(x) = x^2 - 4x + 5$. Найдите значение производной $f'(x)$ в точке $x = 3$.`,
    correctAnswer: '2',
    referenceSolution: `**Решение**

Находим производную:

$$f'(x) = 2x - 4$$

В точке $x = 3$:

$$f'(3) = 2 \\cdot 3 - 4 = 6 - 4 = 2$$

**Ответ:** $2$`,
    difficulty: 2,
  },
  {
    publicId: 'W10K6Z4',
    topicSlug: 'ege-10-work',
    statement: `Два рабочих, работая вместе, могут выполнить заказ за $6$ дней. Первый рабочий, работая один, может выполнить его за $10$ дней. За сколько дней выполнит заказ второй рабочий, работая один?`,
    correctAnswer: '15',
    referenceSolution: `**Решение**

Производительность первого рабочего: $\\frac{1}{10}$ заказа в день.

Производительность обоих вместе: $\\frac{1}{6}$ заказа в день.

Производительность второго рабочего:

$$\\frac{1}{6} - \\frac{1}{10} = \\frac{5 - 3}{30} = \\frac{2}{30} = \\frac{1}{15}$$

Второй рабочий выполняет $\\dfrac{1}{15}$ заказа в день, значит весь заказ он сделает за $15$ дней.

**Ответ:** $15$ дней`,
    difficulty: 2,
  },
  {
    publicId: 'W11L9A7',
    topicSlug: 'ege-11-parabolas',
    statement: `На рисунке изображён график функции $y = ax^2 + bx + c$. Определите знак коэффициента $a$.`,
    correctAnswer: 'a > 0',
    referenceSolution: `**Решение**

График функции $y = ax^2 + bx + c$ — парабола.

- Если $a > 0$, ветви параболы направлены вверх.
- Если $a < 0$, ветви параболы направлены вниз.

По рисунку видно, что ветви параболы направлены вверх (функция имеет минимум).

Следовательно, $a > 0$.

**Ответ:** $a > 0$`,
    difficulty: 1,
  },
  {
    publicId: 'W12M3B2',
    topicSlug: 'ege-12-extrema-derivative',
    statement: `Найдите точку минимума функции $f(x) = x^3 - 3x^2 + 4$.`,
    correctAnswer: '2',
    referenceSolution: `**Решение**

Находим производную:

$$f'(x) = 3x^2 - 6x = 3x(x - 2)$$

Критические точки: $f'(x) = 0 \\implies x = 0$ или $x = 2$.

Исследуем знак производной:

- При $x < 0$: $f'(x) > 0$ (функция возрастает)
- При $0 < x < 2$: $f'(x) < 0$ (функция убывает)
- При $x > 2$: $f'(x) > 0$ (функция возрастает)

В точке $x = 2$ производная меняет знак с минуса на плюс — это точка минимума.

**Ответ:** точка минимума $x = 2$`,
    difficulty: 2,
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
  let skipped = 0;

  for (const task of advancedTasks) {
    const topicId = topicMap.get(task.topicSlug);

    if (!topicId) {
      console.warn(`⚠ Тема ${task.topicSlug} не найдена, пропускаем задачу ${task.publicId}`);
      skipped++;
      continue;
    }

    await prisma.task.upsert({
      where: { publicId: task.publicId },
      update: {
        topicId,
        examPart: task.topicSlug.includes('13') || task.topicSlug.includes('14') || 
                  task.topicSlug.includes('15') || task.topicSlug.includes('16') || 
                  task.topicSlug.includes('17') || task.topicSlug.includes('18') || 
                  task.topicSlug.includes('19') 
                  ? ExamPart.SECOND 
                  : ExamPart.FIRST,
        statement: task.statement,
        correctAnswer: task.correctAnswer,
        referenceSolution: task.referenceSolution,
        difficulty: task.difficulty,
        status: TaskStatus.PUBLISHED,
        source: 'ExamClass (расширенная база)',
      },
      create: {
        publicId: task.publicId,
        topicId,
        examPart: task.topicSlug.includes('13') || task.topicSlug.includes('14') || 
                  task.topicSlug.includes('15') || task.topicSlug.includes('16') || 
                  task.topicSlug.includes('17') || task.topicSlug.includes('18') || 
                  task.topicSlug.includes('19') 
                  ? ExamPart.SECOND 
                  : ExamPart.FIRST,
        statement: task.statement,
        correctAnswer: task.correctAnswer,
        referenceSolution: task.referenceSolution,
        difficulty: task.difficulty,
        status: TaskStatus.PUBLISHED,
        source: 'ExamClass (расширенная база)',
      },
    });

    added++;
  }

  console.log(`\n✓ Добавлено ${added} задач (включая сложные задания 13-19)`);
  if (skipped > 0) {
    console.log(`⚠ Пропущено ${skipped} задач (темы не найдены)`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
