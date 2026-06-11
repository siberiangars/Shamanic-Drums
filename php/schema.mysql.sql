-- Дух Сибири — таблица заявок (MySQL, reg.ru). Запускается в phpMyAdmin.
CREATE TABLE IF NOT EXISTS leads (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  service_type   VARCHAR(255) NOT NULL DEFAULT '',
  name           VARCHAR(255) NOT NULL,
  contact        VARCHAR(255) NOT NULL,
  city           VARCHAR(255) NOT NULL DEFAULT '',
  format         VARCHAR(255) NOT NULL DEFAULT '',
  preferred_date VARCHAR(255) NOT NULL DEFAULT '',
  diameter       VARCHAR(255) NOT NULL DEFAULT '',
  membrane       VARCHAR(255) NOT NULL DEFAULT '',
  rim            VARCHAR(255) NOT NULL DEFAULT '',
  tuning         VARCHAR(255) NOT NULL DEFAULT '',
  purpose        TEXT,
  message        TEXT,
  ip             VARCHAR(64) NOT NULL DEFAULT '',
  user_agent     VARCHAR(300) NOT NULL DEFAULT '',
  INDEX created_at_idx (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
