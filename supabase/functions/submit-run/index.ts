/**
 * Supabase Edge Function 安全占位：远端权威复算尚未部署前，明确拒绝客户端提交分数。
 * 正式启用时必须从选择日志和服务端 seed 重放规则，不能信任浏览器上传的结算数字。
 */
function handleRequest(): Response {
  return new Response(JSON.stringify({
  error:"server_recalculation_not_configured",
  message:"Deploy the shared authoritative rule module before accepting remote scores."
  }),{status:501,headers:{"content-type":"application/json"}});
}

Deno.serve(handleRequest);
