/**
 * Supabase Edge Function：验证调用者和对局所有权，再以服务端权限写入终局成绩。
 * 客户端永远不能直接 UPDATE runs，也不能提交其他玩家的 run_id。
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

/** 判断值是否为指定闭区间内的有限数。 */
function numberIn(value:unknown,min:number,max:number):value is number{return typeof value==="number"&&Number.isFinite(value)&&value>=min&&value<=max}

/** 只保留服务端允许持久化的主线选择字段，拒绝异常数量或结构。 */
function normalizeChoices(value:unknown):Array<Record<string,unknown>>|null{
  if(!Array.isArray(value)||value.length<1||value.length>5)return null;
  const rows=[];
  for(const item of value){
    if(!item||typeof item!=="object")return null;
    const row=item as Record<string,unknown>;
    if(typeof row.round!=="string"||!/^R[1-5]$/.test(row.round)||typeof row.option!=="string"||!/^[ABC]$/.test(row.option))return null;
    rows.push({round:row.round,option:row.option,at:typeof row.at==="string"?row.at:null});
  }
  return rows;
}

/** 只保留服务端允许持久化的随机事件日志字段。 */
function normalizeEvents(value:unknown):Array<Record<string,unknown>>|null{
  if(!Array.isArray(value)||value.length>3)return null;
  const rows=[];
  for(const item of value){
    if(!item||typeof item!=="object")return null;
    const row=item as Record<string,unknown>;
    if(!numberIn(row.slot,0,2)||!Number.isInteger(row.slot)||typeof row.event!=="string"||row.event.length>64||!numberIn(row.option,0,2)||!Number.isInteger(row.option))return null;
    rows.push({slot:row.slot,event:row.event,option:row.option,at:typeof row.at==="string"?row.at:null});
  }
  return rows;
}

/** 验证并裁剪终局状态，防止任意 JSON 或超大字段进入数据库。 */
function normalizeFinalState(value:unknown):Record<string,unknown>|null{
  if(!value||typeof value!=="object")return null;
  const state=value as Record<string,unknown>;
  if(!numberIn(state.gold,-1000000000,1000000000)||!numberIn(state.yield,0,3000)||!numberIn(state.health,0,100)||!numberIn(state.potential,0,100)||!numberIn(state.clarity,0,100))return null;
  if(!Array.isArray(state.tags)||state.tags.length>40||state.tags.some(tag=>typeof tag!=="string"||tag.length>64))return null;
  return {gold:state.gold,yield:state.yield,health:state.health,potential:state.potential,clarity:state.clarity,tags:state.tags,flags:state.flags&&typeof state.flags==="object"?state.flags:{}};
}

/**
 * 验证匿名用户，确认 run_id 属于该用户且仍在进行中，然后写入完成数据。
 * 写入后同步 profiles.best_run_id；排行榜视图自身也会独立重算每位玩家最佳局。
 */
async function handleRequest(request:Request):Promise<Response>{
  if(request.method==="OPTIONS")return new Response("ok",{headers:corsHeaders});
  if(request.method!=="POST")return json({error:"method_not_allowed"},405);
  try{
    const url=Deno.env.get("SUPABASE_URL")!;
    const authorization=request.headers.get("Authorization")||"";
    const userClient=createClient(url,apiKey("SUPABASE_ANON_KEY","SUPABASE_PUBLISHABLE_KEYS"),{global:{headers:{Authorization:authorization}}});
    const {data:{user},error:userError}=await userClient.auth.getUser();
    if(userError||!user)return json({error:"unauthorized"},401);

    const body=await request.json();
    if(JSON.stringify(body).length>100000)return json({error:"payload_too_large"},413);
    const runId=String(body.run_id||"");
    const choices=normalizeChoices(body.choices);
    const events=normalizeEvents(body.events);
    const finalState=normalizeFinalState(body.final_state);
    const settlement=body.settlement&&typeof body.settlement==="object"?body.settlement as Record<string,unknown>:null;
    const validRunId=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(runId);
    if(!settlement
      ||!numberIn(settlement.score_sca,0,100)
      ||!numberIn(settlement.defect_rate,0,1)
      ||!numberIn(settlement.final_yield,0,3000)
      ||typeof settlement.buyer_type!=="string"||settlement.buyer_type.length>100
      ||!numberIn(settlement.unit_price,0,100000)
      ||!numberIn(settlement.net_profit,-1000000000,1000000000)
    )return json({error:"invalid_settlement"},400);
    if(!validRunId||!choices||!events||!finalState)return json({error:"invalid_payload"},400);

    // 该客户端不继承用户 Authorization，因此 service/secret key 保持管理员权限且只存在服务端。
    const admin=createClient(url,apiKey("SUPABASE_SERVICE_ROLE_KEY","SUPABASE_SECRET_KEYS"),{auth:{persistSession:false,autoRefreshToken:false}});
    const {data:existing,error:findError}=await admin.from("runs").select("run_id,status,score_sca,final_yield,net_profit").eq("run_id",runId).eq("auth_user_id",user.id).maybeSingle();
    if(findError)return json({error:"run_lookup_failed"},400);
    if(!existing)return json({error:"run_not_found"},404);
    if(existing.status==="finished")return json({run:existing,duplicate:true});
    if(existing.status!=="ongoing")return json({error:"run_not_ongoing"},409);

    const finishedAt=new Date().toISOString();
    const {data:completed,error:updateError}=await admin.from("runs").update({
      choices,
      events,
      final_state:finalState,
      score_sca:settlement.score_sca,
      defect_rate:settlement.defect_rate,
      final_yield:settlement.final_yield,
      buyer_type:settlement.buyer_type,
      unit_price:settlement.unit_price,
      net_profit:Math.round(settlement.net_profit as number),
      status:"finished",
      finished_at:finishedAt
    }).eq("run_id",runId).eq("auth_user_id",user.id).eq("status","ongoing").select("run_id,status,score_sca,final_yield,net_profit,finished_at").maybeSingle();
    if(updateError||!completed)return json({error:"submit_run_failed"},409);

    // 兼容仍依赖 best_run_id 的旧代码；005 视图不依赖这个指针，避免并发短暂不一致影响榜单。
    const {data:best}=await admin.from("runs").select("run_id").eq("auth_user_id",user.id).eq("status","finished").order("net_profit",{ascending:false}).order("score_sca",{ascending:false}).order("final_yield",{ascending:false}).order("finished_at",{ascending:true}).limit(1).maybeSingle();
    if(best)await admin.from("profiles").update({best_run_id:best.run_id,updated_at:finishedAt}).eq("auth_user_id",user.id);

    return json({run:completed,best_run_id:best?.run_id||completed.run_id});
  }catch(error){
    console.error("submit-run",error);
    return json({error:"internal_error"},500);
  }
}

Deno.serve(handleRequest);
