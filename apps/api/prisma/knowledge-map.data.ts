import type {
  KnowledgeMapSeed,
  SkillDefaults,
  SkillSeed,
} from './knowledge-map.catalog';
import { ege01PlanimetryTopic } from './knowledge-map.planimetry';

const defaults = (
  value: Partial<SkillDefaults> &
    Pick<
      SkillDefaults,
      | 'difficulty'
      | 'importance'
      | 'estimatedMinutes'
      | 'examNumbers'
      | 'taskTypes'
      | 'verificationMethods'
    >,
): SkillDefaults => ({
  isFoundational: false,
  sourceCoverage: 'PARTIAL',
  ...value,
});

const skill = (
  code: string,
  name: string,
  description: string,
  value: Omit<SkillSeed, 'code' | 'name' | 'description'> = {},
): SkillSeed => ({
  code,
  name,
  description,
  ...value,
});

const sections: KnowledgeMapSeed['sections'] = [
  {
    code: 'section.foundations',
    name: 'Числа и вычислительный фундамент',
    description:
      'Базовые числовые навыки, без которых ненадёжны алгебра, геометрия и прикладные задачи.',
    topics: [
      {
        code: 'topic.numbers',
        name: 'Числа и вычисления',
        description:
          'Числовые множества, вычисления, пропорции, проценты и оценка результата.',
        subtopics: [
          {
            code: 'subtopic.number-basics',
            name: 'Числовые множества и арифметика',
            description:
              'Осознанные действия с числами и контроль допустимости результата.',
            defaults: defaults({
              difficulty: 1,
              importance: 5,
              estimatedMinutes: 45,
              examNumbers: [2, 3, 4, 5, 6, 7, 9, 10, 16, 19],
              taskTypes: ['COMPUTATION'],
              verificationMethods: [
                'SHORT_ANSWER',
                'ORAL_EXPLANATION',
                'ERROR_ANALYSIS',
              ],
              isFoundational: true,
              sourceCoverage: 'MISSING',
            }),
            skills: [
              skill(
                'number.types-order',
                'Различать числовые множества и сравнивать числа',
                'Определять принадлежность натуральным, целым, рациональным и действительным числам, сравнивать их на числовой прямой.',
              ),
              skill(
                'number.signed-operations',
                'Выполнять действия с числами разных знаков',
                'Безошибочно складывать, вычитать, умножать и делить положительные и отрицательные числа.',
                {
                  required: ['number.types-order'],
                },
              ),
              skill(
                'number.operation-order',
                'Соблюдать порядок арифметических действий',
                'Вычислять выражения со скобками и несколькими операциями в правильной последовательности.',
                {
                  required: ['number.signed-operations'],
                },
              ),
              skill(
                'number.fractions',
                'Выполнять действия с обыкновенными дробями',
                'Приводить дроби к общему знаменателю, сокращать и выполнять четыре арифметических действия.',
                {
                  estimatedMinutes: 90,
                  required: ['number.signed-operations'],
                },
              ),
              skill(
                'number.decimals-rounding',
                'Работать с десятичными дробями и округлением',
                'Преобразовывать обычные дроби в десятичные, выполнять действия и округлять с заданной точностью.',
                {
                  required: ['number.fractions'],
                },
              ),
            ],
          },
          {
            code: 'subtopic.ratios-percentages',
            name: 'Отношения, пропорции и проценты',
            description:
              'База для прикладных, финансовых и геометрических моделей.',
            defaults: defaults({
              difficulty: 1,
              importance: 5,
              estimatedMinutes: 60,
              examNumbers: [3, 9, 10, 16],
              taskTypes: ['COMPUTATION', 'APPLIED_MODEL'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MODELING',
                'ERROR_ANALYSIS',
              ],
              isFoundational: true,
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'number.ratio-proportion',
                'Составлять и решать пропорции',
                'Переводить отношения величин в пропорцию и находить неизвестный член.',
                {
                  required: ['number.fractions'],
                },
              ),
              skill(
                'number.percent-of-value',
                'Находить процент от числа и число по проценту',
                'Различать прямую и обратную процентную задачу.',
                {
                  required: ['number.ratio-proportion'],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'number.percent-change',
                'Вычислять последовательные процентные изменения',
                'Применять коэффициенты увеличения и уменьшения и не складывать последовательные проценты.',
                {
                  difficulty: 2,
                  estimatedMinutes: 75,
                  required: ['number.percent-of-value'],
                  sourceCoverage: 'PARTIAL',
                },
              ),
              skill(
                'number.units-conversion',
                'Переводить единицы измерения',
                'Согласовывать единицы длины, площади, объёма, времени, скорости и массы.',
                {
                  required: ['number.fractions'],
                },
              ),
              skill(
                'number.estimate-check',
                'Оценивать порядок величины и проверять правдоподобие ответа',
                'Использовать округление, границы и здравый смысл для обнаружения вычислительной ошибки.',
                {
                  required: [
                    'number.decimals-rounding',
                    'number.units-conversion',
                  ],
                },
              ),
            ],
          },
          {
            code: 'subtopic.number-theory',
            name: 'Делимость и целые числа',
            description: 'Структура целых чисел и инструменты задач №19.',
            defaults: defaults({
              difficulty: 3,
              importance: 3,
              estimatedMinutes: 75,
              examNumbers: [19],
              taskTypes: ['NUMBER_THEORY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'PROOF',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'number.prime-factorization',
                'Раскладывать число на простые множители',
                'Находить простые делители и записывать каноническое разложение натурального числа.',
                {
                  difficulty: 2,
                  isFoundational: true,
                  required: ['number.operation-order'],
                },
              ),
              skill(
                'number.divisibility-tests',
                'Применять признаки делимости',
                'Использовать признаки делимости и свойства делителей без полного перебора.',
                {
                  difficulty: 2,
                  isFoundational: true,
                  required: ['number.types-order'],
                },
              ),
              skill(
                'number.gcd-lcm',
                'Находить НОД и НОК',
                'Использовать разложение на простые множители для НОД, НОК и взаимной простоты.',
                {
                  required: ['number.prime-factorization'],
                },
              ),
              skill(
                'number.remainders',
                'Рассуждать об остатках',
                'Находить и комбинировать остатки, распознавать циклы остатков.',
                {
                  difficulty: 4,
                  estimatedMinutes: 120,
                  required: ['number.divisibility-tests'],
                },
              ),
              skill(
                'number.digit-properties',
                'Использовать свойства десятичной записи числа',
                'Связывать цифры, сумму цифр, разрядность и делимость числа.',
                {
                  difficulty: 4,
                  estimatedMinutes: 105,
                  required: [
                    'number.divisibility-tests',
                    'number.operation-order',
                  ],
                },
              ),
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'section.algebra',
    name: 'Алгебраические преобразования',
    description:
      'Проверяемые преобразования выражений, степеней, корней, логарифмов и тригонометрии.',
    topics: [
      {
        code: 'topic.expressions',
        name: 'Алгебраические выражения',
        description:
          'Язык алгебры, тождественные преобразования и ограничения.',
        subtopics: [
          {
            code: 'subtopic.symbolic-transformations',
            name: 'Тождественные преобразования',
            description:
              'Навыки преобразования многочленов и рациональных выражений.',
            defaults: defaults({
              difficulty: 2,
              importance: 5,
              estimatedMinutes: 75,
              examNumbers: [6, 7, 9, 10, 13, 15, 18, 19],
              taskTypes: ['COMPUTATION', 'EQUATION', 'INEQUALITY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'ERROR_ANALYSIS',
              ],
              isFoundational: true,
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'algebra.expression-domain',
                'Определять допустимые значения выражения',
                'Находить ограничения знаменателей, корней чётной степени и логарифмов.',
                {
                  required: ['number.types-order'],
                },
              ),
              skill(
                'algebra.polynomial-operations',
                'Приводить подобные и выполнять действия с многочленами',
                'Раскрывать скобки, приводить подобные члены и упорядочивать многочлен.',
                {
                  required: [
                    'number.signed-operations',
                    'number.operation-order',
                  ],
                },
              ),
              skill(
                'algebra.identities',
                'Применять формулы сокращённого умножения',
                'Узнавать и использовать квадрат суммы, разность квадратов, сумму и разность кубов.',
                {
                  required: ['algebra.polynomial-operations'],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'algebra.factorization',
                'Раскладывать выражение на множители',
                'Выносить общий множитель, группировать и применять тождества.',
                {
                  estimatedMinutes: 105,
                  required: [
                    'algebra.polynomial-operations',
                    'algebra.identities',
                  ],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'algebra.rational-expressions',
                'Преобразовывать рациональные выражения',
                'Сокращать алгебраические дроби и выполнять действия с учётом ОДЗ.',
                {
                  difficulty: 3,
                  estimatedMinutes: 120,
                  required: [
                    'number.fractions',
                    'algebra.factorization',
                    'algebra.expression-domain',
                  ],
                },
              ),
              skill(
                'algebra.rationalization',
                'Рационализировать выражения',
                'Переходить к произведению множителей с эквивалентным знаком в логарифмических и иррациональных выражениях.',
                {
                  difficulty: 4,
                  isFoundational: false,
                  required: [
                    'algebra.factorization',
                    'algebra.expression-domain',
                  ],
                  recommended: ['algebra.rational-expressions'],
                  sourceCoverage: 'DIRECT',
                  needsExpertReview: true,
                  expertReviewNote:
                    'Проверить границы применения рационализации в принятой методике курса.',
                },
              ),
              skill(
                'algebra.absolute-value',
                'Раскрывать модуль по знаку выражения',
                'Переходить от модуля к кусочному описанию и контролировать границы случаев.',
                {
                  difficulty: 3,
                  required: ['number.types-order', 'algebra.expression-domain'],
                  sourceCoverage: 'DIRECT',
                },
              ),
            ],
          },
          {
            code: 'subtopic.powers-roots-logarithms',
            name: 'Степени, корни и логарифмы',
            description:
              'Отдельные проверяемые действия вместо единого крупного навыка.',
            defaults: defaults({
              difficulty: 2,
              importance: 5,
              estimatedMinutes: 75,
              examNumbers: [6, 7, 11, 13, 15, 18],
              taskTypes: ['COMPUTATION', 'EQUATION', 'INEQUALITY', 'GRAPH'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'ERROR_ANALYSIS',
              ],
              isFoundational: true,
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'algebra.integer-powers',
                'Применять свойства степеней с целым показателем',
                'Преобразовывать произведение, частное и степень степени.',
                {
                  required: ['number.fractions', 'number.operation-order'],
                },
              ),
              skill(
                'algebra.rational-powers',
                'Работать со степенями с рациональным показателем',
                'Связывать рациональную степень с корнем и учитывать область определения.',
                {
                  difficulty: 3,
                  required: [
                    'algebra.integer-powers',
                    'algebra.expression-domain',
                  ],
                },
              ),
              skill(
                'algebra.root-transformations',
                'Преобразовывать выражения с корнями',
                'Выносить множитель, объединять корни и учитывать модуль при извлечении корня.',
                {
                  difficulty: 3,
                  required: [
                    'algebra.integer-powers',
                    'algebra.absolute-value',
                  ],
                },
              ),
              skill(
                'algebra.log-definition',
                'Использовать определение логарифма и его ОДЗ',
                'Переходить между логарифмической и показательной формой, проверяя основание и аргумент.',
                {
                  difficulty: 3,
                  estimatedMinutes: 90,
                  required: [
                    'algebra.integer-powers',
                    'algebra.expression-domain',
                  ],
                },
              ),
              skill(
                'algebra.log-properties',
                'Преобразовывать логарифмические выражения',
                'Применять свойства суммы, разности, степени и перехода к новому основанию.',
                {
                  difficulty: 3,
                  estimatedMinutes: 105,
                  required: [
                    'algebra.log-definition',
                    'algebra.rational-expressions',
                  ],
                },
              ),
            ],
          },
        ],
      },
      {
        code: 'topic.trigonometry',
        name: 'Тригонометрия',
        description:
          'Тригонометрия разделена на измерение углов, значения, тождества и преобразования.',
        subtopics: [
          {
            code: 'subtopic.trig-foundations',
            name: 'Тригонометрические значения',
            description:
              'Основа чтения окружности и вычисления значений функций.',
            defaults: defaults({
              difficulty: 2,
              importance: 5,
              estimatedMinutes: 75,
              examNumbers: [6, 7, 11, 13, 15, 18],
              taskTypes: ['COMPUTATION', 'EQUATION', 'GRAPH'],
              verificationMethods: [
                'SHORT_ANSWER',
                'ORAL_EXPLANATION',
                'ERROR_ANALYSIS',
              ],
              isFoundational: true,
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'trig.angle-measure',
                'Переводить градусы в радианы и обратно',
                'Работать с направленными углами и периодическими поворотами.',
                {
                  required: ['number.fractions', 'number.ratio-proportion'],
                },
              ),
              skill(
                'trig.unit-circle',
                'Определять значения функций по единичной окружности',
                'Находить знаки, координаты и значения синуса и косинуса стандартных углов.',
                {
                  estimatedMinutes: 105,
                  required: ['trig.angle-measure'],
                },
              ),
              skill(
                'trig.tangent-cotangent',
                'Вычислять тангенс и котангенс',
                'Использовать определения через синус и косинус и контролировать ОДЗ.',
                {
                  required: [
                    'trig.unit-circle',
                    'algebra.rational-expressions',
                  ],
                },
              ),
            ],
          },
          {
            code: 'subtopic.trig-transformations',
            name: 'Тождества и формулы',
            description:
              'Проверяемые преобразования тригонометрических выражений.',
            defaults: defaults({
              difficulty: 3,
              importance: 5,
              estimatedMinutes: 90,
              examNumbers: [6, 7, 13, 15, 18],
              taskTypes: ['COMPUTATION', 'EQUATION', 'INEQUALITY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'ERROR_ANALYSIS',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'trig.basic-identities',
                'Применять основные тригонометрические тождества',
                'Использовать основное тождество и связи тангенса и котангенса.',
                {
                  required: ['trig.unit-circle', 'trig.tangent-cotangent'],
                },
              ),
              skill(
                'trig.reduction-formulas',
                'Применять формулы приведения и чётность',
                'Определять функцию, знак и аргумент после сдвига на четверть или половину окружности.',
                {
                  required: ['trig.unit-circle'],
                },
              ),
              skill(
                'trig.sum-difference',
                'Применять формулы суммы и разности аргументов',
                'Раскрывать и сворачивать синус и косинус суммы или разности.',
                {
                  difficulty: 4,
                  estimatedMinutes: 120,
                  required: ['trig.basic-identities'],
                },
              ),
              skill(
                'trig.double-half-angle',
                'Применять формулы двойного и половинного угла',
                'Преобразовывать выражения с удвоенным аргументом и понижением степени.',
                {
                  difficulty: 4,
                  estimatedMinutes: 120,
                  required: ['trig.basic-identities', 'trig.sum-difference'],
                },
              ),
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'section.equations',
    name: 'Уравнения и неравенства',
    description:
      'Способы решения, контроль равносильности и отбор допустимых решений.',
    topics: [
      {
        code: 'topic.equations',
        name: 'Уравнения и системы',
        description:
          'От линейных и квадратных моделей до логарифмических и тригонометрических уравнений.',
        subtopics: [
          {
            code: 'subtopic.basic-equations',
            name: 'Линейные и квадратные уравнения',
            description:
              'Фундаментальные способы решения, используемые во всех сложных типах.',
            defaults: defaults({
              difficulty: 2,
              importance: 5,
              estimatedMinutes: 75,
              examNumbers: [6, 9, 10, 13, 15, 16, 18, 19],
              taskTypes: ['EQUATION', 'APPLIED_MODEL'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'ERROR_ANALYSIS',
              ],
              isFoundational: true,
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'equation.linear',
                'Решать линейные уравнения',
                'Выполнять равносильные преобразования и проверять полученное решение.',
                {
                  required: [
                    'number.signed-operations',
                    'algebra.polynomial-operations',
                  ],
                },
              ),
              skill(
                'equation.linear-systems',
                'Решать системы линейных уравнений',
                'Применять подстановку, сложение и интерпретировать число решений.',
                {
                  estimatedMinutes: 90,
                  required: ['equation.linear'],
                },
              ),
              skill(
                'equation.quadratic-discriminant',
                'Решать квадратные уравнения через дискриминант',
                'Распознавать квадратное уравнение и находить все действительные корни.',
                {
                  required: [
                    'algebra.polynomial-operations',
                    'algebra.root-transformations',
                  ],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'equation.quadratic-vieta',
                'Использовать теорему Виета и разложение квадратного трёхчлена',
                'Подбирать и проверять корни, восстанавливать коэффициенты и факторизовать трёхчлен.',
                {
                  required: [
                    'equation.quadratic-discriminant',
                    'algebra.factorization',
                  ],
                  sourceCoverage: 'DIRECT',
                },
              ),
            ],
          },
          {
            code: 'subtopic.advanced-equations',
            name: 'Уравнения специальных видов',
            description:
              'Решение с обязательным контролем ОДЗ и посторонних корней.',
            defaults: defaults({
              difficulty: 3,
              importance: 5,
              estimatedMinutes: 105,
              examNumbers: [6, 13, 18],
              taskTypes: ['EQUATION'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'ERROR_ANALYSIS',
              ],
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'equation.rational',
                'Решать рациональные уравнения',
                'Приводить к общему знаменателю, решать числитель и исключать запрещённые значения.',
                {
                  required: [
                    'equation.quadratic-vieta',
                    'algebra.rational-expressions',
                  ],
                },
              ),
              skill(
                'equation.irrational',
                'Решать иррациональные уравнения',
                'Изолировать корень, возводить в степень с контролем равносильности и проверять корни.',
                {
                  required: [
                    'equation.quadratic-discriminant',
                    'algebra.root-transformations',
                    'algebra.expression-domain',
                  ],
                },
              ),
              skill(
                'equation.exponential',
                'Решать показательные уравнения',
                'Приводить к общему основанию, применять замену и учитывать положительность степени.',
                {
                  required: [
                    'equation.quadratic-vieta',
                    'algebra.rational-powers',
                  ],
                },
              ),
              skill(
                'equation.logarithmic',
                'Решать логарифмические уравнения',
                'Использовать свойства логарифмов и проверять область допустимых значений.',
                {
                  required: [
                    'equation.quadratic-vieta',
                    'algebra.log-properties',
                    'algebra.expression-domain',
                  ],
                },
              ),
              skill(
                'equation.trig-elementary',
                'Решать простейшие тригонометрические уравнения',
                'Записывать общие решения для синуса, косинуса, тангенса и котангенса.',
                {
                  required: ['trig.unit-circle', 'trig.tangent-cotangent'],
                  sourceCoverage: 'MISSING',
                },
              ),
              skill(
                'equation.trig-transform',
                'Преобразовывать тригонометрическое уравнение к простейшему',
                'Применять тождества, факторизацию, замену и однородность.',
                {
                  difficulty: 4,
                  estimatedMinutes: 150,
                  required: [
                    'equation.trig-elementary',
                    'trig.basic-identities',
                    'trig.double-half-angle',
                    'algebra.factorization',
                  ],
                  sourceCoverage: 'PARTIAL',
                },
              ),
              skill(
                'equation.trig-root-selection',
                'Отбирать корни тригонометрического уравнения',
                'Находить решения на промежутке и исключать корни по ограничениям задачи.',
                {
                  difficulty: 4,
                  estimatedMinutes: 120,
                  required: ['equation.trig-transform', 'trig.angle-measure'],
                  sourceCoverage: 'MISSING',
                },
              ),
              skill(
                'equation.mixed-systems',
                'Решать нелинейные системы и совокупности',
                'Выбирать подстановку, исключение или графическую интерпретацию для системы.',
                {
                  difficulty: 4,
                  estimatedMinutes: 150,
                  examNumbers: [13, 18],
                  required: [
                    'equation.linear-systems',
                    'equation.quadratic-vieta',
                  ],
                  recommended: ['equation.exponential', 'equation.logarithmic'],
                  sourceCoverage: 'MISSING',
                },
              ),
            ],
          },
        ],
      },
      {
        code: 'topic.inequalities',
        name: 'Неравенства',
        description:
          'Знаки выражений, метод интервалов, специальные неравенства и системы.',
        subtopics: [
          {
            code: 'subtopic.inequality-foundations',
            name: 'Базовые неравенства и метод интервалов',
            description:
              'Фундамент для всех рациональных и специальных неравенств.',
            defaults: defaults({
              difficulty: 2,
              importance: 5,
              estimatedMinutes: 90,
              examNumbers: [9, 15, 18],
              taskTypes: ['INEQUALITY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'ERROR_ANALYSIS',
              ],
              isFoundational: true,
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'inequality.linear',
                'Решать линейные неравенства',
                'Сохранять или менять знак при равносильных преобразованиях и записывать ответ промежутком.',
                {
                  required: ['equation.linear', 'number.types-order'],
                },
              ),
              skill(
                'inequality.quadratic',
                'Решать квадратные неравенства',
                'Определять знаки квадратного трёхчлена по корням и направлению ветвей.',
                {
                  required: [
                    'equation.quadratic-discriminant',
                    'inequality.linear',
                  ],
                },
              ),
              skill(
                'inequality.interval-method',
                'Применять метод интервалов к произведению',
                'Находить критические точки, учитывать кратность и выбирать интервалы нужного знака.',
                {
                  difficulty: 3,
                  required: ['inequality.quadratic', 'algebra.factorization'],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'inequality.rational',
                'Решать рациональные неравенства',
                'Применять метод интервалов с учётом нулей знаменателя и нестрогости.',
                {
                  difficulty: 3,
                  estimatedMinutes: 120,
                  required: [
                    'inequality.interval-method',
                    'algebra.rational-expressions',
                  ],
                },
              ),
            ],
          },
          {
            code: 'subtopic.special-inequalities',
            name: 'Специальные неравенства',
            description:
              'Неравенства с корнями, степенями, логарифмами и параметрами.',
            defaults: defaults({
              difficulty: 4,
              importance: 4,
              estimatedMinutes: 135,
              examNumbers: [15, 18],
              taskTypes: ['INEQUALITY', 'PARAMETER'],
              verificationMethods: [
                'MULTI_STEP_SOLUTION',
                'ERROR_ANALYSIS',
                'ORAL_EXPLANATION',
              ],
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'inequality.irrational',
                'Решать иррациональные неравенства',
                'Выбирать равносильную схему, учитывать неотрицательность и контролировать ОДЗ.',
                {
                  required: [
                    'inequality.quadratic',
                    'algebra.root-transformations',
                    'algebra.expression-domain',
                  ],
                  sourceCoverage: 'MISSING',
                },
              ),
              skill(
                'inequality.exponential',
                'Решать показательные неравенства',
                'Учитывать монотонность показательной функции при сравнении показателей.',
                {
                  required: [
                    'inequality.linear',
                    'equation.exponential',
                    'function.exponential',
                  ],
                  sourceCoverage: 'MISSING',
                },
              ),
              skill(
                'inequality.logarithmic',
                'Решать логарифмические неравенства',
                'Учитывать ОДЗ и изменение направления при основании между нулём и единицей.',
                {
                  required: [
                    'inequality.rational',
                    'equation.logarithmic',
                    'function.logarithmic',
                  ],
                  sourceCoverage: 'PARTIAL',
                },
              ),
              skill(
                'inequality.systems',
                'Решать системы и совокупности неравенств',
                'Пересекать и объединять множества решений, сохраняя граничные точки.',
                {
                  required: ['inequality.linear', 'inequality.rational'],
                },
              ),
              skill(
                'equation.parameter-cases',
                'Разбирать уравнения и неравенства с параметром по случаям',
                'Находить критические значения параметра и строить полное разбиение пространства случаев.',
                {
                  difficulty: 5,
                  importance: 3,
                  estimatedMinutes: 240,
                  examNumbers: [18],
                  required: [
                    'inequality.systems',
                    'function.graph-transformations',
                    'reasoning.case-analysis',
                  ],
                  recommended: [
                    {
                      code: 'function.inverse',
                      rationale:
                        'Обратимость часто упрощает параметрические конструкции.',
                    },
                  ],
                  sourceCoverage: 'MISSING',
                  needsExpertReview: true,
                  expertReviewNote:
                    'Нужно проверить достаточность набора методов для текущего банка №18.',
                },
              ),
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'section.functions',
    name: 'Функции и математический анализ',
    description:
      'Графики, свойства функций, производная, первообразная и оптимизация.',
    topics: [
      {
        code: 'topic.functions',
        name: 'Функции и графики',
        description:
          'Чтение, построение и преобразование графиков основных функций.',
        subtopics: [
          {
            code: 'subtopic.function-concepts',
            name: 'Общие свойства функции',
            description: 'Проверяемые характеристики функции и её графика.',
            defaults: defaults({
              difficulty: 2,
              importance: 5,
              estimatedMinutes: 75,
              examNumbers: [8, 11, 12, 16, 18],
              taskTypes: ['GRAPH'],
              verificationMethods: [
                'SHORT_ANSWER',
                'GRAPH_INTERPRETATION',
                'ORAL_EXPLANATION',
              ],
              isFoundational: true,
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'function.definition-domain-range',
                'Определять область определения и множество значений',
                'Находить допустимые аргументы и возможные значения по формуле и графику.',
                {
                  required: ['algebra.expression-domain', 'number.types-order'],
                },
              ),
              skill(
                'function.read-graph',
                'Считывать значения и свойства с графика',
                'Находить значения, нули, знаки, экстремумы и промежутки монотонности.',
                {
                  required: ['number.types-order'],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'function.parity-periodicity',
                'Определять чётность и периодичность функции',
                'Проверять симметрии и использовать период для продолжения графика.',
                {
                  difficulty: 3,
                  required: [
                    'function.definition-domain-range',
                    'function.read-graph',
                  ],
                  sourceCoverage: 'PARTIAL',
                },
              ),
              skill(
                'function.asymptotes-continuity',
                'Распознавать разрывы и асимптоты',
                'Определять поведение функции около исключённых точек и на бесконечности.',
                {
                  difficulty: 3,
                  isFoundational: false,
                  required: [
                    'function.definition-domain-range',
                    'algebra.rational-expressions',
                  ],
                  sourceCoverage: 'PARTIAL',
                },
              ),
            ],
          },
          {
            code: 'subtopic.elementary-functions',
            name: 'Графики элементарных функций',
            description: 'Каждый класс функций проверяется отдельно.',
            defaults: defaults({
              difficulty: 2,
              importance: 4,
              estimatedMinutes: 60,
              examNumbers: [8, 11, 12, 18],
              taskTypes: ['GRAPH'],
              verificationMethods: [
                'GRAPH_INTERPRETATION',
                'SHORT_ANSWER',
                'CONSTRUCTION',
              ],
              isFoundational: true,
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'function.linear',
                'Строить и читать линейную функцию',
                'Связывать коэффициенты с наклоном, пересечениями осей и взаимным положением прямых.',
                {
                  required: ['equation.linear'],
                },
              ),
              skill(
                'function.quadratic',
                'Строить и читать квадратичную функцию',
                'Находить вершину, ось симметрии, нули и направление ветвей параболы.',
                {
                  estimatedMinutes: 90,
                  required: ['equation.quadratic-discriminant'],
                },
              ),
              skill(
                'function.reciprocal',
                'Строить и читать обратную пропорциональность',
                'Определять ветви гиперболы, асимптоты и знак коэффициента.',
                {
                  required: ['algebra.rational-expressions'],
                },
              ),
              skill(
                'function.power-root',
                'Строить степенные функции и функции корня',
                'Различать чётные и нечётные степени, области определения и характерные точки.',
                {
                  difficulty: 3,
                  required: [
                    'algebra.rational-powers',
                    'algebra.root-transformations',
                  ],
                },
              ),
              skill(
                'function.exponential',
                'Строить и читать показательную функцию',
                'Определять монотонность по основанию и характерные значения.',
                {
                  difficulty: 3,
                  required: ['algebra.rational-powers'],
                },
              ),
              skill(
                'function.logarithmic',
                'Строить и читать логарифмическую функцию',
                'Определять область, монотонность по основанию и вертикальную асимптоту.',
                {
                  difficulty: 3,
                  required: ['algebra.log-definition', 'function.exponential'],
                },
              ),
              skill(
                'function.trigonometric',
                'Строить и читать тригонометрические функции',
                'Использовать амплитуду, период, нули и промежутки монотонности.',
                {
                  difficulty: 3,
                  estimatedMinutes: 105,
                  required: ['trig.unit-circle', 'function.parity-periodicity'],
                },
              ),
            ],
          },
          {
            code: 'subtopic.function-transformations',
            name: 'Преобразования и обратимость',
            description: 'Переход от базового графика к составной функции.',
            defaults: defaults({
              difficulty: 3,
              importance: 4,
              estimatedMinutes: 105,
              examNumbers: [11, 12, 18],
              taskTypes: ['GRAPH', 'PARAMETER'],
              verificationMethods: [
                'GRAPH_INTERPRETATION',
                'CONSTRUCTION',
                'ORAL_EXPLANATION',
              ],
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'function.graph-transformations',
                'Выполнять сдвиги, растяжения и отражения графика',
                'Определять влияние параметров в выражениях f(x-a), f(x)+b, kf(x) и f(kx).',
                {
                  required: [
                    'function.read-graph',
                    'function.linear',
                    'function.quadratic',
                  ],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'function.absolute-value-graphs',
                'Строить графики с модулем',
                'Отражать отрицательные части и разбирать модуль аргумента по случаям.',
                {
                  difficulty: 4,
                  required: [
                    'function.graph-transformations',
                    'algebra.absolute-value',
                  ],
                  sourceCoverage: 'MISSING',
                },
              ),
              skill(
                'function.inverse',
                'Работать с взаимно обратными функциями',
                'Проверять обратимость и отражать график относительно прямой y=x.',
                {
                  difficulty: 4,
                  importance: 3,
                  required: [
                    'function.definition-domain-range',
                    'function.graph-transformations',
                  ],
                  sourceCoverage: 'MISSING',
                  needsExpertReview: true,
                  expertReviewNote:
                    'Уточнить требуемую глубину для задач действующего банка.',
                },
              ),
            ],
          },
        ],
      },
      {
        code: 'topic.calculus',
        name: 'Производная и первообразная',
        description:
          'Смысл производной, вычисление и применение к исследованию функции.',
        subtopics: [
          {
            code: 'subtopic.derivative',
            name: 'Производная',
            description:
              'От интерпретации производной до касательной и экстремумов.',
            defaults: defaults({
              difficulty: 3,
              importance: 5,
              estimatedMinutes: 90,
              examNumbers: [8, 12, 16, 18],
              taskTypes: ['GRAPH', 'COMPUTATION', 'APPLIED_MODEL'],
              verificationMethods: [
                'SHORT_ANSWER',
                'GRAPH_INTERPRETATION',
                'MULTI_STEP_SOLUTION',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'calculus.derivative-meaning',
                'Интерпретировать производную как скорость изменения',
                'Связывать знак и значение производной с поведением функции и наклоном касательной.',
                {
                  required: ['function.read-graph', 'function.linear'],
                },
              ),
              skill(
                'calculus.derivative-rules',
                'Вычислять производные элементарных функций',
                'Применять таблицу и правила суммы, произведения, частного и композиции.',
                {
                  estimatedMinutes: 150,
                  required: [
                    'calculus.derivative-meaning',
                    'algebra.polynomial-operations',
                  ],
                  recommended: [
                    'function.power-root',
                    'function.exponential',
                    'function.logarithmic',
                    'function.trigonometric',
                  ],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'calculus.function-derivative-graph',
                'Связывать графики функции и производной',
                'По знаку производной определять монотонность, а по экстремумам функции — нули производной.',
                {
                  required: [
                    'calculus.derivative-meaning',
                    'function.read-graph',
                  ],
                },
              ),
              skill(
                'calculus.monotonicity-extrema',
                'Исследовать функцию на монотонность и экстремумы',
                'Находить критические точки, составлять знаковую схему производной и классифицировать экстремумы.',
                {
                  difficulty: 4,
                  estimatedMinutes: 150,
                  required: [
                    'calculus.derivative-rules',
                    'inequality.interval-method',
                  ],
                },
              ),
              skill(
                'calculus.max-min-segment',
                'Находить наибольшее и наименьшее значение на отрезке',
                'Сравнивать значения в критических точках и на концах отрезка.',
                {
                  difficulty: 4,
                  required: ['calculus.monotonicity-extrema'],
                },
              ),
              skill(
                'calculus.tangent-equation',
                'Составлять уравнение касательной',
                'Находить угловой коэффициент через производную и записывать прямую через точку.',
                {
                  required: ['calculus.derivative-rules', 'function.linear'],
                },
              ),
              skill(
                'calculus.antiderivative-integral',
                'Находить простейшие первообразные и интерпретировать интеграл',
                'Применять таблицу первообразных и связывать определённый интеграл с площадью.',
                {
                  difficulty: 4,
                  importance: 2,
                  estimatedMinutes: 120,
                  required: [
                    'calculus.derivative-rules',
                    'function.read-graph',
                  ],
                  sourceCoverage: 'MISSING',
                  needsExpertReview: true,
                  expertReviewNote:
                    'ФИПИ включает элемент содержания, но представленность в текущем банке нужно проверить.',
                },
              ),
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'section.probability',
    name: 'Вероятность, комбинаторика и статистика',
    description:
      'Исходы случайного опыта, операции над событиями и вероятностные модели задач №4 и №5.',
    topics: [
      {
        code: 'topic.probability',
        name: 'Вероятность и подсчёт исходов',
        description:
          'От пространства исходов до условной вероятности и испытаний Бернулли.',
        subtopics: [
          {
            code: 'subtopic.probability-basics',
            name: 'Случайные события',
            description: 'Базовый язык вероятности и операции над событиями.',
            defaults: defaults({
              difficulty: 2,
              importance: 4,
              estimatedMinutes: 60,
              examNumbers: [4, 5],
              taskTypes: ['PROBABILITY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'ORAL_EXPLANATION',
                'ERROR_ANALYSIS',
              ],
              isFoundational: true,
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'probability.sample-space',
                'Строить пространство элементарных исходов',
                'Перечислять или структурировать все возможные исходы случайного опыта без пропусков и повторов.',
                {
                  required: ['number.types-order'],
                },
              ),
              skill(
                'probability.classical',
                'Вычислять классическую вероятность',
                'Находить отношение числа благоприятных равновозможных исходов к числу всех исходов.',
                {
                  required: ['probability.sample-space', 'number.fractions'],
                },
              ),
              skill(
                'probability.complement',
                'Использовать противоположное событие',
                'Переходить к дополнению, когда прямой подсчёт сложнее.',
                {
                  required: ['probability.classical'],
                },
              ),
              skill(
                'probability.union',
                'Применять правило сложения вероятностей',
                'Различать совместные и несовместные события и учитывать пересечение.',
                {
                  difficulty: 3,
                  required: ['probability.classical'],
                },
              ),
            ],
          },
          {
            code: 'subtopic.complex-probability',
            name: 'Сложные вероятностные модели',
            description:
              'Подсчёт, независимость, условная вероятность и повторные испытания.',
            defaults: defaults({
              difficulty: 3,
              importance: 4,
              estimatedMinutes: 90,
              examNumbers: [4, 5],
              taskTypes: ['PROBABILITY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'MODELING',
              ],
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'probability.counting',
                'Применять правила суммы и произведения при подсчёте',
                'Разбивать выбор на этапы или альтернативы и не смешивать два правила.',
                {
                  required: [
                    'probability.sample-space',
                    'number.operation-order',
                  ],
                  sourceCoverage: 'MISSING',
                },
              ),
              skill(
                'probability.independence',
                'Применять правило умножения для независимых событий',
                'Проверять смысл независимости и вычислять вероятность совместного наступления.',
                {
                  required: ['probability.classical', 'probability.union'],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'probability.conditional-tree',
                'Работать с условной вероятностью и деревом событий',
                'Строить последовательную модель зависимых событий и пересчитывать пространство исходов.',
                {
                  difficulty: 4,
                  estimatedMinutes: 120,
                  required: [
                    'probability.independence',
                    'probability.counting',
                  ],
                  sourceCoverage: 'MISSING',
                },
              ),
              skill(
                'probability.bernoulli',
                'Применять схему Бернулли',
                'Находить вероятность заданного числа успехов в независимых повторных испытаниях.',
                {
                  difficulty: 4,
                  estimatedMinutes: 120,
                  required: [
                    'probability.independence',
                    'probability.counting',
                    'algebra.integer-powers',
                  ],
                  sourceCoverage: 'MISSING',
                },
              ),
              skill(
                'probability.frequency-data',
                'Интерпретировать частоты и статистические таблицы',
                'Переходить между абсолютной и относительной частотой и читать простые распределения.',
                {
                  difficulty: 2,
                  importance: 2,
                  required: [
                    'number.ratio-proportion',
                    'probability.sample-space',
                  ],
                  sourceCoverage: 'MISSING',
                  needsExpertReview: true,
                  expertReviewNote:
                    'Проверить фактическую представленность статистики в заданиях профильного ЕГЭ.',
                },
              ),
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'section.applied',
    name: 'Прикладные и финансовые модели',
    description:
      'Перевод реального условия в математическую модель, решение и проверка результата.',
    topics: [
      {
        code: 'topic.word-problems',
        name: 'Текстовые и прикладные задачи',
        description:
          'Формулы величин, движение, работа, смеси и последовательности.',
        subtopics: [
          {
            code: 'subtopic.modeling-foundations',
            name: 'Построение модели',
            description:
              'Общие навыки чтения условия и проверки математической модели.',
            defaults: defaults({
              difficulty: 2,
              importance: 5,
              estimatedMinutes: 75,
              examNumbers: [9, 10, 16],
              taskTypes: ['APPLIED_MODEL'],
              verificationMethods: [
                'MODELING',
                'SHORT_ANSWER',
                'ERROR_ANALYSIS',
              ],
              isFoundational: true,
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'applied.read-data',
                'Извлекать данные из текста, таблицы, графика и формулы',
                'Определять известные величины, единицы, искомое и ограничения модели.',
                {
                  required: ['number.units-conversion', 'function.read-graph'],
                },
              ),
              skill(
                'applied.build-equation',
                'Составлять уравнение по условию',
                'Выбирать неизвестную, выражать остальные величины и записывать связь между ними.',
                {
                  estimatedMinutes: 105,
                  required: [
                    'equation.linear',
                    'number.ratio-proportion',
                    'applied.read-data',
                  ],
                },
              ),
              skill(
                'applied.validate-result',
                'Проверять решение в контексте условия',
                'Отбрасывать недопустимые значения, возвращать единицы и оценивать реалистичность.',
                {
                  required: ['applied.build-equation', 'number.estimate-check'],
                },
              ),
            ],
          },
          {
            code: 'subtopic.motion-work-mixtures',
            name: 'Движение, работа и смеси',
            description: 'Основные типы текстовых моделей задачи №10.',
            defaults: defaults({
              difficulty: 3,
              importance: 4,
              estimatedMinutes: 105,
              examNumbers: [10],
              taskTypes: ['APPLIED_MODEL'],
              verificationMethods: [
                'MODELING',
                'MULTI_STEP_SOLUTION',
                'ERROR_ANALYSIS',
              ],
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'applied.straight-motion',
                'Решать задачи на прямолинейное движение',
                'Связывать путь, скорость и время для встречного движения и движения вдогонку.',
                {
                  required: [
                    'applied.build-equation',
                    'number.units-conversion',
                  ],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'applied.water-circle-motion',
                'Решать задачи на движение по воде и окружности',
                'Работать с собственной скоростью, течением, периодом и опережением.',
                {
                  required: ['applied.straight-motion'],
                  sourceCoverage: 'PARTIAL',
                },
              ),
              skill(
                'applied.work',
                'Решать задачи на совместную работу',
                'Складывать производительности и связывать объём, время и скорость работы.',
                {
                  required: ['applied.build-equation', 'number.fractions'],
                  sourceCoverage: 'PARTIAL',
                },
              ),
              skill(
                'applied.mixtures',
                'Решать задачи на смеси и сплавы',
                'Составлять баланс массы вещества и учитывать концентрацию.',
                {
                  required: [
                    'applied.build-equation',
                    'number.percent-of-value',
                  ],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'applied.progression-model',
                'Распознавать арифметическую и геометрическую прогрессию в условии',
                'Записывать общий член и сумму, связывая параметры с прикладным смыслом.',
                {
                  required: [
                    'algebra.polynomial-operations',
                    'algebra.integer-powers',
                  ],
                  sourceCoverage: 'DIRECT',
                },
              ),
            ],
          },
        ],
      },
      {
        code: 'topic.finance',
        name: 'Финансовая математика',
        description: 'Проценты, кредиты, вклады и оптимизация в задачах №16.',
        subtopics: [
          {
            code: 'subtopic.finance-models',
            name: 'Финансовые схемы',
            description:
              'Разные схемы платежей разделены на самостоятельные навыки.',
            defaults: defaults({
              difficulty: 4,
              importance: 4,
              estimatedMinutes: 150,
              examNumbers: [16],
              taskTypes: ['APPLIED_MODEL'],
              verificationMethods: [
                'MODELING',
                'MULTI_STEP_SOLUTION',
                'ERROR_ANALYSIS',
              ],
              sourceCoverage: 'MISSING',
            }),
            skills: [
              skill(
                'finance.compound-interest',
                'Строить модель сложных процентов',
                'Вычислять изменение капитала за несколько периодов с учётом пополнений или снятий.',
                {
                  difficulty: 3,
                  required: [
                    'number.percent-change',
                    'applied.progression-model',
                  ],
                },
              ),
              skill(
                'finance.differentiated-loan',
                'Решать задачи с дифференцированными платежами',
                'Строить таблицу долга, процентов и платежей при равномерном уменьшении основного долга.',
                {
                  required: ['finance.compound-interest', 'applied.read-data'],
                },
              ),
              skill(
                'finance.annuity-loan',
                'Решать задачи с аннуитетными платежами',
                'Выводить и применять рекуррентную модель постоянного платежа.',
                {
                  difficulty: 5,
                  estimatedMinutes: 210,
                  required: [
                    'finance.compound-interest',
                    'equation.exponential',
                  ],
                  needsExpertReview: true,
                  expertReviewNote:
                    'Проверить необходимость отдельного навыка для текущей версии КИМ.',
                },
              ),
              skill(
                'finance.optimization',
                'Оптимизировать финансовую модель',
                'Выбирать параметр кредита или вклада по условию минимума, максимума или ограничений.',
                {
                  difficulty: 5,
                  estimatedMinutes: 210,
                  required: [
                    'finance.differentiated-loan',
                    'calculus.max-min-segment',
                  ],
                  recommended: ['finance.annuity-loan'],
                },
              ),
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'section.planimetry',
    name: 'Планиметрия',
    description:
      'Геометрические факты, вычисления и доказательства для задач №1 и №17.',
    topics: [
      ege01PlanimetryTopic,
      {
        code: 'topic.triangles',
        name: 'Треугольники',
        description:
          'Углы, метрические отношения, равенство, подобие и замечательные линии.',
        subtopics: [
          {
            code: 'subtopic.triangle-foundations',
            name: 'Базовые свойства треугольника',
            description:
              'Фундаментальные факты для всей планиметрии и стереометрии.',
            defaults: defaults({
              difficulty: 2,
              importance: 5,
              estimatedMinutes: 75,
              examNumbers: [2, 3, 14, 17],
              taskTypes: ['PLANE_GEOMETRY', 'STEREOMETRY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'CONSTRUCTION',
                'ORAL_EXPLANATION',
              ],
              isFoundational: true,
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'geometry.angles-parallel',
                'Работать с углами и параллельными прямыми',
                'Использовать вертикальные, смежные, соответственные и накрест лежащие углы.',
                {
                  required: ['number.operation-order'],
                },
              ),
              skill(
                'geometry.triangle-angle-sum',
                'Применять сумму углов и внешние углы треугольника',
                'Находить неизвестные углы и распознавать возможные конфигурации.',
                {
                  required: ['geometry.angles-parallel'],
                },
              ),
              skill(
                'geometry.pythagorean',
                'Применять теорему Пифагора и обратную теорему',
                'Находить стороны и проверять прямоугольность треугольника.',
                {
                  required: [
                    'geometry.triangle-angle-sum',
                    'algebra.root-transformations',
                  ],
                },
              ),
              skill(
                'geometry.right-triangle-ratios',
                'Использовать отношения сторон прямоугольного треугольника',
                'Применять синус, косинус и тангенс острого угла к метрическим вычислениям.',
                {
                  difficulty: 3,
                  estimatedMinutes: 105,
                  required: ['geometry.pythagorean', 'number.ratio-proportion'],
                  recommended: ['trig.unit-circle'],
                },
              ),
              skill(
                'geometry.triangle-area',
                'Вычислять площадь треугольника разными способами',
                'Выбирать формулу через высоту, две стороны и угол, радиусы или формулу Герона.',
                {
                  difficulty: 3,
                  estimatedMinutes: 105,
                  required: [
                    'geometry.pythagorean',
                    'geometry.right-triangle-ratios',
                    'algebra.root-transformations',
                  ],
                },
              ),
            ],
          },
          {
            code: 'subtopic.triangle-relations',
            name: 'Равенство и подобие',
            description:
              'Структурные связи треугольников и пропорциональные отрезки.',
            defaults: defaults({
              difficulty: 3,
              importance: 5,
              estimatedMinutes: 105,
              examNumbers: [3, 14, 17],
              taskTypes: ['PLANE_GEOMETRY', 'STEREOMETRY'],
              verificationMethods: [
                'MULTI_STEP_SOLUTION',
                'PROOF',
                'CONSTRUCTION',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'geometry.triangle-congruence',
                'Доказывать равенство треугольников',
                'Выбирать подходящий признак и переносить равенство соответствующих элементов.',
                {
                  required: ['geometry.triangle-angle-sum'],
                },
              ),
              skill(
                'geometry.triangle-similarity',
                'Доказывать подобие треугольников',
                'Выбирать признак подобия и составлять корректные пропорции соответствующих сторон.',
                {
                  required: [
                    'geometry.triangle-angle-sum',
                    'number.ratio-proportion',
                  ],
                },
              ),
              skill(
                'geometry.similarity-area',
                'Использовать коэффициент подобия для длин и площадей',
                'Различать линейный коэффициент и квадрат коэффициента для площадей.',
                {
                  required: [
                    'geometry.triangle-similarity',
                    'geometry.triangle-area',
                  ],
                },
              ),
            ],
          },
          {
            code: 'subtopic.triangle-cevians',
            name: 'Замечательные линии и точки',
            description: 'Медианы, биссектрисы, высоты и центры треугольника.',
            defaults: defaults({
              difficulty: 3,
              importance: 4,
              estimatedMinutes: 90,
              examNumbers: [17],
              taskTypes: ['PLANE_GEOMETRY'],
              verificationMethods: ['SHORT_ANSWER', 'PROOF', 'CONSTRUCTION'],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'geometry.medians',
                'Использовать свойства медиан и центра тяжести',
                'Работать с отношением отрезков медианы и площадями частей треугольника.',
                {
                  required: [
                    'geometry.triangle-area',
                    'geometry.triangle-congruence',
                  ],
                },
              ),
              skill(
                'geometry.angle-bisector',
                'Использовать свойства биссектрисы',
                'Применять теорему о пропорциональных отрезках и свойства центра вписанной окружности.',
                {
                  required: [
                    'geometry.triangle-similarity',
                    'geometry.angles-parallel',
                  ],
                },
              ),
              skill(
                'geometry.altitudes',
                'Работать с высотами и ортоцентром',
                'Строить высоты, находить прямоугольные треугольники и использовать подобие.',
                {
                  required: [
                    'geometry.pythagorean',
                    'geometry.triangle-similarity',
                  ],
                },
              ),
              skill(
                'geometry.perpendicular-bisectors',
                'Использовать серединные перпендикуляры и центр окружности',
                'Применять равноудалённость точек и свойства центра описанной окружности.',
                {
                  required: [
                    'geometry.triangle-congruence',
                    'geometry.pythagorean',
                  ],
                },
              ),
            ],
          },
        ],
      },
      {
        code: 'topic.quadrilaterals-polygons',
        name: 'Четырёхугольники и многоугольники',
        description: 'Свойства, признаки, площади и специальные конфигурации.',
        subtopics: [
          {
            code: 'subtopic.quadrilaterals',
            name: 'Четырёхугольники',
            description:
              'Каждый основной класс четырёхугольников проверяется отдельно.',
            defaults: defaults({
              difficulty: 3,
              importance: 4,
              estimatedMinutes: 90,
              examNumbers: [3, 17],
              taskTypes: ['PLANE_GEOMETRY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'PROOF',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'geometry.parallelogram',
                'Применять свойства и признаки параллелограмма',
                'Работать с диагоналями, противоположными сторонами, углами и площадью.',
                {
                  required: [
                    'geometry.angles-parallel',
                    'geometry.triangle-congruence',
                  ],
                },
              ),
              skill(
                'geometry.rectangle-rhombus-square',
                'Различать прямоугольник, ромб и квадрат',
                'Применять специальные свойства диагоналей, углов и площадей.',
                {
                  required: ['geometry.parallelogram'],
                },
              ),
              skill(
                'geometry.trapezoid',
                'Применять свойства трапеции',
                'Использовать среднюю линию, высоту, свойства равнобедренной трапеции и площадь.',
                {
                  required: [
                    'geometry.angles-parallel',
                    'geometry.triangle-similarity',
                  ],
                },
              ),
              skill(
                'geometry.arbitrary-quadrilateral',
                'Работать с произвольным четырёхугольником',
                'Разбивать на треугольники и применять диагонали, площади и угловые отношения.',
                {
                  difficulty: 4,
                  estimatedMinutes: 120,
                  required: [
                    'geometry.triangle-area',
                    'geometry.triangle-similarity',
                  ],
                },
              ),
            ],
          },
          {
            code: 'subtopic.polygons',
            name: 'Многоугольники',
            description: 'Углы, периметр, площадь и правильные многоугольники.',
            defaults: defaults({
              difficulty: 3,
              importance: 3,
              estimatedMinutes: 75,
              examNumbers: [3, 17],
              taskTypes: ['PLANE_GEOMETRY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'CONSTRUCTION',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'geometry.polygon-angles',
                'Вычислять углы и число диагоналей многоугольника',
                'Использовать разбиение на треугольники и формулу суммы внутренних углов.',
                {
                  required: ['geometry.triangle-angle-sum'],
                },
              ),
              skill(
                'geometry.regular-polygons',
                'Работать с правильными многоугольниками',
                'Связывать сторону, радиусы вписанной и описанной окружностей, периметр и площадь.',
                {
                  required: [
                    'geometry.polygon-angles',
                    'geometry.right-triangle-ratios',
                  ],
                },
              ),
            ],
          },
        ],
      },
      {
        code: 'topic.circle',
        name: 'Окружность и круг',
        description:
          'Углы, хорды, секущие, касательные и вписанные конфигурации.',
        subtopics: [
          {
            code: 'subtopic.circle-foundations',
            name: 'Базовые свойства окружности',
            description: 'Метрические и угловые свойства окружности.',
            defaults: defaults({
              difficulty: 3,
              importance: 5,
              estimatedMinutes: 90,
              examNumbers: [3, 17],
              taskTypes: ['PLANE_GEOMETRY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'PROOF',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'geometry.circle-metrics',
                'Вычислять длину окружности, дуги и площадь круга',
                'Связывать центральный угол с длиной дуги и площадью сектора.',
                {
                  required: [
                    'number.ratio-proportion',
                    'algebra.integer-powers',
                  ],
                },
              ),
              skill(
                'geometry.circle-angles',
                'Работать с центральными и вписанными углами',
                'Связывать углы с дугами и распознавать угол, опирающийся на диаметр.',
                {
                  required: [
                    'geometry.angles-parallel',
                    'geometry.circle-metrics',
                  ],
                },
              ),
              skill(
                'geometry.chords-secants',
                'Применять свойства хорд и секущих',
                'Использовать произведения отрезков пересекающихся хорд и секущих.',
                {
                  required: [
                    'geometry.circle-angles',
                    'geometry.triangle-similarity',
                  ],
                },
              ),
              skill(
                'geometry.tangents',
                'Применять свойства касательной',
                'Использовать перпендикулярность радиусу, равенство касательных и степень точки.',
                {
                  required: ['geometry.circle-angles', 'geometry.pythagorean'],
                },
              ),
            ],
          },
          {
            code: 'subtopic.inscribed-circumscribed',
            name: 'Вписанные и описанные фигуры',
            description:
              'Треугольники и четырёхугольники, связанные с окружностью.',
            defaults: defaults({
              difficulty: 4,
              importance: 4,
              estimatedMinutes: 120,
              examNumbers: [17],
              taskTypes: ['PLANE_GEOMETRY'],
              verificationMethods: [
                'MULTI_STEP_SOLUTION',
                'PROOF',
                'CONSTRUCTION',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'geometry.cyclic-quadrilateral',
                'Использовать свойства вписанного четырёхугольника',
                'Применять сумму противоположных углов и критерии вписанности.',
                {
                  required: [
                    'geometry.circle-angles',
                    'geometry.arbitrary-quadrilateral',
                  ],
                },
              ),
              skill(
                'geometry.circumscribed-quadrilateral',
                'Использовать свойства описанного четырёхугольника',
                'Применять равенство сумм противоположных сторон и свойства касательных.',
                {
                  required: [
                    'geometry.tangents',
                    'geometry.arbitrary-quadrilateral',
                  ],
                },
              ),
              skill(
                'geometry.triangle-circles',
                'Связывать треугольник с вписанной и описанной окружностями',
                'Использовать радиусы, площадь, полупериметр и расширенную теорему синусов.',
                {
                  required: [
                    'geometry.triangle-area',
                    'geometry.angle-bisector',
                    'geometry.perpendicular-bisectors',
                    'geometry.circle-angles',
                  ],
                },
              ),
            ],
          },
        ],
      },
      {
        code: 'topic.advanced-planimetry',
        name: 'Сложная планиметрия',
        description:
          'Доказательные конфигурации и специальные теоремы задачи №17.',
        subtopics: [
          {
            code: 'subtopic.advanced-planimetry',
            name: 'Специальные теоремы и доказательства',
            description:
              'Инструменты, которые применяются после освоения базовых конфигураций.',
            defaults: defaults({
              difficulty: 5,
              importance: 3,
              estimatedMinutes: 150,
              examNumbers: [17],
              taskTypes: ['PLANE_GEOMETRY'],
              verificationMethods: ['PROOF', 'MULTI_STEP_SOLUTION'],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'geometry.ceva-menelaus',
                'Применять теоремы Чевы и Менелая',
                'Распознавать конкурентность или коллинеарность и составлять произведение отношений.',
                {
                  required: [
                    'geometry.triangle-similarity',
                    'geometry.medians',
                    'reasoning.proof-structure',
                  ],
                },
              ),
              skill(
                'geometry.ptolemy',
                'Применять теорему Птолемея',
                'Использовать связь диагоналей и сторон вписанного четырёхугольника.',
                {
                  required: [
                    'geometry.cyclic-quadrilateral',
                    'algebra.rational-expressions',
                  ],
                },
              ),
              skill(
                'geometry.composite-configuration',
                'Строить решение сложной геометрической конфигурации',
                'Выделять опорные треугольники, добавлять построения и связывать несколько теорем.',
                {
                  estimatedMinutes: 240,
                  required: [
                    'geometry.triangle-similarity',
                    'geometry.triangle-circles',
                    'reasoning.proof-structure',
                  ],
                  recommended: ['geometry.ceva-menelaus', 'geometry.ptolemy'],
                  needsExpertReview: true,
                  expertReviewNote:
                    'Эксперт должен проверить, не требуется ли дробление по типам дополнительных построений.',
                },
              ),
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'section.spatial',
    name: 'Векторы и стереометрия',
    description:
      'Координатно-векторные методы, пространственные фигуры, углы и расстояния.',
    topics: [
      {
        code: 'topic.vectors',
        name: 'Векторы',
        description:
          'Координаты, операции и геометрическое применение векторов.',
        subtopics: [
          {
            code: 'subtopic.vectors',
            name: 'Векторные вычисления',
            description: 'От координат вектора до скалярного произведения.',
            defaults: defaults({
              difficulty: 2,
              importance: 4,
              estimatedMinutes: 75,
              examNumbers: [2, 14],
              taskTypes: ['COMPUTATION', 'PLANE_GEOMETRY', 'STEREOMETRY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'CONSTRUCTION',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'vector.coordinates',
                'Находить координаты и длину вектора',
                'Вычитать координаты концов и применять формулу длины.',
                {
                  isFoundational: true,
                  required: [
                    'number.signed-operations',
                    'algebra.root-transformations',
                  ],
                },
              ),
              skill(
                'vector.operations',
                'Складывать векторы и умножать на число',
                'Выполнять операции в координатах и интерпретировать их геометрически.',
                {
                  isFoundational: true,
                  required: ['vector.coordinates'],
                },
              ),
              skill(
                'vector.dot-product',
                'Вычислять скалярное произведение',
                'Использовать координатную и геометрическую формулы.',
                {
                  difficulty: 3,
                  required: ['vector.operations', 'trig.unit-circle'],
                },
              ),
              skill(
                'vector.angle-orthogonality',
                'Находить угол и проверять перпендикулярность векторов',
                'Использовать знак и нулевое значение скалярного произведения.',
                {
                  difficulty: 3,
                  required: ['vector.dot-product'],
                },
              ),
            ],
          },
        ],
      },
      {
        code: 'topic.solid-geometry',
        name: 'Пространственные фигуры',
        description: 'Метрические свойства многогранников и тел вращения.',
        subtopics: [
          {
            code: 'subtopic.solid-metrics',
            name: 'Площади и объёмы тел',
            description:
              'Каждая группа пространственных тел требует отдельного распознавания элементов.',
            defaults: defaults({
              difficulty: 3,
              importance: 4,
              estimatedMinutes: 105,
              examNumbers: [3, 14],
              taskTypes: ['STEREOMETRY'],
              verificationMethods: [
                'SHORT_ANSWER',
                'MULTI_STEP_SOLUTION',
                'CONSTRUCTION',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'stereometry.prisms-parallelepipeds',
                'Вычислять элементы призм и параллелепипедов',
                'Работать с диагоналями, площадью поверхности и объёмом.',
                {
                  required: ['geometry.pythagorean', 'geometry.parallelogram'],
                },
              ),
              skill(
                'stereometry.pyramids',
                'Вычислять элементы пирамид',
                'Находить высоту, апофему, площадь поверхности и объём.',
                {
                  required: [
                    'geometry.triangle-area',
                    'geometry.polygon-angles',
                    'geometry.pythagorean',
                  ],
                },
              ),
              skill(
                'stereometry.cylinder-cone',
                'Вычислять элементы цилиндра и конуса',
                'Использовать осевое сечение, образующую, площади и объёмы.',
                {
                  required: ['geometry.circle-metrics', 'geometry.pythagorean'],
                },
              ),
              skill(
                'stereometry.sphere',
                'Вычислять элементы сферы и шара',
                'Работать с сечениями, площадью сферы и объёмом шара.',
                {
                  required: [
                    'geometry.circle-metrics',
                    'algebra.integer-powers',
                  ],
                },
              ),
            ],
          },
        ],
      },
      {
        code: 'topic.spatial-relations',
        name: 'Прямые и плоскости в пространстве',
        description:
          'Параллельность, перпендикулярность, сечения, углы и расстояния задачи №14.',
        subtopics: [
          {
            code: 'subtopic.spatial-foundations',
            name: 'Взаимное положение и проекции',
            description: 'Фундаментальные пространственные отношения.',
            defaults: defaults({
              difficulty: 4,
              importance: 5,
              estimatedMinutes: 120,
              examNumbers: [3, 14],
              taskTypes: ['STEREOMETRY'],
              verificationMethods: [
                'CONSTRUCTION',
                'PROOF',
                'ORAL_EXPLANATION',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'stereometry.line-plane-relations',
                'Определять взаимное положение прямых и плоскостей',
                'Распознавать параллельность, пересечение и скрещивание по признакам.',
                {
                  isFoundational: true,
                  required: [
                    'geometry.angles-parallel',
                    'reasoning.proof-structure',
                  ],
                },
              ),
              skill(
                'stereometry.perpendicular-projection',
                'Использовать перпендикуляр и ортогональную проекцию',
                'Применять теорему о трёх перпендикулярах и строить проекции.',
                {
                  required: [
                    'stereometry.line-plane-relations',
                    'geometry.pythagorean',
                  ],
                },
              ),
              skill(
                'stereometry.sections',
                'Строить сечение многогранника',
                'Находить след секущей плоскости на гранях и обосновывать полученный многоугольник.',
                {
                  difficulty: 5,
                  estimatedMinutes: 180,
                  required: [
                    'stereometry.line-plane-relations',
                    'stereometry.prisms-parallelepipeds',
                    'stereometry.pyramids',
                  ],
                },
              ),
            ],
          },
          {
            code: 'subtopic.spatial-angles-distances',
            name: 'Углы и расстояния',
            description:
              'Разные пространственные величины не объединяются в один навык.',
            defaults: defaults({
              difficulty: 5,
              importance: 4,
              estimatedMinutes: 150,
              examNumbers: [14],
              taskTypes: ['STEREOMETRY'],
              verificationMethods: [
                'CONSTRUCTION',
                'MULTI_STEP_SOLUTION',
                'PROOF',
              ],
              sourceCoverage: 'DIRECT',
            }),
            skills: [
              skill(
                'stereometry.angle-between-lines',
                'Находить угол между прямыми в пространстве',
                'Строить параллельный перенос направления и вычислять плоский угол.',
                {
                  required: [
                    'stereometry.line-plane-relations',
                    'geometry.right-triangle-ratios',
                  ],
                  recommended: ['vector.angle-orthogonality'],
                },
              ),
              skill(
                'stereometry.angle-line-plane',
                'Находить угол между прямой и плоскостью',
                'Строить ортогональную проекцию прямой и вычислять угол с проекцией.',
                {
                  required: [
                    'stereometry.perpendicular-projection',
                    'geometry.right-triangle-ratios',
                  ],
                },
              ),
              skill(
                'stereometry.angle-between-planes',
                'Находить угол между плоскостями',
                'Строить линейный угол двугранного угла или использовать площади проекций.',
                {
                  required: [
                    'stereometry.perpendicular-projection',
                    'geometry.right-triangle-ratios',
                  ],
                },
              ),
              skill(
                'stereometry.point-plane-distance',
                'Находить расстояние от точки до плоскости',
                'Строить перпендикуляр или использовать объём пирамиды двумя способами.',
                {
                  required: [
                    'stereometry.perpendicular-projection',
                    'stereometry.pyramids',
                  ],
                },
              ),
              skill(
                'stereometry.skew-lines-distance',
                'Находить расстояние между скрещивающимися прямыми',
                'Строить общий перпендикуляр или переходить к параллельной плоскости.',
                {
                  required: [
                    'stereometry.point-plane-distance',
                    'stereometry.line-plane-relations',
                  ],
                },
              ),
              skill(
                'stereometry.coordinate-vector-method',
                'Применять координатно-векторный метод в стереометрии',
                'Задавать координаты, составлять направляющие векторы и нормали для углов и расстояний.',
                {
                  required: [
                    'vector.angle-orthogonality',
                    'stereometry.line-plane-relations',
                  ],
                  recommended: [
                    'stereometry.angle-between-planes',
                    'stereometry.point-plane-distance',
                  ],
                  sourceCoverage: 'MISSING',
                },
              ),
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'section.reasoning',
    name: 'Доказательства и стратегии рассуждения',
    description:
      'Общие математические действия, которые проявляются в заданиях второй части.',
    topics: [
      {
        code: 'topic.reasoning',
        name: 'Математическое рассуждение',
        description:
          'Структура доказательства, разбор случаев и целочисленные аргументы.',
        subtopics: [
          {
            code: 'subtopic.proof-strategies',
            name: 'Доказательные стратегии',
            description: 'Проверяемые метанавыки развёрнутого решения.',
            defaults: defaults({
              difficulty: 4,
              importance: 5,
              estimatedMinutes: 120,
              examNumbers: [14, 17, 18, 19],
              taskTypes: [
                'PLANE_GEOMETRY',
                'STEREOMETRY',
                'PARAMETER',
                'NUMBER_THEORY',
              ],
              verificationMethods: [
                'PROOF',
                'ORAL_EXPLANATION',
                'ERROR_ANALYSIS',
              ],
              sourceCoverage: 'MISSING',
            }),
            skills: [
              skill(
                'reasoning.proof-structure',
                'Строить логически полное доказательство',
                'Формулировать данные, утверждение, цепочку обоснований и вывод без скрытых переходов.',
                {
                  isFoundational: true,
                  required: ['algebra.expression-domain'],
                },
              ),
              skill(
                'reasoning.necessary-sufficient',
                'Различать необходимые и достаточные условия',
                'Проверять направление импликации и находить контрпример к ложному обратному утверждению.',
                {
                  required: ['reasoning.proof-structure'],
                },
              ),
              skill(
                'reasoning.case-analysis',
                'Выполнять полный разбор случаев',
                'Выбирать критические границы, доказывать полноту и не учитывать один случай дважды.',
                {
                  required: [
                    'reasoning.proof-structure',
                    'algebra.absolute-value',
                  ],
                },
              ),
              skill(
                'reasoning.construction',
                'Выбирать полезное дополнительное построение',
                'Добавлять линию, точку или систему координат, которая открывает известную конфигурацию.',
                {
                  difficulty: 5,
                  estimatedMinutes: 180,
                  required: ['reasoning.proof-structure'],
                  recommended: [
                    'geometry.triangle-similarity',
                    'vector.operations',
                  ],
                  needsExpertReview: true,
                  expertReviewNote:
                    'Навык может потребовать разбиения по классам геометрических построений.',
                },
              ),
            ],
          },
          {
            code: 'subtopic.integer-reasoning',
            name: 'Целочисленные рассуждения',
            description: 'Стратегии доказательных задач №19.',
            defaults: defaults({
              difficulty: 5,
              importance: 3,
              estimatedMinutes: 150,
              examNumbers: [19],
              taskTypes: ['NUMBER_THEORY'],
              verificationMethods: [
                'PROOF',
                'MULTI_STEP_SOLUTION',
                'ORAL_EXPLANATION',
              ],
              sourceCoverage: 'PARTIAL',
            }),
            skills: [
              skill(
                'reasoning.integer-equations',
                'Решать уравнения в целых числах',
                'Использовать делимость, разложение на множители, ограничения и конечный перебор.',
                {
                  required: [
                    'number.divisibility-tests',
                    'algebra.factorization',
                    'reasoning.case-analysis',
                  ],
                },
              ),
              skill(
                'reasoning.integer-bounds',
                'Получать целочисленные оценки',
                'Ограничивать возможные значения через неравенства, среднее и целую часть.',
                {
                  required: [
                    'number.estimate-check',
                    'inequality.linear',
                    'reasoning.proof-structure',
                  ],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'reasoning.modular-proof',
                'Доказывать утверждения с помощью остатков',
                'Выбирать модуль, строить классы остатков и получать противоречие или ограничение.',
                {
                  required: ['number.remainders', 'reasoning.proof-structure'],
                  sourceCoverage: 'DIRECT',
                },
              ),
              skill(
                'reasoning.extremal-invariant',
                'Использовать крайний элемент и инвариант',
                'Выбирать минимальный или максимальный объект либо сохраняемую величину для доказательства.',
                {
                  required: [
                    'reasoning.integer-bounds',
                    'reasoning.case-analysis',
                  ],
                  sourceCoverage: 'MISSING',
                  needsExpertReview: true,
                  expertReviewNote:
                    'Проверить востребованность стратегии на актуальном наборе задач №19.',
                },
              ),
            ],
          },
        ],
      },
    ],
  },
];

const materials: KnowledgeMapSeed['materials'] = [
  {
    fileName: 'Teoria_k_zadaniam_1_6_7_9_10_12_13_15_17_18.pdf',
    title:
      'Сводные справочные материалы к заданиям 1, 6, 7, 9, 10, 12, 13, 15, 17 и 18',
    pageCount: 7,
    segments: [
      {
        pages: [1],
        title: 'Тригонометрия, логарифмы и производные',
        skillCodes: [
          'trig.unit-circle',
          'trig.tangent-cotangent',
          'trig.basic-identities',
          'trig.reduction-formulas',
          'trig.sum-difference',
          'trig.double-half-angle',
          'algebra.log-definition',
          'algebra.log-properties',
          'calculus.derivative-rules',
        ],
      },
      {
        pages: [2],
        title: 'Степени, корни, тождества, уравнения и прогрессии',
        skillCodes: [
          'algebra.integer-powers',
          'algebra.rational-powers',
          'algebra.root-transformations',
          'algebra.identities',
          'algebra.factorization',
          'algebra.absolute-value',
          'equation.quadratic-discriminant',
          'equation.quadratic-vieta',
          'applied.progression-model',
        ],
      },
      {
        pages: [3],
        title: 'Углы, треугольник и площадь',
        skillCodes: [
          'geometry.angles-parallel',
          'geometry.triangle-angle-sum',
          'geometry.triangle-area',
          'geometry.right-triangle-ratios',
        ],
      },
      {
        pages: [4],
        title: 'Замечательные линии, равенство и подобие',
        skillCodes: [
          'geometry.triangle-congruence',
          'geometry.triangle-similarity',
          'geometry.similarity-area',
          'geometry.medians',
          'geometry.angle-bisector',
          'geometry.altitudes',
          'geometry.perpendicular-bisectors',
        ],
      },
      {
        pages: [5],
        title:
          'Прямоугольные и равнобедренные треугольники, параллелограмм и ромб',
        skillCodes: [
          'geometry.pythagorean',
          'geometry.right-triangle-ratios',
          'geometry.parallelogram',
          'geometry.rectangle-rhombus-square',
        ],
      },
      {
        pages: [6],
        title: 'Трапеции, многоугольники и специальные теоремы',
        skillCodes: [
          'geometry.trapezoid',
          'geometry.arbitrary-quadrilateral',
          'geometry.polygon-angles',
          'geometry.regular-polygons',
          'geometry.ceva-menelaus',
          'geometry.ptolemy',
        ],
      },
      {
        pages: [7],
        title: 'Окружность, хорды, секущие и касательные',
        skillCodes: [
          'geometry.circle-metrics',
          'geometry.circle-angles',
          'geometry.chords-secants',
          'geometry.tangents',
          'geometry.cyclic-quadrilateral',
          'geometry.circumscribed-quadrilateral',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniam_4_i_5.pdf',
    title: 'Справочные материалы к заданиям 4 и 5',
    pageCount: 1,
    segments: [
      {
        pages: [1],
        title: 'Классическая вероятность и отношения событий',
        skillCodes: [
          'probability.sample-space',
          'probability.classical',
          'probability.complement',
          'probability.union',
          'probability.independence',
        ],
        notes:
          'Условная вероятность, дерево событий и схема Бернулли в памятке отсутствуют.',
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_1.pdf',
    title: 'Справочные материалы к заданию 1',
    pageCount: 3,
    segments: [
      {
        pages: [1],
        title: 'Углы и треугольники',
        skillCodes: [
          'geometry.angles-parallel',
          'geometry.triangle-angle-sum',
          'geometry.pythagorean',
          'geometry.right-triangle-ratios',
          'geometry.triangle-area',
          'geometry.triangle-congruence',
          'geometry.triangle-similarity',
        ],
      },
      {
        pages: [2],
        title: 'Специальные треугольники и четырёхугольники',
        skillCodes: [
          'geometry.medians',
          'geometry.angle-bisector',
          'geometry.altitudes',
          'geometry.parallelogram',
          'geometry.rectangle-rhombus-square',
          'geometry.trapezoid',
        ],
      },
      {
        pages: [3],
        title: 'Многоугольники, тригонометрия и окружность',
        skillCodes: [
          'geometry.regular-polygons',
          'geometry.circle-metrics',
          'geometry.circle-angles',
          'geometry.tangents',
          'geometry.cyclic-quadrilateral',
          'trig.basic-identities',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_2.pdf',
    title: 'Справочные материалы к заданию 2',
    pageCount: 1,
    segments: [
      {
        pages: [1],
        title: 'Координаты, длина, операции и скалярное произведение',
        skillCodes: [
          'vector.coordinates',
          'vector.operations',
          'vector.dot-product',
          'vector.angle-orthogonality',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_3.pdf',
    title: 'Справочные материалы к заданию 3',
    pageCount: 4,
    segments: [
      {
        pages: [1],
        title: 'Куб, параллелепипед, призма, цилиндр и конус',
        skillCodes: [
          'stereometry.prisms-parallelepipeds',
          'stereometry.cylinder-cone',
        ],
      },
      {
        pages: [2],
        title: 'Пирамида, шар и алгебраико-геометрические основы',
        skillCodes: [
          'stereometry.pyramids',
          'stereometry.sphere',
          'algebra.identities',
          'trig.basic-identities',
        ],
      },
      {
        pages: [3],
        title: 'Подобие и основные плоские фигуры',
        skillCodes: [
          'geometry.triangle-similarity',
          'geometry.pythagorean',
          'geometry.parallelogram',
          'geometry.rectangle-rhombus-square',
        ],
      },
      {
        pages: [4],
        title: 'Многоугольники, окружность и пространственные отношения',
        skillCodes: [
          'geometry.regular-polygons',
          'geometry.circle-metrics',
          'stereometry.line-plane-relations',
          'stereometry.perpendicular-projection',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_6.pdf',
    title: 'Справочные материалы к заданию 6',
    pageCount: 1,
    segments: [
      {
        pages: [1],
        title: 'Квадратные уравнения, тождества, степени и логарифмы',
        skillCodes: [
          'equation.quadratic-discriminant',
          'equation.quadratic-vieta',
          'algebra.identities',
          'algebra.integer-powers',
          'algebra.log-definition',
          'algebra.log-properties',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_7.pdf',
    title: 'Справочные материалы к заданию 7',
    pageCount: 2,
    segments: [
      {
        pages: [1],
        title: 'Тригонометрия, логарифмы, степени и корни',
        skillCodes: [
          'trig.unit-circle',
          'trig.basic-identities',
          'trig.reduction-formulas',
          'algebra.log-properties',
          'algebra.integer-powers',
          'algebra.root-transformations',
        ],
      },
      {
        pages: [2],
        title: 'Тождества и модуль',
        skillCodes: ['algebra.identities', 'algebra.absolute-value'],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_8.pdf',
    title: 'Справочные материалы к заданию 8',
    pageCount: 1,
    segments: [
      {
        pages: [1],
        title: 'График функции, график производной и касательная',
        skillCodes: [
          'calculus.derivative-meaning',
          'calculus.function-derivative-graph',
          'calculus.derivative-rules',
          'calculus.tangent-equation',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_9.pdf',
    title: 'Справочные материалы к заданию 9',
    pageCount: 1,
    segments: [
      {
        pages: [1],
        title: 'Квадратные уравнения, факторизация и метод интервалов',
        skillCodes: [
          'equation.quadratic-discriminant',
          'equation.quadratic-vieta',
          'algebra.identities',
          'algebra.factorization',
          'inequality.interval-method',
          'inequality.rational',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_10.pdf',
    title: 'Справочные материалы к заданию 10',
    pageCount: 1,
    segments: [
      {
        pages: [1],
        title: 'Движение, смеси, прогрессии и вычислительные приёмы',
        skillCodes: [
          'applied.straight-motion',
          'applied.mixtures',
          'applied.progression-model',
          'equation.quadratic-discriminant',
          'number.estimate-check',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_11.pdf',
    title: 'Справочные материалы к заданию 11',
    pageCount: 4,
    segments: [
      {
        pages: [1],
        title: 'Прямая, парабола и гипербола',
        skillCodes: [
          'function.linear',
          'function.quadratic',
          'function.reciprocal',
          'function.graph-transformations',
        ],
      },
      {
        pages: [2],
        title: 'Функция корня и показательная функция',
        skillCodes: [
          'function.power-root',
          'function.exponential',
          'function.graph-transformations',
        ],
      },
      {
        pages: [3],
        title: 'Логарифмическая функция и синус',
        skillCodes: [
          'function.logarithmic',
          'function.trigonometric',
          'function.graph-transformations',
        ],
      },
      {
        pages: [4],
        title: 'Косинус и тангенс',
        skillCodes: [
          'function.trigonometric',
          'function.graph-transformations',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_12.pdf',
    title: 'Справочные материалы к заданию 12',
    pageCount: 1,
    segments: [
      {
        pages: [1],
        title: 'Таблица производных',
        skillCodes: ['calculus.derivative-rules'],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_13.pdf',
    title: 'Справочные материалы к заданию 13',
    pageCount: 2,
    segments: [
      {
        pages: [1],
        title: 'Тригонометрия, логарифмы, корни и степени',
        skillCodes: [
          'trig.unit-circle',
          'trig.basic-identities',
          'trig.reduction-formulas',
          'algebra.log-properties',
          'algebra.root-transformations',
          'algebra.integer-powers',
        ],
      },
      {
        pages: [2],
        title: 'Формулы сокращённого умножения',
        skillCodes: ['algebra.identities', 'algebra.factorization'],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_14.pdf',
    title: 'Справочные материалы к заданию 14',
    pageCount: 1,
    segments: [
      {
        pages: [1],
        title: 'Пространственные отношения, сечения, углы и расстояния',
        skillCodes: [
          'stereometry.line-plane-relations',
          'stereometry.perpendicular-projection',
          'stereometry.sections',
          'stereometry.angle-between-lines',
          'stereometry.angle-line-plane',
          'stereometry.angle-between-planes',
          'stereometry.point-plane-distance',
          'stereometry.skew-lines-distance',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_15.pdf',
    title: 'Справочные материалы к заданию 15',
    pageCount: 1,
    segments: [
      {
        pages: [1],
        title: 'Логарифмы, степени, корни, факторизация и модуль',
        skillCodes: [
          'algebra.log-definition',
          'algebra.log-properties',
          'algebra.integer-powers',
          'algebra.root-transformations',
          'algebra.identities',
          'algebra.factorization',
          'algebra.absolute-value',
          'equation.quadratic-discriminant',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_16.pdf',
    title: 'Справочные материалы к заданию 16',
    pageCount: 1,
    segments: [
      {
        pages: [1],
        title: 'Проценты и оценка результата',
        skillCodes: [
          'number.percent-of-value',
          'number.percent-change',
          'number.estimate-check',
        ],
        notes: 'Финансовые схемы кредитов и вкладов в материале не раскрыты.',
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_17.pdf',
    title: 'Справочные материалы к заданию 17',
    pageCount: 5,
    segments: [
      {
        pages: [1],
        title: 'Углы, треугольник, площади, равенство и подобие',
        skillCodes: [
          'geometry.angles-parallel',
          'geometry.triangle-angle-sum',
          'geometry.triangle-area',
          'geometry.triangle-congruence',
          'geometry.triangle-similarity',
          'geometry.similarity-area',
        ],
      },
      {
        pages: [2],
        title: 'Замечательные линии и прямоугольный треугольник',
        skillCodes: [
          'geometry.medians',
          'geometry.angle-bisector',
          'geometry.altitudes',
          'geometry.perpendicular-bisectors',
          'geometry.pythagorean',
          'geometry.right-triangle-ratios',
        ],
      },
      {
        pages: [3],
        title: 'Специальные треугольники и четырёхугольники',
        skillCodes: [
          'geometry.parallelogram',
          'geometry.rectangle-rhombus-square',
          'geometry.trapezoid',
        ],
      },
      {
        pages: [4],
        title: 'Многоугольники и тригонометрия',
        skillCodes: [
          'geometry.arbitrary-quadrilateral',
          'geometry.polygon-angles',
          'geometry.regular-polygons',
          'geometry.right-triangle-ratios',
        ],
      },
      {
        pages: [5],
        title: 'Окружность и связанные конфигурации',
        skillCodes: [
          'geometry.circle-metrics',
          'geometry.circle-angles',
          'geometry.chords-secants',
          'geometry.tangents',
          'geometry.cyclic-quadrilateral',
          'geometry.circumscribed-quadrilateral',
          'geometry.triangle-circles',
        ],
      },
    ],
  },
  {
    fileName: 'Teoria_k_zadaniyu_19.pdf',
    title: 'Справочные материалы к заданию 19',
    pageCount: 5,
    segments: [
      {
        pages: [1],
        title: 'Простые числа, делимость, НОД и НОК',
        skillCodes: [
          'number.prime-factorization',
          'number.divisibility-tests',
          'number.gcd-lcm',
        ],
      },
      {
        pages: [2],
        title: 'Прогрессии, десятичная запись и признаки делимости',
        skillCodes: [
          'applied.progression-model',
          'number.digit-properties',
          'number.divisibility-tests',
        ],
      },
      {
        pages: [3],
        title: 'Числовые неравенства и уравнения в целых числах',
        skillCodes: [
          'inequality.linear',
          'reasoning.integer-equations',
          'reasoning.integer-bounds',
        ],
      },
      {
        pages: [4],
        title: 'Минимальная сумма и целочисленные оценки',
        skillCodes: ['reasoning.integer-bounds', 'number.estimate-check'],
      },
      {
        pages: [5],
        title: 'Остатки и свойства цифр',
        skillCodes: [
          'number.remainders',
          'number.digit-properties',
          'reasoning.modular-proof',
        ],
      },
    ],
  },
];

const coverageGaps: KnowledgeMapSeed['coverageGaps'] = [
  {
    code: 'gap.computational-foundations',
    title: 'Нет системного материала по вычислительному фундаменту',
    description:
      'Дроби, знаки, порядок действий, единицы и оценка ответа используются повсеместно, но почти не объясняются.',
    affectedSkillCodes: [
      'number.types-order',
      'number.signed-operations',
      'number.operation-order',
      'number.fractions',
      'number.units-conversion',
      'number.estimate-check',
    ],
    priority: 'HIGH',
  },
  {
    code: 'gap.trig-equations',
    title: 'Недостаточно материала по решению тригонометрических уравнений',
    description:
      'Есть формулы, но нет общего решения, преобразования уравнений и отбора корней.',
    affectedSkillCodes: [
      'equation.trig-elementary',
      'equation.trig-transform',
      'equation.trig-root-selection',
    ],
    priority: 'HIGH',
  },
  {
    code: 'gap.probability-advanced',
    title: 'Не покрыты комбинаторика и сложные вероятностные схемы',
    description:
      'В памятке отсутствуют полноценный подсчёт исходов, условная вероятность и формула Бернулли.',
    affectedSkillCodes: [
      'probability.counting',
      'probability.conditional-tree',
      'probability.bernoulli',
    ],
    priority: 'HIGH',
  },
  {
    code: 'gap.finance',
    title: 'Нет теории финансовых схем',
    description:
      'Материал №16 ограничен процентами и не объясняет кредиты, вклады и оптимизацию.',
    affectedSkillCodes: [
      'finance.compound-interest',
      'finance.differentiated-loan',
      'finance.annuity-loan',
      'finance.optimization',
    ],
    priority: 'HIGH',
  },
  {
    code: 'gap.parameters',
    title: 'Нет системной теории задач с параметром',
    description:
      'Не раскрыты критические значения, графический метод, разбор случаев и контроль полноты.',
    affectedSkillCodes: [
      'equation.parameter-cases',
      'function.absolute-value-graphs',
      'reasoning.case-analysis',
    ],
    priority: 'HIGH',
  },
  {
    code: 'gap.proof-strategies',
    title: 'Памятки не обучают структуре доказательства',
    description:
      'Формулы не заменяют навыки построения доказательства, контрпримера и дополнительного построения.',
    affectedSkillCodes: [
      'reasoning.proof-structure',
      'reasoning.necessary-sufficient',
      'reasoning.construction',
      'geometry.composite-configuration',
    ],
    priority: 'HIGH',
  },
  {
    code: 'gap.calculus',
    title: 'Неполное покрытие математического анализа',
    description:
      'Есть таблица производных и графические подсказки, но мало теории оптимизации, первообразной и интеграла.',
    affectedSkillCodes: [
      'calculus.monotonicity-extrema',
      'calculus.max-min-segment',
      'calculus.antiderivative-integral',
    ],
    priority: 'MEDIUM',
  },
  {
    code: 'gap.coordinate-stereometry',
    title: 'Нет координатно-векторного метода стереометрии',
    description:
      'Памятка №14 описывает синтетические построения, но не координаты, нормали и векторные формулы.',
    affectedSkillCodes: ['stereometry.coordinate-vector-method'],
    priority: 'MEDIUM',
  },
  {
    code: 'gap.statistics',
    title: 'Статистическая часть почти отсутствует',
    description:
      'Нет материалов по частотам и статистическим представлениям, хотя они входят в общий раздел ФИПИ.',
    affectedSkillCodes: ['probability.frequency-data'],
    priority: 'LOW',
  },
];

const expertReviewItems: KnowledgeMapSeed['expertReviewItems'] = [
  {
    code: 'review.metadata-calibration',
    title: 'Калибровка сложности, важности и времени',
    description:
      'Начальные значения являются экспертной оценкой и должны быть сверены с преподавателями и реальными данными обучения.',
    affectedSkillCodes: [
      'number.fractions',
      'equation.trig-root-selection',
      'calculus.monotonicity-extrema',
      'geometry.composite-configuration',
      'stereometry.coordinate-vector-method',
      'reasoning.extremal-invariant',
    ],
  },
  {
    code: 'review.parameter-dependencies',
    title: 'Методы задач с параметром',
    description:
      'Нужно проверить, достаточно ли одного верхнеуровневого навыка или требуется отдельная ветка аналитического и графического методов.',
    affectedSkillCodes: [
      'equation.parameter-cases',
      'function.absolute-value-graphs',
      'function.inverse',
    ],
  },
  {
    code: 'review.advanced-geometry',
    title: 'Гранулярность сложной геометрии',
    description:
      'Следует проверить отдельные классы дополнительных построений и доказательств для №14 и №17.',
    affectedSkillCodes: [
      'geometry.composite-configuration',
      'reasoning.construction',
      'stereometry.sections',
      'stereometry.coordinate-vector-method',
    ],
  },
  {
    code: 'review.finance-scope',
    title: 'Актуальные финансовые схемы',
    description:
      'Нужно подтвердить востребованность аннуитетной модели и набор типовых схем №16 в текущем банке.',
    affectedSkillCodes: [
      'finance.differentiated-loan',
      'finance.annuity-loan',
      'finance.optimization',
    ],
  },
  {
    code: 'review.statistics-integral',
    title: 'Глубина статистики и интеграла',
    description:
      'Элементы присутствуют в официальном содержании, но их фактический вес в текущем варианте требует проверки.',
    affectedSkillCodes: [
      'probability.frequency-data',
      'calculus.antiderivative-integral',
    ],
  },
  {
    code: 'review.material-rights',
    title: 'Права и формат хранения материалов',
    description:
      'До загрузки самих PDF в продукт необходимо подтвердить право использования; сейчас сохраняются только метаданные и постраничные связи.',
    affectedSkillCodes: [
      'algebra.identities',
      'geometry.circle-angles',
      'stereometry.angle-line-plane',
    ],
  },
];

export const profileMathKnowledgeMap: KnowledgeMapSeed = {
  subjectCode: 'profile-math-ege',
  version: 2,
  title: 'Полная карта знаний по профильной математике ЕГЭ',
  description:
    'Иерархическая карта проверяемых навыков с обязательными и рекомендуемыми зависимостями.',
  sourceSummary:
    '18 пользовательских PDF проверены постранично; полнота сверена с навигатором самостоятельной подготовки ФИПИ ЕГЭ-2026.',
  sections,
  materials,
  coverageGaps,
  expertReviewItems,
  externalReferences: [
    {
      title: 'Демоверсии, спецификации и кодификаторы ЕГЭ-2026',
      url: 'https://fipi.ru/ege/demoversii-specifikacii-kodifikatory',
      purpose: 'Контроль актуальной структуры и содержания экзамена.',
    },
    {
      title: 'ФИПИ: алгебраические выражения',
      url: 'https://doc.fipi.ru/navigator-podgotovki/navigator-ege/2026/Mat_prof_1.pdf',
      purpose: 'Контроль содержания алгебраических преобразований.',
    },
    {
      title: 'ФИПИ: текстовые задачи',
      url: 'https://doc.fipi.ru/navigator-podgotovki/navigator-ege/2026/Mat_prof_2_tekst.pdf',
      purpose: 'Контроль навыков задач №9, №10 и №16.',
    },
    {
      title: 'ФИПИ: уравнения',
      url: 'https://doc.fipi.ru/navigator-podgotovki/navigator-ege/2026/Mat_prof_3%20uravnenia.pdf',
      purpose: 'Контроль типов уравнений и способов решения.',
    },
    {
      title: 'ФИПИ: неравенства',
      url: 'https://doc.fipi.ru/navigator-podgotovki/navigator-ege/2026/Mat_prof_4_neravenstva.pdf',
      purpose: 'Контроль типов неравенств и систем.',
    },
    {
      title: 'ФИПИ: функции и производные',
      url: 'https://doc.fipi.ru/navigator-podgotovki/navigator-ege/2026/Mat_prof_5_funkcii.pdf',
      purpose: 'Контроль навыков задач №8, №11, №12, №16 и №18.',
    },
    {
      title: 'ФИПИ: вероятность и комбинаторика',
      url: 'https://doc.fipi.ru/navigator-podgotovki/navigator-ege/2026/Mat_prof_6_veroyatnost.pdf',
      purpose: 'Контроль навыков задач №4 и №5.',
    },
  ],
};
