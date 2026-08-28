/** 公共排行榜适配器：在线读取脱敏 leaderboard view，失败时降级为本地历史与演示数据。 */
(function(CG){
  // 无远端数据库时用于构成完整榜单的固定样例数据。
  const samples=[
    {name:"无前",uid:"66666666",profit:8888888,sca:99.9},{name:"天天吃",uid:"99966688",profit:990000,sca:95},{name:"罗伯克春晓",uid:"92045176",profit:128460,sca:87.4},{name:"澜沧江谷风",uid:"15540782",profit:104380,sca:84.7},{name:"核桃林小满",uid:"80623911",profit:88720,sca:86.2},{name:"彝乡咖农_07",uid:"82736145",profit:71390,sca:83.8},{name:"花香上山",uid:"44201568",profit:53600,sca:85.1},{name:"古茶坡庄主",uid:"73029154",profit:39480,sca:82.4},{name:"红土新苗",uid:"10487532",profit:28640,sca:79.7}
  ];

  /** 按净利润、SCA、交割产量、完成时间依次比较两局成绩。 */
  function compareRuns(a,b){return b.profit-a.profit||b.sca-a.sca||(b.finalYield||0)-(a.finalYield||0)||String(a.finishedAt||"").localeCompare(String(b.finishedAt||""))}

  /** 从当前浏览器历史中选出自己的最佳局，并构造离线榜单。 */
  function localLeaderboard(){
    const profile=CG.profile.getOrCreate();
    const finished=CG.runs.list().filter(x=>x.settlement&&!x.settlement.failed).map(r=>({name:profile.playerName||"新庄园主",uid:profile.publicUid,profit:r.settlement.netProfit,sca:r.settlement.score,finalYield:r.settlement.finalYield||0,finishedAt:r.finishedAt,isMe:true}));
    finished.sort(compareRuns);
    const mine=finished[0]||null;
    const list=samples.map(row=>Object.assign({finalYield:0,finishedAt:""},row));
    if(mine)list.push(mine);
    list.sort(compareRuns);
    const rows=list.map((row,index)=>Object.assign({rank:index+1,tier:CG.tierForProfit(row.profit)},row));
    return {rows,mine:mine?rows.find(row=>row===mine||row.isMe)?.rank||null:null,source:"local"};
  }

  CG.leaderboard={
    /**
     * 查询公共只读 view；请求不包含 auth_user_id 过滤，也不会直接读取 runs。
     * @returns {Promise<{rows:object[],mine:(number|null),source:string}>} 排名行和当前玩家名次。
     */
    async get(){
      if(CG.backend.mode==="supabase"&&CG.backend.client){
        const {data,error}=await CG.backend.client.from("leaderboard").select("rank,player_name,public_uid,net_profit,score_sca,final_yield,tier").order("rank",{ascending:true});
        if(!error){
          const profile=CG.profile.getOrCreate();
          const rows=(data||[]).map(row=>({rank:Number(row.rank),name:row.player_name,uid:row.public_uid,profit:Number(row.net_profit),sca:Number(row.score_sca),finalYield:Number(row.final_yield),tier:row.tier}));
          const mine=rows.find(row=>row.uid===profile.publicUid)?.rank||null;
          return {rows,mine,source:"supabase"};
        }
        CG.backend.rememberError(error);
      }
      return localLeaderboard();
    }
  };
})(window.CoffeeGame);
