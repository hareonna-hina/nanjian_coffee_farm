/**
 * 后端模式选择器。
 * 未配置 Supabase URL/Publishable Key 时使用完整本地模式；该对象为后续远端适配预留统一入口。
 */
(function(CG){
  CG.backend={mode:CG.config.supabaseUrl&&CG.config.supabasePublishableKey?"supabase":"local",client:null};
})(window.CoffeeGame);
