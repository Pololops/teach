# Data Model: Teach - Phase 2 (Cloud Sync)

**Status**: Future Phase - Not in MVP
**Date**: 2025-11-15
**Branch**: 001-teach

## Overview

This document defines the **optional cloud sync** data model for Phase 2. The MVP uses IndexedDB exclusively (see main `data-model.md`). This schema will be implemented when adding user authentication and cross-device sync.

## Supabase Schema (Cloud Sync)

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (managed by Supabase Auth)
-- We extend the auth.users table with a custom profile table

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  current_level text not null default 'A1',
  preferences jsonb not null default '{"cloudSyncEnabled": true, "theme": "system", "showCorrections": true, "showSuggestions": true, "aiProvider": "auto"}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint valid_cefr_level check (current_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'))
);

-- Row-level security
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Conversations table
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  difficulty_level text not null,
  status text not null default 'active',
  message_count integer not null default 0,
  messages jsonb not null default '[]'::jsonb, -- Array of Message objects
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint valid_cefr_level check (difficulty_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  constraint valid_status check (status in ('active', 'archived', 'deleted'))
);

-- Indexes
create index conversations_user_id_idx on public.conversations(user_id);
create index conversations_status_idx on public.conversations(status);
create index conversations_created_at_idx on public.conversations(created_at desc);

-- Row-level security
alter table public.conversations enable row level security;

create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- Progress metrics table
create table public.progress_metrics (
  user_id uuid references auth.users on delete cascade primary key,
  current_level text not null,
  level_history jsonb not null default '[]'::jsonb, -- Array of LevelChange objects
  total_conversations integer not null default 0,
  total_messages integer not null default 0,
  total_time integer not null default 0,
  vocabulary_encountered text[] not null default '{}',
  vocabulary_mastered text[] not null default '{}',
  topics_discussed text[] not null default '{}',
  last_active timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint valid_cefr_level check (current_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'))
);

-- Row-level security
alter table public.progress_metrics enable row level security;

create policy "Users can view own metrics"
  on public.progress_metrics for select
  using (auth.uid() = user_id);

create policy "Users can update own metrics"
  on public.progress_metrics for update
  using (auth.uid() = user_id);

create policy "Users can insert own metrics"
  on public.progress_metrics for insert
  with check (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure update_updated_at_column();

create trigger update_conversations_updated_at before update on public.conversations
  for each row execute procedure update_updated_at_column();

create trigger update_progress_metrics_updated_at before update on public.progress_metrics
  for each row execute procedure update_updated_at_column();
```

## Migration Path

When implementing Phase 2:

1. **User Opt-in**: User explicitly enables cloud sync in preferences UI
2. **Authentication**: Create Supabase account with Auth (email/password or OAuth)
3. **Initial Sync**: Run migration script to sync IndexedDB → Supabase
4. **Real-time Sync**: Enable Supabase Realtime for future changes
5. **Conflict Resolution**: Last-write-wins strategy based on `updated_at` timestamp

## Implementation Notes

- **Backward Compatibility**: Existing IndexedDB data must be preserved
- **Privacy**: Users can disable cloud sync and delete cloud data while keeping local data
- **Security**: Row-level security (RLS) ensures data isolation between users
- **Performance**: Batch sync operations to minimize API calls

---

**See**: `data-model.md` for MVP (IndexedDB-only) schema
