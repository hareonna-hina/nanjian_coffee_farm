/** 排行榜与 Supabase 安全边界回归测试：同时检查 SQL、Edge Function 和前端查询目标。 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const root=path.resolve(__dirname,"..");

/** 读取相对项目根目录的 UTF-8 文本文件。 */
function read(relative){return fs.readFileSync(path.join(root,relative),"utf8")}

/** 执行静态安全断言和带 mock Supabase 客户端的前端查询断言。 */
async function main(){
  const rls=read("supabase/migrations/004_rls.sql");
  const leaderboardMigration=read("supabase/migrations/005_public_leaderboard.sql");
  const leaderboardSql=leaderboardMigration.replace(/^--.*$/gm,"");
  const submitRun=read("supabase/functions/submit-run/index.ts");
  const frontendSources=["frontend/js/api/supabase.js","frontend/js/api/auth.js","frontend/js/api/profile.js","frontend/js/api/runs.js","frontend/js/api/leaderboard.js"].map(read).join("\n");

  assert.match(rls,/runs_select_own[\s\S]*auth\.uid\(\)\s*=\s*auth_user_id/,"runs 必须继续只允许所有者读取");
  assert.doesNotMatch(rls,/runs[\s\S]{0,120}using\s*\(\s*true\s*\)/i,"禁止对 runs 使用 using(true)");
  assert.match(leaderboardSql,/create view public\.leaderboard[\s\S]*security_barrier\s*=\s*true/i);
  assert.doesNotMatch(leaderboardSql,/security_invoker\s*=\s*true/i,"公共榜单不能继承 runs_select_own");
  assert.match(leaderboardSql,/distinct on \(r\.auth_user_id\)/i,"每位玩家必须只选一局");
  assert.match(leaderboardSql,/r\.net_profit desc[\s\S]*r\.score_sca desc[\s\S]*r\.final_yield desc[\s\S]*r\.finished_at asc/i);
  assert.match(leaderboardSql,/grant select on public\.leaderboard to anon, authenticated/i);
  assert.doesNotMatch(leaderboardSql,/grant\s+(insert|update|delete|all)[^;]*leaderboard/i,"排行榜只能公开 SELECT");
  assert.match(submitRun,/\.eq\("run_id",runId\)\.eq\("auth_user_id",user\.id\)/,"submit-run 必须校验对局所有权");
  assert.match(submitRun,/SUPABASE_(SERVICE_ROLE_KEY|SECRET_KEYS)/,"高权限写入只能位于 Edge Function");
  assert.doesNotMatch(frontendSources,/SUPABASE_(SERVICE_ROLE_KEY|SECRET_KEYS)|service_role|sb_secret_/i,"前端禁止出现高权限 key");

  global.window=global;
  const calls=[];
  const rows=[
    {rank:1,player_name:"玩家B",public_uid:"22222222",net_profit:200,score_sca:88,final_yield:900,tier:"T2"},
    {rank:2,player_name:"玩家A",public_uid:"11111111",net_profit:100,score_sca:86,final_yield:800,tier:"T1"}
  ];
  global.CoffeeGame={
    // Mock 查询链故意不提供 eq()，可检测前端是否重新加入用户过滤。
    backend:{mode:"supabase",client:{from(table){calls.push(["from",table]);return {select(columns){calls.push(["select",columns]);return this},order(column,options){calls.push(["order",column,options]);return Promise.resolve({data:rows,error:null})}}}},rememberError(error){throw error}},
    // 当前玩家公开 UID 用于验证 mine 名次定位。
    profile:{getOrCreate(){return {publicUid:"11111111",playerName:"玩家A"}}},
    // 远端成功时不应访问本地历史；保留空实现作为降级接口。
    runs:{list(){return[]}},
    // 远端 view 已返回 tier，因此本地段位函数只作为必需依赖占位。
    tierForProfit(){return"local"}
  };
  require("../frontend/js/api/leaderboard.js");
  const result=await global.CoffeeGame.leaderboard.get();
  assert.equal(calls[0][1],"leaderboard","前端必须查询公共 view，而不是 runs");
  assert.ok(!calls[1][1].includes("auth_user_id")&&!calls[1][1].includes("run_id"),"前端只读取公开字段");
  assert.equal(result.rows.length,2,"公共榜单必须保留其他玩家成绩");
  assert.equal(result.mine,2,"应按 public_uid 定位自己的公开名次");
  assert.equal(result.source,"supabase");

  console.log("✓ 排行榜公共读取、runs 私有 RLS、Edge Function 所有权校验与前端查询边界通过");
}

main().catch(error=>{console.error(error);process.exitCode=1});
