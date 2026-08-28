-- 玩家档案表：auth_user_id 是私有身份，public_uid/昵称用于公开排行榜。
create table if not exists public.profiles (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  public_uid text not null unique check (public_uid ~ '^[0-9]{8}$'),
  player_name text not null check (char_length(player_name) between 1 and 16),
  best_run_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
