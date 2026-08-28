/**
 * Supabase Edge Function：为已通过匿名 Auth 的玩家创建服务端对局和随机种子。
 * 浏览器只能获得 run_id/seed，不能自行指定所有者或服务端状态。
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** 验证 Bearer Token，创建 ongoing 对局，并返回公开启动信息。 */
async function handleRequest(request: Request): Promise<Response> {
  const client=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:request.headers.get("Authorization")||""}}});
  const {data:{user}}=await client.auth.getUser();
  if(!user)return new Response(JSON.stringify({error:"unauthorized"}),{status:401,headers:{"content-type":"application/json"}});
  const seed=crypto.getRandomValues(new Uint32Array(1))[0];
  const {data,error}=await client.from("runs").insert({auth_user_id:user.id,seed,status:"ongoing"}).select("run_id,seed").single();
  return new Response(JSON.stringify(error?{error:error.message}:data),{status:error?400:200,headers:{"content-type":"application/json"}});
}

Deno.serve(handleRequest);
