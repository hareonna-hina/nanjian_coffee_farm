-- 公共只读排行榜：底层 runs/profiles 继续受 RLS 保护，视图只投影公开字段。
-- 此处有意使用默认 security-definer 语义，不设置 security_invoker=true；否则查询会继承
-- runs_select_own，只能看到当前玩家。security_barrier 防止调用方谓词被下推到视图内部。
begin;

drop view if exists public.leaderboard;

create view public.leaderboard
with (security_barrier = true)
as
with best_per_player as (
  select distinct on (r.auth_user_id)
    r.auth_user_id,
    r.net_profit,
    r.score_sca,
    r.final_yield,
    r.finished_at
  from public.runs r
  where r.status = 'finished'
    and r.net_profit is not null
    and r.score_sca is not null
    and r.final_yield is not null
  order by
    r.auth_user_id,
    r.net_profit desc,
    r.score_sca desc,
    r.final_yield desc,
    r.finished_at asc,
    r.run_id asc
)
select
  row_number() over (
    order by
      b.net_profit desc,
      b.score_sca desc,
      b.final_yield desc,
      b.finished_at asc,
      b.auth_user_id asc
  ) as rank,
  p.player_name,
  p.public_uid,
  b.net_profit,
  b.score_sca,
  b.final_yield,
  case
    when b.net_profit >= 200000 then '👑无量山咖王'
    when b.net_profit >= 120000 then '🟣庄园大亨'
    when b.net_profit >= 70000 then '🔵资深咖农'
    when b.net_profit >= 30000 then '🟢彝乡新秀'
    else '⚪勉强糊口'
  end as tier
from best_per_player b
join public.profiles p on p.auth_user_id = b.auth_user_id;

-- PUBLIC 不应通过默认继承获得权限；仅允许两个客户端角色读取这个投影视图。
revoke all on public.leaderboard from public;
revoke all on public.leaderboard from anon, authenticated;
grant select on public.leaderboard to anon, authenticated;

comment on view public.leaderboard is
  'Public read-only best run per player; full run records remain protected by runs RLS.';

commit;
