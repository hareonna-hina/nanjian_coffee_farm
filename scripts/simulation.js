/**
 * Monte Carlo 数值模拟入口。
 * 在 Node 中构造最小浏览器环境，复用生产规则引擎随机跑局并输出分布，不复制任何游戏公式。
 */
const path=require("node:path");
// 为经典浏览器脚本提供 window/location/crypto/localStorage 兼容层。
global.window=global;
global.location={search:""};
global.crypto=require("node:crypto").webcrypto;
global.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
[
  "../frontend/js/config.js","../frontend/js/game/tags.js","../frontend/js/game/rounds.js","../frontend/js/game/events.js",
  "../frontend/js/game/state.js","../frontend/js/utils/format.js","../frontend/js/utils/random.js","../frontend/js/game/settlement.js","../frontend/js/game/engine.js"
].forEach(p=>require(path.join(__dirname,p)));
const CG=global.CoffeeGame;
const runs=Math.max(1,Number(process.argv[2])||100000);
const stats={scores:[],profits:[],health:[],yield:[],buyers:{},tiers:{},topChoices:Array.from({length:5},()=>[0,0,0])};
const records=[];
// 每一局在五轮中随机选主线和事件选项，提前绝收则立即停止该局。
for(let n=0;n<runs;n++){
  CG.stateStore.create();
  const choices=[];
  for(let round=0;round<5;round++){
    const choice=Math.floor(Math.random()*3);choices.push(choice);CG.engine.chooseRound(choice);
    if(CG.stateStore.current.health<=0)break;
    if(round<=2){const rolled=CG.engine.rollEvent(round);if(rolled&&!rolled.immune)CG.engine.chooseEvent(rolled.event,Math.floor(Math.random()*3))}
    if(CG.stateStore.current.health<=0)break;
    if(round<4)CG.engine.advance();
  }
  const out=CG.engine.finish();records.push({out,choices});stats.scores.push(out.score);stats.profits.push(out.netProfit);stats.health.push(CG.stateStore.current.health);stats.yield.push(out.finalYield);stats.buyers[out.buyer]=(stats.buyers[out.buyer]||0)+1;stats.tiers[out.tier]=(stats.tiers[out.tier]||0)+1;
}
// 利润前 10% 路线用于观察最优策略是否过度集中。
records.sort((a,b)=>b.out.netProfit-a.out.netProfit);for(const r of records.slice(0,Math.ceil(runs*.1)))r.choices.forEach((c,i)=>stats.topChoices[i][c]++);
/** 汇总一组样本的最小值、中位数、P90、最大值与均值。 */
function summary(arr){const sorted=arr.slice().sort((a,b)=>a-b),mean=arr.reduce((a,b)=>a+b,0)/arr.length;return {min:+sorted[0].toFixed(1),p50:+sorted[Math.floor(sorted.length*.5)].toFixed(1),p90:+sorted[Math.floor(sorted.length*.9)].toFixed(1),max:+sorted.at(-1).toFixed(1),mean:+mean.toFixed(1)}}
// 输出机器可读 JSON，便于保存基线或交给其他分析工具。
console.log(JSON.stringify({runs,scoreSCA:summary(stats.scores),netProfit:summary(stats.profits),health:summary(stats.health),finalYield:summary(stats.yield),buyers:stats.buyers,tiers:stats.tiers,top10ChoiceCounts:stats.topChoices},null,2));
