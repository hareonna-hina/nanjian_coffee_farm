/** 对局数据适配器：本地保留最近 30 局，在线时通过 Edge Functions 创建和提交服务端对局。 */
(function(CG){
  const key=CG.config.storagePrefix+":runs";
  CG.runs={
    /** 返回所有可解析的本地已完成对局；损坏数据按空列表处理。 */
    list(){try{return JSON.parse(localStorage.getItem(key)||"[]")}catch(_){return[]}},

    /**
     * 通过 create-run 获取服务器生成的 UUID/seed，并写回当前状态；离线模式返回 null。
     * @param {object} state 刚由 stateStore.create() 创建的状态对象。
     */
    async createRemote(state){
      if(CG.backend.mode!=="supabase"||!CG.backend.client||!CG.auth.user)return null;
      const {data,error}=await CG.backend.client.functions.invoke("create-run",{body:{}});
      if(error){CG.backend.rememberError(error);throw error}
      if(!data?.run_id)throw new Error("create-run returned no run_id");
      state.runId=data.run_id;
      state.seed=data.seed;
      CG.stateStore.save();
      return data;
    },

    /**
     * 先幂等保存本地历史，再把已完成状态提交给 Edge Function；远端只能更新当前用户自己的 run_id。
     * @returns {Promise<object>} 本局 settlement。
     */
    async submit(state){
      const runs=this.list().filter(r=>r.runId!==state.runId);
      runs.push({runId:state.runId,choices:state.choices,events:state.events,settlement:state.settlement,finishedAt:state.finishedAt});
      try{localStorage.setItem(key,JSON.stringify(runs.slice(-30)))}catch(_){}

      const remoteReady=CG.backend.mode==="supabase"&&CG.backend.client&&CG.auth.user&&/^[0-9a-f-]{36}$/i.test(state.runId);
      if(remoteReady){
        const result=state.settlement;
        const body={
          run_id:state.runId,
          choices:state.choices,
          events:state.events,
          final_state:{gold:state.gold,yield:state.yield,health:state.health,potential:state.potential,clarity:state.clarity,tags:state.tags,flags:state.flags},
          settlement:{score_sca:result.score,defect_rate:result.defectRate,final_yield:result.finalYield,buyer_type:result.buyer,unit_price:result.unitPrice,net_profit:result.netProfit}
        };
        const {error}=await CG.backend.client.functions.invoke("submit-run",{body});
        if(error){CG.backend.rememberError(error);throw error}
      }
      return state.settlement;
    }
  };
})(window.CoffeeGame);
