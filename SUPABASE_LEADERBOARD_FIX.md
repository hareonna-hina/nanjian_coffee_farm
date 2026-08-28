# Supabase 公共排行榜修复说明

## 根因结论

| 检查项 | 结论 |
| --- | --- |
| A. `runs` 是否只允许读取自己 | 是。`004_rls.sql` 的 `runs_select_own` 使用 `auth.uid() = auth_user_id`。这是正确的隐私边界，不应放宽。 |
| B. view 是否使用 `security_invoker=true` | 当前 `003_leaderboard.sql` 没有设置。普通 view 默认以创建者权限读取底表，因此本地 SQL 并非“继承 RLS 后只能看自己”。 |
| C. 前端是否主动 `.eq("auth_user_id", user.id)` | 没有。更直接的问题是旧 `leaderboard.js` 完全没有访问 Supabase，只合并硬编码样例与本机历史。 |
| D. 是否存在公共只读入口 | 旧迁移对 view 有 SELECT grant，但前端没有使用，而且旧 view 依赖 `profiles.best_run_id`、额外暴露 `run_id`。 |
| E. `submit-run` 是否写入最终成绩 | 否。检查时该函数固定返回 501，`runs.js` 也只写 localStorage；数据库不会收到新的 finished 成绩。 |

此外，旧 `create-run` 使用用户 JWT 客户端插入 `runs`，但 `004_rls.sql` 没有 insert policy；严格按仓库代码部署时会被 RLS 拒绝。修复后由函数先验证用户，再用只存在服务端的 secret/service-role client 写入。

## 采用的结构

```text
浏览器（publishable key + Anonymous Auth）
  ├─ create-run Edge Function ──验证 JWT──> admin INSERT 自己的 ongoing run
  ├─ submit-run Edge Function ──验证 JWT + run_id 所有权──> admin UPDATE finished run
  ├─ update-profile Edge Function ──验证 JWT──> admin UPSERT 自己的 profile
  └─ SELECT public.leaderboard view
             └─ 仅 rank/name/public_uid/profit/SCA/yield/tier

public.runs
  └─ RLS: authenticated 用户只能 SELECT auth.uid() = auth_user_id
     无客户端 UPDATE policy；完整 choices/events/final_state 不公开
```

选择 view 而不是 RPC，是因为项目已有同名 view，前端可以直接 `.from("leaderboard")`，改动最少。新 view 有意不设置 `security_invoker=true`；否则会继承 `runs_select_own`，再次退化为只显示当前用户。它使用固定字段投影、`security_barrier`、显式 revoke/grant，将越过底表 RLS 的能力限制在必要公开字段上。

## 修改文件

- `supabase/migrations/005_public_leaderboard.sql`：新上线迁移；重建只读 view，每个用户只选历史最佳一局。
- `supabase/functions/create-run/index.ts`：JWT 校验后由服务端创建 run；增加 CORS 和新旧 API key 环境兼容。
- `supabase/functions/submit-run/index.ts`：替换 501；验证 JWT、run_id 所有权、ongoing 状态和载荷，再完成对局。
- `supabase/functions/update-profile/index.ts`：服务端绑定 auth_user_id，处理 UID 冲突并增加 CORS。
- `frontend/index.html`：加载 Supabase 浏览器 SDK。
- `frontend/js/api/supabase.js`：初始化仅含 publishable key 的客户端，支持本地降级。
- `frontend/js/api/auth.js`：接入 `signInAnonymously()`。
- `frontend/js/api/profile.js`：通过 `update-profile` 同步昵称/公开 UID。
- `frontend/js/api/runs.js`：接入 `create-run`、`submit-run`，同时保留本地历史。
- `frontend/js/api/leaderboard.js`：异步查询公共 view，不查询 `runs`，不按 auth_user_id 过滤。
- `frontend/js/main.js`：等待远端建局/提交；失败时提示并保留本地玩法。
- `frontend/js/ui/leaderboardModal.js`、`settlementModal.js`：适配异步排行榜。
- `frontend/js/ui/screens.js`、`utils/format.js`：异步保存昵称，并转义公开昵称以防存储型 HTML 注入。
- `tests/backend.test.js`、`package.json`：增加排行榜与 RLS 安全边界回归测试。
- `README.md`：更新远端架构、文件职责和安全边界。

历史迁移 `003_leaderboard.sql`、`004_rls.sql` 没有被改写。已经执行过的迁移应保持不可变；`005` 会在现有线上数据库上安全覆盖旧 view。`004` 中的 `runs_select_own` 是正确策略，必须保留。

## 最终公开字段和排序

`public.leaderboard` 最终只公开：

```text
rank, player_name, public_uid, net_profit,
score_sca, final_yield, tier
```

每位玩家先按以下规则选择最好一局，之后全榜按同样规则排名：

1. `net_profit DESC`
2. `score_sca DESC`
3. `final_yield DESC`
4. `finished_at ASC`
5. 仅在四项完全相同时使用稳定 ID 作为确定性兜底

## 部署命令

项目当前已经链接到 `vviexdnhrvpkybvpzhte`。建议按数据库 → Functions → 前端的顺序部署：

```powershell
npm test
supabase db push
supabase functions deploy create-run
supabase functions deploy submit-run
supabase functions deploy update-profile
```

随后提交并推送前端文件，由现有 GitHub Pages workflow 发布：

```powershell
git add frontend supabase tests package.json README.md SUPABASE_LEADERBOARD_FIX.md
git commit -m "fix: expose public read-only leaderboard"
git push origin main
```

不要使用 `--no-verify-jwt`；三个函数在 `supabase/config.toml` 中都保持 `verify_jwt = true`。不要把 secret/service-role key 写进 `frontend/`。托管 Edge Functions 默认提供新旧 API key 环境变量，本实现同时兼容 `SUPABASE_SECRET_KEYS` 与旧 `SUPABASE_SERVICE_ROLE_KEY`。

## 双浏览器验证清单

1. 使用无痕浏览器 A 打开游戏，确认产生匿名用户 A，设置昵称并完成一局。
2. 使用另一无痕浏览器或独立浏览器 B，确认产生不同匿名用户 B，设置昵称并完成一局。
3. 在 Supabase SQL Editor（管理员环境）执行：

   ```sql
   select auth_user_id, count(*)
   from public.runs
   group by auth_user_id;
   ```

   应至少出现两个不同 `auth_user_id`。

4. A 打开排行榜，能看到 A 和 B；B 打开时也能看到 A 和 B。
5. 两端执行的排行榜请求只能包含 `leaderboard?select=rank,player_name,public_uid,net_profit,score_sca,final_yield,tier`，不应请求完整 `runs`。
6. 以 A 的 Session 查询 `public.runs`，只返回 A 的记录；用 B 的 run_id 定向查询应返回空结果。
7. 以 A 的普通浏览器客户端尝试 UPDATE B 的 run，应因没有 UPDATE policy/RLS 被拒绝或更新 0 行。
8. 为同一玩家完成多局后，排行榜只能出现一行，并应是四级比较规则下的最佳局。
9. 人工插入或准备同利润成绩时，依次验证 SCA、FinalYield 和更早 finished_at 的排序。
10. 检查榜单网络响应，确认没有 `run_id`、`auth_user_id`、`choices`、`events`、`final_state`、`defect_rate` 等私有字段。

## 已完成的本地验证

- 28 个前端/测试 JavaScript 文件语法检查通过。
- 3 个 Edge Function TypeScript 文件语法检查通过。
- 12 项游戏规则测试通过。
- 13 个图片引用和 44 个本地图片资产检查通过。
- 后端回归测试确认：公共 view 查询保留其他玩家、前端不查询 runs、不含 auth_user_id 过滤、runs 仍为 owner-only、排行榜仅授予 SELECT、前端不存在 elevated key。
- 全项目术语统一使用 SCA。

未直接执行 `supabase db push` 或函数部署，因此线上双浏览器验证需要在上述命令执行后完成。
