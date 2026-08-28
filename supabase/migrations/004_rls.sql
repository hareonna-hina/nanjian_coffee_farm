-- 开启行级安全，阻止浏览器直接读写其他玩家的原始档案和对局。
alter table public.profiles enable row level security;
alter table public.runs enable row level security;

-- 玩家只能查询、新建、更新自己的档案；客户端只能读取自己的对局。
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = auth_user_id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = auth_user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);
create policy "runs_select_own" on public.runs for select using (auth.uid() = auth_user_id);

-- 匿名/登录用户只能读取脱敏后的排行榜视图。
grant select on public.leaderboard to anon, authenticated;
