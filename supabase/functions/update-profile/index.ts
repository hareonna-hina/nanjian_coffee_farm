/**
 * Supabase Edge Function：校验登录身份并创建或更新玩家昵称、八位公开 UID。
 * 服务端始终把写入行绑定到 JWT 用户，不能通过请求体修改其他玩家档案。
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders={
  "access-control-allow-origin":"*",
  "access-control-allow-headers":"authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods":"POST, OPTIONS",
  "content-type":"application/json"
};

/** 从新旧两套 Supabase 环境变量中读取默认 API key。 */
function apiKey(legacyName:string,mapName:string):string{
  const legacy=Deno.env.get(legacyName);
  if(legacy)return legacy;
  try{const mapped=JSON.parse(Deno.env.get(mapName)||"{}");if(mapped.default)return mapped.default}catch(_error){}
  throw new Error(`missing_${legacyName.toLowerCase()}`);
}

/** 创建 JSON 响应，并统一附带跨域响应头。 */
function json(body:unknown,status=200):Response{return new Response(JSON.stringify(body),{status,headers:corsHeaders})}

/** 生成 10000000–99999999 的八位公开 UID。 */
function publicUid():string{return String(crypto.getRandomValues(new Uint32Array(1))[0]%90000000+10000000)}

/** 验证用户与请求体，以服务端权限更新其自己的 profiles 行。 */
async function handleRequest(request: Request): Promise<Response> {
  if(request.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
  if(request.method!=="POST")return json({error:"method_not_allowed"},405);
  try{
    const url=Deno.env.get("SUPABASE_URL")!;
    const authorization=request.headers.get("Authorization")||"";
    const userClient=createClient(url,apiKey("SUPABASE_ANON_KEY","SUPABASE_PUBLISHABLE_KEYS"),{global:{headers:{Authorization:authorization}}});
    const {data:{user},error:userError}=await userClient.auth.getUser();
    if(userError||!user)return json({error:"unauthorized"},401);

    const body=await request.json();
    const playerName=String(body.player_name||"").trim().slice(0,16);
    const requestedUid=/^[0-9]{8}$/.test(String(body.public_uid||""))?String(body.public_uid):null;
    if(!playerName)return json({error:"invalid_player_name"},400);

    const admin=createClient(url,apiKey("SUPABASE_SERVICE_ROLE_KEY","SUPABASE_SECRET_KEYS"),{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:existing,error:lookupError}=await admin.from("profiles").select("public_uid").eq("auth_user_id",user.id).maybeSingle();
    if(lookupError)return json({error:"profile_lookup_failed"},400);

    if(existing){
      const {data,error}=await admin.from("profiles").update({player_name:playerName,updated_at:new Date().toISOString()}).eq("auth_user_id",user.id).select("public_uid,player_name").single();
      return error?json({error:"profile_update_failed"},400):json(data);
    }

    // 首次创建优先沿用客户端已展示的 UID；若发生唯一键冲突则自动换一个服务端 UID。
    let candidate=requestedUid||publicUid();
    for(let attempt=0;attempt<4;attempt+=1){
      const {data,error}=await admin.from("profiles").insert({auth_user_id:user.id,player_name:playerName,public_uid:candidate}).select("public_uid,player_name").single();
      if(!error)return json(data,201);
      if(error.code!=="23505")return json({error:"profile_create_failed"},400);
      candidate=publicUid();
    }
    return json({error:"public_uid_unavailable"},409);
  }catch(error){
    console.error("update-profile",error);
    return json({error:"internal_error"},500);
  }
}

Deno.serve(handleRequest);
