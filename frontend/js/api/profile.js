/** 玩家档案仓库：管理本地匿名 UID、昵称及其持久化。 */
(function(CG){
  const key=CG.config.storagePrefix+":profile";

  /** 生成 10000000–99999999 的八位公开 UID。 */
  function uid(){const n=Math.floor(10000000+Math.random()*90000000);return String(n)}
  CG.profile={
    current:null,

    /** 读取缓存或本地存储；首次访问时自动创建匿名档案。 */
    getOrCreate(){if(this.current)return this.current;try{this.current=JSON.parse(localStorage.getItem(key)||"null")}catch(_){}if(!this.current){this.current={publicUid:uid(),playerName:"",createdAt:new Date().toISOString()};this.save()}return this.current},

    /** 将当前档案写入 localStorage；浏览器禁用存储时保持内存可玩。 */
    save(){try{localStorage.setItem(key,JSON.stringify(this.current))}catch(_){}},

    /**
     * 清理并保存昵称；远端模式同时调用 update-profile，服务端返回的 UID 为最终值。
     * @returns {Promise<object>} 已完成本地与远端同步的玩家档案。
     */
    async updateName(name){
      this.getOrCreate();
      this.current.playerName=(name||"").trim().slice(0,16);
      this.save();
      if(CG.backend.mode==="supabase"&&CG.backend.client&&CG.auth.user){
        const {data,error}=await CG.backend.client.functions.invoke("update-profile",{body:{player_name:this.current.playerName,public_uid:this.current.publicUid}});
        if(error){CG.backend.rememberError(error);throw error}
        if(data?.public_uid)this.current.publicUid=data.public_uid;
        if(data?.player_name)this.current.playerName=data.player_name;
        this.save();
      }
      return this.current;
    }
  };
})(window.CoffeeGame);
