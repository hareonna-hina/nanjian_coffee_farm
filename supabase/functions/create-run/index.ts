/**
 * Supabase Edge Function：为已通过匿名 Auth 的玩家创建服务端对局和随机种子。
 * 浏览器只能获得 run_id/seed，不能自行指定所有者、随机种子或服务端状态。
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

/** 验证 Bearer Token，以服务端密钥创建 ongoing 对局，并返回公开启动信息。 */
async function handleRequest(request: Request): Promise<Response> {
  if(request.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
  if(request.method!=="POST")return json({error:"method_not_allowed"},405);
  try{
    const url=Deno.env.get("SUPABASE_URL")!;
    const authorization=request.headers.get("Authorization")||"";
    const userClient=createClient(url,apiKey("SUPABASE_ANON_KEY","SUPABASE_PUBLISHABLE_KEYS"),{global:{headers:{Authorization:authorization}}});
    const {data:{user},error:userError}=await userClient.auth.getUser();
    if(userError||!user)return json({error:"unauthorized"},401);

    // Admin client 只存在于 Edge Function 内，绕过 RLS 写入服务器生成的所有者和 seed。
    const admin=createClient(url,apiKey("SUPABASE_SERVICE_ROLE_KEY","SUPABASE_SECRET_KEYS"),{auth:{persistSession:false,autoRefreshToken:false}});
    const seed=crypto.getRandomValues(new Uint32Array(1))[0];
    const {data,error}=await admin.from("runs").insert({auth_user_id:user.id,seed,status:"ongoing"}).select("run_id,seed").single();
    return error?json({error:"create_run_failed"},400):json(data,201);
  }catch(error){
    console.error("create-run",error);
    return json({error:"internal_error"},500);
  }
}

Deno.serve(handleRequest);
