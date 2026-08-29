/** 本地排行榜聚合模块：将演示样例与当前玩家历史最佳成绩合并排序。 */
(function(CG){
  // 无远端数据库时用于构成完整榜单的固定样例数据。
  const samples=[
    {name:"无前",uid:"66666666",profit:8888888,sca:99.9},{name:"天天吃",uid:"99966688",profit:990000,sca:95},{name:"絮絮",uid:"92245176",profit:0,sca:101},{name:"章鱼",uid:"15540782",profit:-104380,sca:99.9},{name:"核桃林小满",uid:"80623911",profit:88720,sca:86.2},{name:"彝乡咖农_07",uid:"82736145",profit:71390,sca:83.8},{name:"花香上山",uid:"44201568",profit:53600,sca:85.1},{name:"古茶坡庄主",uid:"73029154",profit:39480,sca:82.4},{name:"红土新苗",uid:"10487532",profit:28640,sca:79.7}
  ];
  CG.leaderboard={
    /**
     * 计算当前榜单。每位本地玩家只加入净利润最高的一局，同利润按 SCA 排序。
     * @returns {{rows:object[],mine:(number|null)}} 带名次/段位的行，以及玩家自己的名次。
     */
    get(){const p=CG.profile.getOrCreate();const finished=CG.runs.list().filter(x=>x.settlement&&!x.settlement.failed);let mine=null;for(const r of finished){if(!mine||r.settlement.netProfit>mine.profit)mine={name:p.playerName||"新庄园主",uid:p.publicUid,profit:r.settlement.netProfit,sca:r.settlement.score,isMe:true}}const list=samples.slice();if(mine)list.push(mine);list.sort((a,b)=>b.profit-a.profit||b.sca-a.sca);return {rows:list.map((r,i)=>Object.assign({rank:i+1,tier:CG.tierForProfit(r.profit)},r)),mine:mine?list.findIndex(x=>x===mine)+1:null}}
  };
})(window.CoffeeGame);
