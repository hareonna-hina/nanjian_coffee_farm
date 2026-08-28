-- 回滚 005：恢复 003 中基于 profiles.best_run_id 的排行榜结构。
-- 005 已在远端执行，因此必须保留其迁移文件，并通过新的前向迁移撤销数据库对象变更。
begin;

drop view if exists public.leaderboard;

create view public.leaderboard as
select
  row_number() over (
    order by
      r.net_profit desc,
      r.score_sca desc,
      r.final_yield desc,
      r.finished_at asc
  ) as rank,
  p.player_name,
  p.public_uid,
  r.net_profit,
  r.score_sca,
  r.final_yield,
  r.run_id
from public.profiles p
join public.runs r on r.run_id = p.best_run_id
where r.status = 'finished';

grant select on public.leaderboard to anon, authenticated;

comment on view public.leaderboard is
  'Leaderboard restored to the pre-005 best_run_id implementation.';

commit;
