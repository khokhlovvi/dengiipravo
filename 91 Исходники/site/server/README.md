# dengiipravo-site — сайт dengiipravo.ru и приём заявок

## Что делает

- **Сайт**: статические файлы в `/var/www/dengiipravo` (владелец vova), отдаёт Caddy (системная служба `caddy`, конфиг `/etc/caddy/Caddyfile`). HTTPS-сертификат Caddy получает и продлевает сам.
- **Заявки**: `handler.py` — служба `dengiipravo-form` (systemctl --user), слушает только 127.0.0.1:8787, Caddy проксирует туда `/api/*`.
  Полная заявка → письмо на info@dengiipravo.ru (`MAIL_TO`; отправка через SMTP mail.ru, пароль приложения dengi_i_pravo@mail.ru). В Telegram (@dengiipravo_bot, групповой чат «Деньги & Право» с коллегами) — только уведомление «новая заявка, направление» без персональных данных (так решил Владимир 12.10.2026: без трансграничной передачи ПДн).
  Копия каждой заявки — `requests.jsonl` (права 600), записи старше года удаляются сами (срок из политики ПДн).
  Защита: скрытое поле-ловушка для ботов, не больше 5 заявок в час с одного IP, ограничение длины полей.

## Расписание

Работает постоянно. Сертификат продлевается сам.

## Секреты

`.env` (600): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD (пароль приложения mail.ru), MAIL_TO (получатель заявок, сейчас info@dengiipravo.ru), TG_TOKEN, TG_CHAT_ID (через запятую, если несколько).
После правки: `systemctl --user restart dengiipravo-form`. Проверка: `curl -s 127.0.0.1:8787/api/health`.

## Как обновить сайт

С Мака после сборки (`91 Исходники/site/README.md`):
`rsync -az --delete /tmp/dip-build/dist/client/ server:/var/www/dengiipravo/`

## Журналы

- заявки: `journalctl --user -u dengiipravo-form -f`
- сайт: `/var/log/caddy/dengiipravo.log`, `journalctl -u caddy`

## Как остановить

- заявки: `systemctl --user disable --now dengiipravo-form`
- сайт: `sudo systemctl disable --now caddy`
