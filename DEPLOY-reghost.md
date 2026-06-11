# Деплой «Дух Сибири» на reg.ru (виртуальный хостинг Host-0)

Стек: статика (Vite `dist`) + **PHP** эндпоинт заявок + **MySQL** + бесплатный SSL.
Заявка с сайта → MySQL → уведомление в Telegram-группу.

## Что куда кладётся (в корень сайта shamandrums.ru на хостинге)
```
shamandrums.ru/                 <- docroot
├── index.html                  } из локальной сборки dist/
├── assets/                     }
├── generated/                  }
├── favicon.png, favicon.svg    }
├── .htaccess                   <- из php/.htaccess
└── api/
    ├── leads.php               <- из php/api/leads.php
    └── config.php              <- скопировать из php/api/config.example.php и вписать пароли (НЕ из git)
```

---

## 1. Собрать сайт локально
```bash
npm ci
npm run build:web      # появится папка dist/
```

## 2. MySQL в панели reg.ru
Хостинг **Host-0** → Управление → **Базы данных MySQL** → создать БД (например `youruser_shaman`), пользователя и пароль.
Затем открыть **phpMyAdmin** (там же в панели) → выбрать БД → вкладка **SQL** → вставить и выполнить содержимое `php/schema.mysql.sql` (создаст таблицу `leads`).

## 3. Привязать домен shamandrums.ru
- Если домен на reg.ru: Домены → shamandrums.ru → привязать к хостингу Host-0 (создаст сайт/каталог `shamandrums.ru`).
- DNS на reg.ru проставится автоматически. Если домен внешний — направить NS/записи на reg.ru.

## 4. config.php (пароли)
Локально: `cp php/api/config.example.php php/api/config.php`, вписать:
- `db_name/db_user/db_pass` — из шага 2,
- `tg_token` — рабочий токен бота,
- `tg_chat` — chat_id вашей группы-получателя заявок.

## 5. Залить файлы в docroot сайта shamandrums.ru
Способ А — **Файловый менеджер** в панели: загрузить **содержимое** `dist/` + `.htaccess` + папку `api/` (с `leads.php` и `config.php`).
Способ Б — **FTP/SFTP** (логин `u3482441`, хост и пароль из панели) любым клиентом (FileZilla) или я залью командой, если дашь доступ.

> Важно: грузить **содержимое** dist (index.html и т.д.) в корень сайта, а не саму папку dist.

## 6. SSL
Панель → **SSL** → выпустить бесплатный **Let's Encrypt** для shamandrums.ru (и www). После активации `.htaccess` уже редиректит на https.

---

## Проверка
- Открыть https://shamandrums.ru — сайт грузится.
- Отправить тестовую заявку через форму → в Telegram-группе появилось сообщение, в phpMyAdmin в `leads` появилась строка.
- Здоровье API: `https://shamandrums.ru/api/leads` (GET вернёт `{"ok":false,"error":"method"}` — это норма, значит php работает).

## Обновление сайта потом
Пересобрать `dist` локально (`npm run build:web`) и перезалить его содержимое в docroot (api/ и config.php трогать не нужно).

## Требования хостинга
PHP 7.4+ с PDO MySQL и cURL (на reg.ru Host-0 есть по умолчанию). Если cURL выключен — скрипт сам падает на `file_get_contents` (тоже работает).
