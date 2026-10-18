#!/usr/bin/env python3
"""Приём заявок с сайта dengiipravo.ru

POST /api/request (JSON) → письмо с заявкой на почту + короткое уведомление в Telegram без персональных данных
Каждая заявка сохраняется в requests.jsonl (права 600), записи старше года удаляются
Слушает только 127.0.0.1:8787, снаружи доступен через Caddy
"""
import json, os, re, smtplib, ssl, time, threading, urllib.request, urllib.parse
from datetime import datetime, timezone, timedelta
from email.message import EmailMessage
from email.utils import formataddr, make_msgid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
ENV = {}
for line in open(os.path.join(HERE, ".env"), encoding="utf-8"):
    if "=" in line and not line.lstrip().startswith("#"):
        k, v = line.rstrip("\n").split("=", 1)
        ENV[k.strip()] = v.strip()

STORE = os.path.join(HERE, "requests.jsonl")
MSK = timezone(timedelta(hours=3))
LIMITS = {"name": 100, "company": 150, "contact": 150, "topic": 80, "message": 3000, "page": 40}
RATE = {}  # ip → [время заявок]
LOCK = threading.Lock()


def log(*a):
    print(datetime.now(MSK).strftime("%Y-%m-%d %H:%M:%S"), *a, flush=True)


def rate_ok(ip):
    now = time.time()
    with LOCK:
        hits = [t for t in RATE.get(ip, []) if now - t < 3600]
        if len(hits) >= 5:
            RATE[ip] = hits
            return False
        RATE[ip] = hits + [now]
        return True


def store(rec):
    cutoff = (datetime.now(MSK) - timedelta(days=365)).isoformat()
    with LOCK:
        old = []
        if os.path.exists(STORE):
            old = [l for l in open(STORE, encoding="utf-8") if l.strip() and json.loads(l).get("time", "") >= cutoff]
        fd = os.open(STORE + ".tmp", os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.writelines(old)
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
        os.replace(STORE + ".tmp", STORE)


def send_mail(rec):
    if not ENV.get("SMTP_PASSWORD"):
        raise RuntimeError("SMTP_PASSWORD не задан")
    msg = EmailMessage()
    msg["Subject"] = f"Заявка с сайта: {rec['topic']} — {rec['name']}"
    msg["From"] = formataddr(("Сайт Деньги & Право", ENV["SMTP_USER"]))
    msg["To"] = ENV.get("MAIL_TO", ENV["SMTP_USER"])
    msg["Message-ID"] = make_msgid(domain="dengiipravo.ru")
    if "@" in rec["contact"]:
        msg["Reply-To"] = rec["contact"]
    msg.set_content(
        f"Новая заявка с сайта dengiipravo.ru\n\n"
        f"Имя: {rec['name']}\n"
        f"Компания: {rec['company'] or '—'}\n"
        f"Контакт: {rec['contact']}\n"
        f"Направление: {rec['topic']}\n"
        f"Страница: {rec['page']}\n"
        f"Время: {rec['time'][:16].replace('T', ' ')} (МСК)\n\n"
        f"{rec['message']}\n\n"
        f"—\nСогласие на обработку персональных данных получено\n"
    )
    with smtplib.SMTP_SSL(ENV["SMTP_HOST"], int(ENV.get("SMTP_PORT", 465)), timeout=20, context=ssl.create_default_context()) as s:
        s.login(ENV["SMTP_USER"], ENV["SMTP_PASSWORD"])
        s.send_message(msg)


def send_tg(text):
    token, chats = ENV.get("TG_TOKEN"), [c for c in ENV.get("TG_CHAT_ID", "").split(",") if c.strip()]
    if not token or not chats:
        return False
    for chat in chats:
        data = urllib.parse.urlencode({"chat_id": chat.strip(), "text": text}).encode()
        urllib.request.urlopen(f"https://api.telegram.org/bot{token}/sendMessage", data, timeout=20).read()
    return True


class Handler(BaseHTTPRequestHandler):
    def reply(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/api/health":
            return self.reply(200, {"ok": True, "mail": bool(ENV.get("SMTP_PASSWORD")), "telegram": bool(ENV.get("TG_TOKEN") and ENV.get("TG_CHAT_ID"))})
        self.reply(404, {"ok": False})

    def do_POST(self):
        if self.path != "/api/request":
            return self.reply(404, {"ok": False})
        ip = self.headers.get("X-Forwarded-For", self.client_address[0]).split(",")[0].strip()
        try:
            n = int(self.headers.get("Content-Length", 0))
            if n > 20000:
                return self.reply(413, {"ok": False})
            data = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return self.reply(400, {"ok": False})
        if data.get("website"):  # ловушка: люди это поле не видят
            log("бот отсеян", ip)
            return self.reply(200, {"ok": True})
        rec = {k: str(data.get(k, "")).strip()[:lim] for k, lim in LIMITS.items()}
        contact_ok = re.fullmatch(r"\s*([^\s@]+@[^\s@]+\.[^\s@]+|(\D*\d){6,}\D*)\s*", rec["contact"])
        if not rec["name"] or not contact_ok or not rec["message"] or data.get("consent") != "yes":
            return self.reply(422, {"ok": False})
        if not rate_ok(ip):
            log("слишком часто", ip)
            return self.reply(429, {"ok": False})
        rec["topic"] = rec["topic"] or "Обсуждение задачи"
        rec["time"] = datetime.now(MSK).isoformat(timespec="seconds")
        rec["ip"] = ip
        try:
            store(rec)
        except Exception as e:
            log("не сохранилась", e)
            return self.reply(500, {"ok": False})
        mailed = False
        try:
            send_mail(rec)
            mailed = True
        except Exception as e:
            log("письмо не ушло:", type(e).__name__, e)
        note = f"Новая заявка с сайта\nНаправление: {rec['topic']}\n" + ("Подробности — на почте dengi_i_pravo@mail.ru" if mailed else "⚠ Письмо не ушло — заявка сохранена на сервере, нужна проверка")
        notified = False
        try:
            notified = send_tg(note)
        except Exception as e:
            log("Telegram не ответил:", type(e).__name__, e)
        log("заявка", rec["topic"], "почта" if mailed else "БЕЗ ПОЧТЫ", "telegram" if notified else "без telegram")
        # Если о заявке никто не узнал — честно говорим посетителю, чтобы он позвонил или написал сам
        if mailed or notified:
            self.reply(200, {"ok": True})
        else:
            self.reply(502, {"ok": False})

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    log("слушаю 127.0.0.1:8787")
    ThreadingHTTPServer(("127.0.0.1", 8787), Handler).serve_forever()
