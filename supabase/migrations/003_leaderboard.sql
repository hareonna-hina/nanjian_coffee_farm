-- 公共排行榜视图：每位玩家只展示 profiles.best_run_id 指向的最佳一局。
-- 排序依次比较净利润、SCA、交割产量，最后以更早完成者优先。
create or replace view public.leaderboard as
select
  row_number() over (order by r.net_profit desc, r.score_sca desc, r.final_yield desc, r.finished_at asc) as rank,
  p.player_name,
  p.public_uid,
  r.net_profit,
  r.score_sca,
  r.final_yield,
  r.run_id
from public.profiles p
join public.runs r on r.run_id = p.best_run_id
where r.status = 'finished';
