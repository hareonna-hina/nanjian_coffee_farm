/**
 * Supabase 客户端适配器。
 * 仅使用可公开的 URL/publishable key；配置或 SDK 不可用时保留完整本地玩法。
 */
(function(CG){
  const configured=Boolean(CG.config.supabaseUrl&&CG.config.supabasePublishableKey);
  const sdk=window.supabase;
  const client=configured&&sdk?sdk.createClient(CG.config.supabaseUrl,CG.config.supabasePublishableKey,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  }):null;
  CG.backend={
    mode:client?"supabase":"local",
    client,
    lastError:null,

    /** 记录最近一次远端错误，供 UI 降级提示和排障使用。 */
    rememberError(error){this.lastError=error;console.error("Supabase request failed",error)}
  };
})(window.CoffeeGame);
