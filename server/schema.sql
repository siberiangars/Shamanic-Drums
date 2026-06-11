-- Дух Сибири — таблица заявок
create table if not exists leads (
  id             bigserial primary key,
  created_at     timestamptz not null default now(),
  service_type   text not null default '',
  name           text not null,
  contact        text not null,
  city           text not null default '',
  format         text not null default '',
  preferred_date text not null default '',
  diameter       text not null default '',
  membrane       text not null default '',
  rim            text not null default '',
  tuning         text not null default '',
  purpose        text not null default '',
  message        text not null default '',
  ip             text not null default '',
  user_agent     text not null default ''
);

create index if not exists leads_created_at_idx on leads (created_at desc);
