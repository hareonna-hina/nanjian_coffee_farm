-- 对局状态枚举，区分进行中、正常完成和放弃。
create type public.run_status as enum ('ongoing','finished','aborted');

-- 权威对局表：保存随机种子、选择/事件日志、终局指标和归属用户。
create table if not exists public.runs (
  run_id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  seed bigint not null,
  choices jsonb not null default '[]'::jsonb,
  events jsonb not null default '[]'::jsonb,
  final_state jsonb,
  score_sca numeric(4,1),
  defect_rate numeric,
  final_yield numeric,
  buyer_type text,
  unit_price numeric,
  net_profit bigint,
  status public.run_status not null default 'ongoing',
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- 档案只指向该玩家的历史最佳对局；删除对局时安全置空。
alter table public.profiles
  add constraint profiles_best_run_fk foreign key (best_run_id) references public.runs(run_id) on delete set null;

-- 所有者查询与已完成利润排行各有专用索引。
create index if not exists runs_owner_idx on public.runs(auth_user_id, status);
create index if not exists runs_profit_idx on public.runs(net_profit desc) where status='finished';
