/** 已完成对局仓库：在本地保留最近 30 局，供排行榜选取个人最佳成绩。 */
(function(CG){
  const key=CG.config.storagePrefix+":runs";
  CG.runs={
    /** 返回所有可解析的本地已完成对局；损坏数据按空列表处理。 */
    list(){try{return JSON.parse(localStorage.getItem(key)||"[]")}catch(_){return[]}},

    /** 按 runId 幂等写入一局，只保存排行榜和审计所需的选择、事件及结算摘要。 */
    submit(state){const runs=this.list().filter(r=>r.runId!==state.runId);runs.push({runId:state.runId,choices:state.choices,events:state.events,settlement:state.settlement,finishedAt:state.finishedAt});try{localStorage.setItem(key,JSON.stringify(runs.slice(-30)))}catch(_){}return state.settlement}
  };
})(window.CoffeeGame);
