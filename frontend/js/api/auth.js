/**
 * 匿名身份适配模块。
 * 远端模式复用持久化 Session；无 Session 时调用 Supabase Anonymous Auth。
 * Supabase 不可用时仍以本地 profile 的 8 位公开 UID 保证离线可玩。
 */
(function(CG){
  CG.auth={
    user:null,

    /** 确保当前浏览器拥有匿名 Supabase 用户，并始终返回本地玩家档案。 */
    async ensureAnonymous(){
      const profile=CG.profile.getOrCreate();
      if(CG.backend.mode!=="supabase"||!CG.backend.client)return profile;
      try{
        const {data:sessionData,error:sessionError}=await CG.backend.client.auth.getSession();
        if(sessionError)throw sessionError;
        let session=sessionData.session;
        if(!session){
          const {data,error}=await CG.backend.client.auth.signInAnonymously();
          if(error)throw error;
          session=data.session;
        }
        this.user=session?.user||null;
      }catch(error){
        CG.backend.rememberError(error);
        this.user=null;
      }
      return profile;
    }
  };
})(window.CoffeeGame);
