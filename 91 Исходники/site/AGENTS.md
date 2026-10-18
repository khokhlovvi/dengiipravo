# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

Selected target: ../design-research/concept-01-v2.png (first displayed revised option)
User approved implementation on 2026-09-27 with copy based on Визитка НАЧАЛО.rtf
Current structure approved 2026-10-04: / is «О нас» with capital headline, client tasks, team expertise and five cases; /solutions is «Решения» with six financial instruments and legal services; /about remains an alias
Do not add unverified business metrics or stronger judicial outcomes than the source
No full stops in headings, slogans or short captions

Latest copy source: /Users/admin/Downloads/Предложения_по_визитке_на_обсуждение.rtf
Use «Капитал под задачи вашего бизнеса», «Финансовые инструменты под вашу задачу», «Правовая работа» and «Наш опыт»
Keep financial instruments unchanged and keep current cases pending further user revisions
Legal work includes asset review, full company due diligence, property transactions and disputes, private wealth protection, and transaction support

## 12.10.2026 — доработка к публикации (Claude)

Владимир выбрал: дорабатывать утверждённый дизайн, а не делать новый; домен dengiipravo.ru; заявки — в Telegram и на почту
Размещение — свой сервер Владимира (Москва), а не Sites. Сборка — `npm run build`, пререндер страниц в `dist/client`
Стили переписаны начисто с токенами; спокойная анимация (появление блоков, лёгкий параллакс, плавное раскрытие) с учётом reduced-motion
Добавлены: настоящая отправка формы с согласием на обработку ПДн, /privacy, 404, иконки, og.jpg, мета-теги, sitemap, robots
Телефон пишется как 8 (926) 860-49-29

## 13.10.2026 — облик из черновика Magic UI

Владимир выбрал облик черновика `../site-magicui` (соседний чат) и попросил перенести его на рабочий сайт с сохранением всего рабочего
Перенесено своими силами без Tailwind и motion: `src/effects.jsx` — бегущая строка, карточки с подсветкой, кнопка с бликом, проявление текста по словам, мерцающая сетка, круги; точечный фон и маски фото — в CSS
Принцип «Работаем с первопричиной…» — светлый блок с проявлением по словам; тёмным стал блок контактов
Все эффекты есть в готовом HTML без JS и замирают при reduced-motion
