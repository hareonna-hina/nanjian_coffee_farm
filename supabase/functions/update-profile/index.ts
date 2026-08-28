/**
 * Supabase Edge Function：校验登录身份并创建或更新玩家昵称、八位公开 UID。
 * 数据库约束仍会对唯一性和长度做最后一道校验。
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/** 验证用户与请求体，执行 profiles.upsert 并返回公开档案字段。 */
async function handleRequest(request: Request): Promise<Response> {
  const client=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:request.headers.get("Authorization")||""}}});
  const {data:{user}}=await client.auth.getUser();
  if(!user)return new Response(JSON.stringify({error:"unauthorized"}),{status:401,headers:{"content-type":"application/json"}});
  const body=await request.json();
  const playerName=String(body.player_name||"").trim().slice(0,16);
  if(!playerName)return new Response(JSON.stringify({error:"invalid player_name"}),{status:400,headers:{"content-type":"application/json"}});
  const publicUid=String(crypto.getRandomValues(new Uint32Array(1))[0]%90000000+10000000);
  const {data,error}=await client.from("profiles").upsert({auth_user_id:user.id,player_name:playerName,public_uid:body.public_uid||publicUid,updated_at:new Date().toISOString()}).select("public_uid,player_name").single();
  return new Response(JSON.stringify(error?{error:error.message}:data),{status:error?400:200,headers:{"content-type":"application/json"}});
}

Deno.serve(handleRequest);
