Отлично. Тогда я сделаю **формальную спецификацию контента + подробное ТЗ для Codex** на MVP.

Опора на реальный экзамен остаётся той же: 16 задач с этой структурой и этими типами навыков.

---

# 1. Что именно должен сделать Codex

Нужно сделать веб-приложение для подготовки к чешскому вступительному экзамену по математике, где основной режим — это **интерактивный tutorial по структуре реального экзамена**, а второй режим — **работа над ошибками**.

## Главные принципы

- не курс по темам
- не генератор задач
- не длинный учебник
- а **пошаговый интерактивный разбор экзаменоподобных задач**
- с минимальным количеством текста
- с локальным переводом с чешского на украинский
- с сохранением статистики ошибок

---

# 2. MVP-объём

## В первой версии:

- 2 tutorial-варианта экзамена
- в каждом по 16 задач
- задачи идут в порядке реального экзамена
- каждая задача разбита на шаги
- на каждом шаге 4 варианта ответа
- есть мгновенный фидбек
- есть подсказки
- есть статистика
- есть режим mistake review

## Не нужно в MVP:

- авторизация
- база данных
- генерация заданий AI
- сложный профиль пользователя
- многопользовательский режим
- глобальные настройки языка
- редактор контента в UI

---

# 3. Языковая модель

Это надо зафиксировать очень чётко.

## 3.1. Язык по умолчанию

**Экзаменационный слой — на чешском.**

Сюда входят:

- формулировка задания
- текст условия
- подпункты
- варианты ответа
- вопросы tutorial-шагов

## 3.2. Обучающий слой

**Объяснения, подсказки и мотивация — на украинском.**

Сюда входят:

- короткое объяснение, что это за тип задачи
- зачем это нужно
- подсказки
- объяснение правильного/неправильного варианта
- вывод “что запомнить”
- отчёт по ошибкам

## 3.3. Перевод

Перевод не должен быть глобальным режимом. Он должен открываться **локально**.

Нужно поддержать:

- перевод отдельной фразы условия
- перевод отдельного варианта ответа
- перевод задания целиком

## 3.4. UX-поведение перевода

По умолчанию ученик видит:

- чешский текст

Возле каждой переводимой единицы есть кнопка:

- `Перекласти`

После нажатия раскрывается украинский перевод только для этого фрагмента.

Для задания целиком:

- кнопка `Показати переклад завдання`

---

# 4. Основные режимы приложения

## 4.1. Режим 1 — Exam Tutorial

Главный режим.

Ученик:

- выбирает `Tutorial A` или `Tutorial B`
- проходит 16 задач подряд
- в каждой задаче идёт пошагово
- в конце получает summary по слабым местам

## 4.2. Режим 2 — Mistake Review

Открывается после прохождения хотя бы одного tutorial.

Система:

- анализирует, где ученик чаще ошибался
- группирует ошибки по навыкам и error tags
- выдаёт подборку похожих микро-задач именно по слабым местам

---

# 5. Структура контента

Контент должен быть не захардкожен в компонентах, а храниться декларативно.

Лучше всего:

- `JSON` или `YAML`

Я бы рекомендовал `JSON`, потому что Codex проще будет валидировать схемой.

---

# 6. Формальная структура tutorial-варианта

## 6.1. Экзамен

Каждый tutorial-вариант — это объект:

```json
{
  "id": "tutorial-a",
  "title": "Tutorial A",
  "localeBase": "cs",
  "supportLocale": "uk",
  "tasks": ["task-01", "task-02", "task-03"]
}
```

## 6.2. Задача

Каждая задача должна иметь такую структуру:

```json
{
  "id": "task-05-a",
  "taskNumber": 5,
  "variantId": "tutorial-a",
  "titleCs": "Pozemek, dům a rybníček",
  "titleUk": "Ділянка, будинок і ставок",
  "examStyleGroup": "word_problem_geometry_percent",
  "difficulty": 2,
  "skills": [
    "area_square_rectangle",
    "percent_of_total_area",
    "multi_step_word_problem"
  ],
  "errorTags": [
    "wrong_base_area",
    "misread_fraction_relation",
    "forgets_subtract_both_parts"
  ],
  "intro": {
    "typeLabelUk": "Це задача на площу і відсотки.",
    "whyUk": "Такі задачі потрібні, коли треба порахувати, яку частину території займають різні об’єкти.",
    "tipUk": "Спочатку знайди всю площу, потім окремі частини."
  },
  "prompt": {
    "segments": [
      {
        "id": "s1",
        "cs": "Pozemek má tvar čtverce se stranou 30 m.",
        "uk": "Ділянка має форму квадрата зі стороною 30 м."
      },
      {
        "id": "s2",
        "cs": "Dům má pětkrát menší obsah než celý pozemek.",
        "uk": "Площа будинку у 5 разів менша за площу всієї ділянки."
      }
    ]
  },
  "steps": ["task-05-a-step-01", "task-05-a-step-02"],
  "finalSummaryUk": "У таких задачах майже завжди треба починати з усього цілого."
}
```

---

# 7. Формальная структура шага

Каждый шаг — отдельный объект.

```json
{
  "id": "task-05-a-step-01",
  "taskId": "task-05-a",
  "stepIndex": 1,
  "type": "multiple_choice",
  "prompt": {
    "cs": "Co určíme nejdřív?",
    "uk": "Що знайдемо спочатку?"
  },
  "options": [
    {
      "id": "a",
      "cs": "Obsah celého pozemku",
      "uk": "Площу всієї ділянки",
      "isCorrect": true,
      "errorTag": null,
      "feedbackUk": "Так, спочатку треба знайти площу всього квадрата."
    },
    {
      "id": "b",
      "cs": "Šířku domu",
      "uk": "Ширину будинку",
      "isCorrect": false,
      "errorTag": "premature_unknown_search",
      "feedbackUk": "Ще рано шукати ширину будинку, бо спочатку потрібна його площа."
    },
    {
      "id": "c",
      "cs": "Obsah rybníčku",
      "uk": "Площу ставка",
      "isCorrect": false,
      "errorTag": "wrong_target_first",
      "feedbackUk": "Ставок теж знадобиться, але не на цьому кроці."
    },
    {
      "id": "d",
      "cs": "Obvod pozemku",
      "uk": "Периметр ділянки",
      "isCorrect": false,
      "errorTag": "perimeter_area_confusion",
      "feedbackUk": "Тут потрібна площа, а не периметр."
    }
  ],
  "hintLevels": [
    {
      "level": 1,
      "uk": "Подумай, що є 'цілим' у цій задачі."
    },
    {
      "level": 2,
      "uk": "Спочатку знайди площу квадрата."
    },
    {
      "level": 3,
      "uk": "Площа квадрата зі стороною 30 м дорівнює 30 × 30."
    }
  ],
  "successCriteria": {
    "maxRecommendedAttempts": 2
  }
}
```

---

# 8. Структура mistake-review задач

Это уже не экзамен целиком, а короткие задачи по навыкам.

```json
{
  "id": "review-percent-03",
  "reviewSkill": "percent_of_total_area",
  "difficulty": 1,
  "sourceRelatedTaskNumbers": [5, 13, 15],
  "prompt": {
    "cs": "Jezírko zabírá 20 % zahrady o obsahu 300 m². Jaký má obsah?",
    "uk": "Ставок займає 20 % саду площею 300 м². Яка його площа?"
  },
  "steps": ["review-percent-03-step-01", "review-percent-03-step-02"]
}
```

---

# 9. Набор skill tags

Нужно сразу стандартизировать теги навыков.

```text
arithmetic_basic
ratio_language
fractions_basic_operations
fractions_common_denominator
signed_number_multiplication
order_of_operations
compound_expression_order_of_operations
square_of_sum_pattern
expand_brackets
combine_like_terms
factorization_by_formula
linear_equation_with_fractions
linear_equation_with_decimals
equation_term_transfer
area_square_rectangle
fraction_of_whole
percent_of_total_area
multi_step_word_problem
volume_from_base_area_and_height
unit_conversion_mm_cm
unit_conversion_cm3_liters
reverse_formula_usage
angles_with_parallel_and_perpendicular_lines
perimeter_from_equal_spacing
fraction_shorter_than
counting_points_on_perimeter
cyclic_pattern_logic
construction_angle_bisector
rectangle_construction_under_constraints
construction_triangle_from_altitude_and_median
cuboid_edges_sum
surface_area_of_composite_solids
internal_faces_after_joining
volume_partitioning
average_height_on_linear_slope
word_problem_equal_bases_with_percent_excess
average_grade_equation
percent_from_count
team_composition_logic
relative_increase_decrease
pattern_generalization_from_diagram
frame_of_rectangles_counting
relating_inner_outer_side_lengths
```

---

# 10. Набор error tags

Нужно стандартизировать и типы ошибок. Это критично для mistake review.

Примеры:

```text
misreads_ratio_language
confuses_more_by_vs_more_times
wrong_order_of_operations
loses_negative_sign
wrong_common_denominator
does_not_reduce_fraction
root_square_confusion
formula_not_recognized
wrong_bracket_expansion_sign
fails_to_combine_like_terms
transfers_equation_terms_wrongly
fraction_coefficient_fear
decimal_coefficient_confusion
wrong_base_area
forgets_subtract_both_parts
wrong_percent_base
unit_conversion_missing
wrong_volume_formula_direction
guesses_from_diagram
parallel_perpendicular_confusion
point_interval_cycle_confusion
misreads_shorter_by_fraction
construction_property_confusion
surface_area_hidden_faces_ignored
uses_wrong_average_model
wrong_percent_reference_group
relative_change_confusion
pattern_not_generalized
inner_outer_side_confusion
```

---

# 11. Карта задач 1–16 в машинно-понятном виде

Ниже — то, что Codex должен получить как контентную схему.

## 11.1. Tutorial skeleton

```json
[
  {
    "taskNumber": 1,
    "titleUk": "Відношення після обчислень",
    "skills": ["arithmetic_basic", "ratio_language"],
    "difficulty": 1,
    "stepCountRange": [3, 5]
  },
  {
    "taskNumber": 2,
    "titleUk": "Дроби і складені вирази",
    "skills": [
      "fractions_basic_operations",
      "fractions_common_denominator",
      "compound_expression_order_of_operations"
    ],
    "difficulty": 3,
    "stepCountRange": [5, 9]
  },
  {
    "taskNumber": 3,
    "titleUk": "Формули і спрощення виразів",
    "skills": [
      "square_of_sum_pattern",
      "expand_brackets",
      "combine_like_terms",
      "factorization_by_formula"
    ],
    "difficulty": 3,
    "stepCountRange": [5, 9]
  },
  {
    "taskNumber": 4,
    "titleUk": "Лінійні рівняння",
    "skills": [
      "linear_equation_with_fractions",
      "linear_equation_with_decimals",
      "equation_term_transfer"
    ],
    "difficulty": 3,
    "stepCountRange": [5, 10]
  },
  {
    "taskNumber": 5,
    "titleUk": "Площа ділянки, будинку і ставка",
    "skills": [
      "area_square_rectangle",
      "percent_of_total_area",
      "multi_step_word_problem"
    ],
    "difficulty": 2,
    "stepCountRange": [4, 8]
  },
  {
    "taskNumber": 6,
    "titleUk": "Об’єм циліндра і переведення одиниць",
    "skills": [
      "volume_from_base_area_and_height",
      "unit_conversion_mm_cm",
      "unit_conversion_cm3_liters",
      "reverse_formula_usage"
    ],
    "difficulty": 2,
    "stepCountRange": [4, 8]
  },
  {
    "taskNumber": 7,
    "titleUk": "Кути, паралельні та перпендикулярні прямі",
    "skills": ["angles_with_parallel_and_perpendicular_lines"],
    "difficulty": 2,
    "stepCountRange": [4, 7]
  },
  {
    "taskNumber": 8,
    "titleUk": "Периметр, точки по контуру і закономірність",
    "skills": [
      "perimeter_from_equal_spacing",
      "fraction_shorter_than",
      "counting_points_on_perimeter",
      "cyclic_pattern_logic"
    ],
    "difficulty": 4,
    "stepCountRange": [6, 10]
  },
  {
    "taskNumber": 9,
    "titleUk": "Побудова бісектриси і прямокутника",
    "skills": [
      "construction_angle_bisector",
      "rectangle_construction_under_constraints"
    ],
    "difficulty": 4,
    "stepCountRange": [4, 8]
  },
  {
    "taskNumber": 10,
    "titleUk": "Побудова трикутника за висотою і медіаною",
    "skills": ["construction_triangle_from_altitude_and_median"],
    "difficulty": 4,
    "stepCountRange": [4, 8]
  },
  {
    "taskNumber": 11,
    "titleUk": "Поверхня складених тіл",
    "skills": [
      "cuboid_edges_sum",
      "surface_area_of_composite_solids",
      "internal_faces_after_joining"
    ],
    "difficulty": 4,
    "stepCountRange": [4, 8]
  },
  {
    "taskNumber": 12,
    "titleUk": "Об’єм басейну",
    "skills": ["volume_partitioning", "average_height_on_linear_slope"],
    "difficulty": 3,
    "stepCountRange": [4, 7]
  },
  {
    "taskNumber": 13,
    "titleUk": "Текстова задача на відсоткове перевищення",
    "skills": ["word_problem_equal_bases_with_percent_excess"],
    "difficulty": 3,
    "stepCountRange": [5, 8]
  },
  {
    "taskNumber": 14,
    "titleUk": "Середній бал і рівняння",
    "skills": ["average_grade_equation"],
    "difficulty": 3,
    "stepCountRange": [5, 8]
  },
  {
    "taskNumber": 15,
    "titleUk": "Короткі задачі на відсотки",
    "skills": [
      "percent_from_count",
      "team_composition_logic",
      "relative_increase_decrease"
    ],
    "difficulty": 3,
    "stepCountRange": [6, 10]
  },
  {
    "taskNumber": 16,
    "titleUk": "Закономірності у квадратних рамках",
    "skills": [
      "pattern_generalization_from_diagram",
      "frame_of_rectangles_counting",
      "relating_inner_outer_side_lengths"
    ],
    "difficulty": 5,
    "stepCountRange": [6, 10]
  }
]
```

---

# 12. UX-структура экранов

## 12.1. Главная

Две большие кнопки:

- `Пройти tutorial`
- `Робота над помилками`

Показывать:

- общий прогресс
- сколько задач пройдено
- последние слабые места

## 12.2. Выбор tutorial

- Tutorial A
- Tutorial B

Показывать:

- сколько задач завершено
- можно ли продолжить с места остановки

## 12.3. Экран задачи

Блоки:

1. номер задачи
2. короткое украинское объяснение
3. чешское условие
4. локальные кнопки перевода
5. кнопка “почати розбір”

## 12.4. Экран шага

Показывать:

- вопрос по-чешски
- 4 варианта
- после выбора — украинский фидбек
- кнопки:
  - `Підказка`
  - `Перекласти`
  - `Далі`

## 12.5. Экран финала задачи

- итог
- краткое “что запомнить”
- отмеченные ошибки
- кнопка следующей задачи

## 12.6. Экран summary после tutorial

Показывать:

- сколько задач пройдено
- где больше всего ошибок
- где брались подсказки
- какие 3–5 навыков самые слабые
- кнопка `Почати роботу над помилками`

## 12.7. Экран mistake review

- карточки слабых зон
- каждая карточка — короткая тренировка
- после завершения — новый прогресс

---

# 13. Логика прогресса

Нужно хранить прогресс даже без логина. Для MVP достаточно одного локального пользователя.

Можно:

- локально в браузере
- плюс синхронизация в Durable Object

Я бы сделал так:

- клиент пишет действия в Durable Object
- локально держит кэш
- при перезагрузке восстанавливает состояние

## Что хранить по каждому шагу

- taskId
- stepId
- selectedOptionId
- isCorrect
- attemptNumber
- hintLevelUsed
- timeSpentMs
- translatedSegmentsUsed
- completedAt

## Что хранить агрегированно

- tutorial completion %
- mistakes by skill
- mistakes by errorTag
- hints by skill
- average attempts by skill
- completion timestamps

---

# 14. Схема Durable Object

Упрощённо:

```ts
type UserProgress = {
  userId: string;
  tutorials: Record<string, TutorialProgress>;
  review: ReviewProgress;
  stats: AggregatedStats;
};

type TutorialProgress = {
  variantId: string;
  startedAt?: string;
  completedAt?: string;
  currentTaskNumber: number;
  tasks: Record<string, TaskProgress>;
};

type TaskProgress = {
  taskId: string;
  completed: boolean;
  startedAt?: string;
  completedAt?: string;
  steps: Record<string, StepAttempt[]>;
};

type StepAttempt = {
  stepId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  attemptNumber: number;
  hintLevelUsed: number;
  translatedSegmentIds: string[];
  timeSpentMs: number;
  at: string;
};

type AggregatedStats = {
  mistakesBySkill: Record<string, number>;
  mistakesByErrorTag: Record<string, number>;
  hintsBySkill: Record<string, number>;
  attemptsBySkill: Record<string, number>;
  completedTasks: string[];
};
```

---

# 15. Правила mistake review

Mistake review не должен быть случайным.

## Алгоритм отбора:

1. взять навыки, где:
   - больше всего ошибок
   - или больше всего подсказок
   - или больше всего повторных попыток

2. взять error tags внутри этих навыков

3. подобрать review-задачи:
   - сначала лёгкие
   - потом такие же по типу, как в tutorial
   - потом 1–2 смешанных

## Ограничения:

- одна review-сессия должна быть короткой
- 5–8 задач максимум
- можно завершить за 5–10 минут

---

# 16. Правила построения шагов

Codex должен соблюдать эти правила:

## Каждый шаг:

- один когнитивный выбор
- не требовать длинного вычисления в голове
- вести к следующему шагу
- быть понятным без большого текста

## Варианты ответа:

- 1 правильный
- 1 грубая ошибка
- 2 правдоподобные типичные ошибки

## Ошибочные варианты:

должны быть не случайными, а отражать реальные путаницы:

- периметр vs площадь
- “на сколько” vs “во сколько раз”
- не тот базовый процент
- забытый минус
- ранний переход к неизвестной
- путаница стороны/площади/объёма

---

# 17. Требования к контенту tutorial A и B

## Tutorial A

Максимально близок к реальному экзамену 2025 по структуре задач.

## Tutorial B

Сохраняет:

- ту же последовательность типов задач
- тот же уровень сложности
- те же навыки
- те же типы ошибок

Но меняет:

- числа
- конкретные объекты
- формулировки
- рисунки и параметры

---

# 18. Особые типы задач

## Построения (9, 10)

Для них нельзя ограничиться сухим multiple choice без визуального сценария.

Для MVP можно сделать упрощённый tutorial:

- ученик не чертит
- а выбирает правильный следующий шаг построения

То есть это “пошаговое рассуждение о построении”, а не полноценная интерактивная геометрическая доска.

## Диаграммные и пространственные задачи (11, 12, 16)

Нужно отрисовать или встроить простые SVG/иллюстрации, а не только текст.

---

# 19. Рекомендованный стек

То, что ты предложил, тут подходит.

## Я бы рекомендовал:

- `Astro`
- `TypeScript`
- минимальный UI без тяжёлого state framework
- если удобно, можно добавить немного `React` для интерактивных компонентов
- Cloudflare Pages
- Cloudflare Durable Object для прогресса
- контент в `JSON`

## Почему так:

- контентный проект
- немного интерактива
- не нужен тяжёлый backend
- удобно деплоить

---

# 20. Структура проекта

Примерно так:

```text
/src
  /components
    TaskPrompt.astro
    StepCard.astro
    TranslationToggle.astro
    HintPanel.astro
    ProgressBar.astro
    SummaryCard.astro
  /pages
    index.astro
    tutorial/[variant]/[task].astro
    review.astro
    summary/[variant].astro
  /lib
    content.ts
    progress.ts
    review-selection.ts
    translations.ts
    scoring.ts
  /types
    content.ts
    progress.ts
/content
  /tutorials
    tutorial-a.json
    tutorial-b.json
  /tasks
    task-01-a.json
    task-01-b.json
    ...
  /review
    arithmetic-basic.json
    fractions.json
    percentages.json
/public
  /images
    task-07-a.svg
    task-09-a.svg
    task-10-a.svg
    task-11-a.svg
    task-12-a.svg
    task-16-a.svg
/workers
  durable-object.ts
```

---

# 21. Что Codex должен сделать поэтапно

## Phase 1

Скелет приложения:

- роуты
- типы данных
- загрузка контента
- базовый UI

## Phase 2

Tutorial engine:

- экран задачи
- пошаговая механика
- локальный перевод
- подсказки
- переход между задачами

## Phase 3

Persistence:

- Durable Object
- сохранение попыток
- восстановление прогресса

## Phase 4

Analytics + review:

- агрегация ошибок
- выбор review-задач
- экран summary
- экран mistake review

## Phase 5

Polish:

- адаптация под мобильный экран
- красивые SVG
- анимации минимальные
- хорошая читаемость

---

# 22. Ограничения для Codex

Нужно прямо указать:

- не делать длинных теоретических страниц
- не делать глобальный переключатель языка
- не делать всё приложение полностью на украинском
- не усложнять архитектуру
- не использовать AI API
- не строить CMS
- не делать аккаунты
- не делать сложную авторизацию
- не превращать продукт в обычный банк тестов без пошагового режима

---

# 23. Готовый текст задания для Codex

Ниже уже можно почти напрямую давать агенту.

---

## Prompt / ТЗ для Codex

Сделай MVP веб-приложения для подготовки ученика к чешскому вступительному экзамену по математике после 9 класса.

### Product goal

Приложение должно быть не курсом по темам, а интерактивным tutorial по структуре реального экзамена. Пользователь проходит экзаменоподобный сценарий из 16 задач в том же порядке, что и в реальном тесте. Каждая задача разбита на небольшие пошаговые вопросы с 4 вариантами ответа. После прохождения tutorial приложение анализирует ошибки и предлагает режим работы над ошибками.

### Main modes

1. Exam Tutorial
2. Mistake Review

### Tutorial requirements

- Сделай 2 tutorial-варианта: Tutorial A и Tutorial B
- В каждом варианте 16 задач
- Порядок задач должен повторять структуру реального экзамена:
  1. базовые вычисления и отношение
  2. дроби и длинные выражения
  3. алгебраические преобразования
  4. линейные уравнения
  5. площадь и проценты
  6. объём цилиндра и переводы единиц
  7. углы и прямые
  8. периметр, точки, закономерность
  9. геометрическое построение
  10. геометрическое построение
  11. составные тела и поверхность
  12. объём составной фигуры
  13. текстовая задача на процентное превышение
  14. среднее значение и уравнение
  15. короткие задачи на проценты
  16. закономерность в фигуре

- Каждая задача должна иметь:
  - короткий украинский intro
  - чешский текст условия
  - локальный перевод фраз на украинский
  - 4–10 tutorial-шагов
  - подсказки
  - финальный краткий вывод на украинском

### Language model

- Весь экзаменационный слой показывать по-чешски:
  - задания
  - шаги
  - варианты ответов

- Весь обучающий слой показывать по-украински:
  - объяснения
  - фидбек
  - подсказки
  - summary

- Перевод не должен быть глобальной настройкой
- Для каждой фразы условия и для каждого варианта ответа должна быть возможность отдельно раскрыть перевод на украинский
- Для всего задания должна быть кнопка “показать перевод задания”

### Step mechanics

- На каждом шаге 4 варианта ответа
- 1 правильный
- 3 неправильных, из них:
  - 1 грубая ошибка
  - 2 правдоподобные типичные ошибки

- После выбора:
  - показать украинский фидбек
  - сохранить результат попытки

- У шага должно быть до 3 уровней подсказки
- Пользователь не должен читать большие блоки текста

### Mistake review

После завершения tutorial:

- проанализировать ошибки по skill tags и error tags
- выбрать 5–8 review-задач по самым слабым местам
- показать короткую тренировку именно по этим слабым местам

### Data model

Сделай весь контент декларативным, в JSON.
Нужны сущности:

- Tutorial
- Task
- Step
- ReviewTask
- Progress
- AggregatedStats

### Skills and error tags

Поддержи skill tags и error tags как отдельные поля в контенте и в статистике.

### Persistence

Используй Cloudflare Durable Object для хранения прогресса пользователя.
Храни:

- попытки по шагам
- использованные подсказки
- переведённые сегменты
- время на шаг
- ошибки по skill/errorTag
- прогресс по tutorial
- результаты mistake review

### Tech stack

Предпочтительный стек:

- Astro
- TypeScript
- Cloudflare Pages
- Cloudflare Durable Object
- JSON content files
- React only where necessary for interactive components

### UI requirements

Нужны страницы:

- Home
- Tutorial select
- Task view
- Step flow
- Tutorial summary
- Mistake review

UI должен быть:

- минималистичным
- быстрым
- хорошо читаемым
- удобным и на desktop, и на mobile

### Content requirements

Создай seed content для MVP:

- полный Tutorial A
- полный Tutorial B
- review-bank минимум по основным слабым зонам:
  - arithmetic
  - fractions
  - equations
  - percentages
  - area/volume
  - angles
  - logic/patterns

### Special cases

Для задач на построение:

- не нужно реализовывать полноценную геометрическую чертилку
- сделай пошаговый tutorial, где пользователь выбирает правильный следующий шаг построения

Для задач с диаграммами и фигурами:

- используй простые SVG-иллюстрации

### Important constraints

- Не превращай это в обычный test quiz
- Не превращай это в длинный учебник
- Не добавляй AI API
- Не делай CMS
- Не делай auth
- Не делай глобальный language switch
- Главная ценность продукта — именно пошаговый tutorial по структуре экзамена и качественная работа над ошибками

---
