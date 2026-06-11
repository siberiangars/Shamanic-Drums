<?php
// Скопируй в config.php и впиши реальные значения. config.php в git НЕ попадает.
return [
  // MySQL (создаётся в панели reg.ru → Хостинг → Управление → Базы данных MySQL)
  'db_host' => 'localhost',
  'db_name' => 'YOUR_DB_NAME',       // имя БД из панели
  'db_user' => 'YOUR_DB_USER',       // пользователь БД
  'db_pass' => 'YOUR_DB_PASSWORD',   // пароль БД

  // Telegram
  'tg_token' => 'YOUR_BOT_TOKEN',
  'tg_chat'  => 'YOUR_CHAT_ID',      // chat_id группы получателя заявок
];
