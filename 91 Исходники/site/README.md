# Деньги & Право

Сайт компании: `/` — О нас, `/solutions` — Решения, `/privacy` — политика ПДн, `404.html`. `/about` — старый адрес «О нас» (на сервере — редирект на `/`)
Домен: dengiipravo.ru (выбран 12.10.2026, ещё не куплен)

Стек: React + Vite, Phosphor Icons, системные шрифты. Каждая страница пререндерится в готовый HTML (`scripts/prerender.mjs`) и оживает на клиенте

## Файлы

- `src/content.js` — все тексты, контакты, реквизиты (`site.legal` — заполнить до публикации)
- `src/App.jsx` — страницы и компоненты, `src/styles.css` — стили (токены в `:root`)
- `src/entry-server.jsx` + `scripts/prerender.mjs` — HTML страниц, мета-теги, sitemap.xml, robots.txt
- `images-src/` — исходные PNG; `npm run images` делает WebP и JPEG в `public/images/`
- `public/` — иконки, og.jpg (картинка для ссылок), manifest
- `qa/revision-2026-10-12/` — скриншоты проверки

## Сборка

Node на Маке — `~/.local/node/bin` (ставится без системных изменений)
Чтобы `node_modules` не попадал в хранилище Obsidian, сборка идёт в копии вне него:

```
export PATH=$HOME/.local/node/bin:$PATH
rsync -a --delete --exclude node_modules --exclude dist --exclude qa --exclude images-src ./ /tmp/dip-build/
cd /tmp/dip-build && npm install && npm run build
```

Результат — `dist/client/`: статические файлы для nginx (`try_files $uri $uri/index.html =404`, `error_page 404 /404.html`)

## Форма

Отправляет JSON на `POST /api/request`: name, company, contact, topic, message, consent, website (ловушка для ботов — у людей пустое), page
Обработчик на сервере: заявка в Telegram и на почту — делается на этапе размещения

## Устаревшее

`scripts/export-html.mjs`, `worker/`, `tests/`, `.openai/` — от прежней выкладки (Codex Sites и HTML одним файлом), для нового сайта не используются
