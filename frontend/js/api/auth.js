/**
 * 匿名身份适配模块。
 * 当前本地模式以 profile 模块生成的 8 位公开 UID 作为匿名身份；接口保持异步以兼容未来 Supabase Auth。
 */
(function(CG){
  CG.auth={
    /** 确保当前浏览器拥有可用身份，并返回玩家档案。 */
    async ensureAnonymous(){return CG.profile.getOrCreate()}
  };
})(window.CoffeeGame);
