import pg from 'pg'
import { config } from './config.js'

const { Pool } = pg

export const db = new Pool({
  connectionString: config.databaseUrl,
})

export async function migrate() {
  await db.query(`
    create extension if not exists pgcrypto;

    create table if not exists projects (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      age text not null,
      occasion text not null,
      world text not null,
      tone text not null,
      duration text not null,
      script text not null,
      status text not null default 'draft',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists project_stages (
      id uuid primary key default gen_random_uuid(),
      project_id uuid not null references projects(id) on delete cascade,
      slug text not null,
      title text not null,
      detail text not null,
      progress integer not null default 0,
      status text not null default 'queued',
      sort_order integer not null,
      updated_at timestamptz not null default now(),
      unique(project_id, slug)
    );

    create table if not exists scenes (
      id uuid primary key default gen_random_uuid(),
      project_id uuid not null references projects(id) on delete cascade,
      title text not null,
      prompt text not null,
      gradient text not null,
      image_url text,
      image_provider text,
      image_status text not null default 'pending',
      video_url text,
      video_provider text,
      video_status text not null default 'pending',
      video_prompt text,
      video_job_id text,
      sort_order integer not null,
      created_at timestamptz not null default now()
    );

    alter table scenes add column if not exists image_url text;
    alter table scenes add column if not exists image_provider text;
    alter table scenes add column if not exists image_status text not null default 'pending';
    alter table scenes add column if not exists video_url text;
    alter table scenes add column if not exists video_provider text;
    alter table scenes add column if not exists video_status text not null default 'pending';
    alter table scenes add column if not exists video_prompt text;
    alter table scenes add column if not exists video_job_id text;

    alter table projects add column if not exists montage_status text not null default 'pending';
    alter table projects add column if not exists montage_url text;
    alter table projects add column if not exists montage_note text;

    create table if not exists drum_leads (
      id uuid primary key default gen_random_uuid(),
      service_type text not null default 'drum',
      name text not null,
      contact text not null,
      city text,
      format text,
      preferred_date text,
      diameter text not null,
      membrane text not null,
      rim text not null,
      tuning text not null,
      purpose text not null,
      message text,
      source text not null default 'site',
      created_at timestamptz not null default now()
    );

    alter table drum_leads add column if not exists service_type text not null default 'drum';
    alter table drum_leads add column if not exists format text;
    alter table drum_leads add column if not exists preferred_date text;
  `)
}

export async function closeDb() {
  await db.end()
}
