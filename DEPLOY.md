# Деплой «Дух Сибири» на VPS (shamandrums.ru)

Стек: статика (Vite `dist`) через **nginx** + **Node/Fastify** API для заявок + **PostgreSQL** + **Let's Encrypt** SSL.
Заявка с сайта → сохраняется в БД → уведомление в Telegram.

Предполагается **Ubuntu 22.04/24.04**, доступ под root или sudo.

---

## 0. DNS (на reg.ru), один раз
Добавь A-записи на IP сервера:
```
@    A    <IP_СЕРВЕРА>
www  A    <IP_СЕРВЕРА>
```
Подожди прорастания (15 мин – пара часов). Проверка: `nslookup shamandrums.ru`.

## 1. Пакеты
```bash
sudo apt update && sudo apt -y upgrade
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs nginx postgresql certbot python3-certbot-nginx git
node -v   # должно быть v20+
```

## 2. Код
```bash
sudo mkdir -p /var/www/shamandrums
sudo chown -R $USER:$USER /var/www/shamandrums
git clone https://github.com/siberiangars/Shamanic-Drums.git /var/www/shamandrums
cd /var/www/shamandrums
npm ci
npm run build:web          # соберёт ./dist
```

## 3. База данных
```bash
sudo -u postgres psql <<'SQL'
create database shamandrums;
create user shaman with password 'ПРИДУМАЙ_НАДЁЖНЫЙ_ПАРОЛЬ';
grant all privileges on database shamandrums to shaman;
\connect shamandrums
grant all on schema public to shaman;
SQL

# создать таблицу
psql "postgres://shaman:ПРИДУМАЙ_НАДЁЖНЫЙ_ПАРОЛЬ@localhost:5432/shamandrums" -f server/schema.sql
```

## 4. Переменные окружения API
```bash
cp server/.env.example server/.env
nano server/.env
```
Заполни:
- `DATABASE_URL` — тот же пароль, что выше.
- `TELEGRAM_BOT_TOKEN` — рабочий токен от @BotFather.
- `TELEGRAM_CHAT_ID` — см. раздел «Telegram» ниже.

## 5. Telegram: узнать chat_id получателя
**Вариант А (рекомендую) — группа:** создай приватную группу «Заявки Дух Сибири», добавь туда бота @Shamtatur, дай ему **админа**. Затем:
```bash
curl -s "https://api.telegram.org/bot<ТОКЕН>/getUpdates" | grep -o '"chat":{"id":[-0-9]*'
```
Возьми число вида `-1001234567890` → это `TELEGRAM_CHAT_ID`.

**Вариант Б — личка:** получатель открывает @Shamtatur, жмёт **Start**, пишет «привет», затем тот же `getUpdates` даст его числовой `id` (положительное число).

Проверка отправки:
```bash
curl -s "https://api.telegram.org/bot<ТОКЕН>/sendMessage" -d chat_id=<CHAT_ID> -d text=тест
```

## 6. systemd-сервис API
```bash
sudo cp deploy/shamandrums-api.service /etc/systemd/system/
sudo chown -R www-data:www-data /var/www/shamandrums
sudo systemctl daemon-reload
sudo systemctl enable --now shamandrums-api
sudo systemctl status shamandrums-api      # active (running)
curl -s localhost:8787/api/health          # {"ok":true,...}
```

## 7. nginx + SSL
```bash
sudo cp deploy/nginx-shamandrums.conf /etc/nginx/sites-available/shamandrums.ru
sudo ln -sf /etc/nginx/sites-available/shamandrums.ru /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# SSL (после того как DNS прорастёт):
sudo certbot --nginx -d shamandrums.ru -d www.shamandrums.ru
```
Certbot сам добавит 443 и редирект на https. Готово — открывай https://shamandrums.ru

---

## Обновление сайта (после новых правок)
```bash
cd /var/www/shamandrums
git pull
npm ci
npm run build:web
sudo systemctl restart shamandrums-api   # только если менялся server/
```
(nginx отдаёт свежий `dist` сразу.)

## Полезное
- Логи API: `journalctl -u shamandrums-api -f`
- Заявки в БД: `psql "$DATABASE_URL" -c "select id, created_at, name, contact, purpose from leads order by id desc limit 20;"`
- nginx-логи: `/var/log/nginx/{access,error}.log`
