/**
 * 核心规则引擎。
 * 只负责读取配置、改变 stateStore、生成可供 UI 展示的结果；本模块不直接操作 DOM。
 */
(function(CG){
  const store=CG.stateStore;

  /** 将数值限制在闭区间内。 */
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));

  /**
   * 把一组资源效果应用到当前状态，并执行“活力低于 50 时正向风味增益减半”的疲劳规则。
   * @param {object} effects 资源增减量及可选的产量乘数。
   */
  function applyEffects(effects){
    const s=store.current,e=effects||{};
    const potentialGain=e.potential>0&&s.health<50?e.potential*.5:e.potential||0;
    s.gold+=(e.gold||0);s.yield+=(e.yield||0);s.health+=(e.health||0);s.potential+=potentialGain;s.clarity+=(e.clarity||0);
    if(e.yieldMultiplier!=null)s.yield*=e.yieldMultiplier;
    normalize();
  }

  /** 将活力、风味、纯净度限制为 0–100，产量限制为 0–3000。 */
  function normalize(){const s=store.current;s.health=clamp(s.health,0,100);s.potential=clamp(s.potential,0,100);s.clarity=clamp(s.clarity,0,100);s.yield=clamp(s.yield,0,3000)}

  /** 首次进入 0–29 活力区间时，添加濒死标签并结算一次性纯净/产量惩罚。 */
  function criticalCheck(){const s=store.current;if(s.health>0&&s.health<30&&!store.hasTag("dying")){store.addTag("dying");s.clarity-=10;s.yield*=.85;normalize()}}

  /** 批量添加标签，并同步卡蒂姆的叶锈病免疫标志。 */
  function addTags(ids){(ids||[]).forEach(id=>{store.addTag(id);if(id==="rust_immune")store.current.flags.immuneRust=true})}

  /**
   * 根据 R5 处理法和原料门槛生成唯一风味标签；水洗同时清除药剂残留。
   * @returns {string} 实际授予的风味标签 ID。
   */
  function processTag(process){const s=store.current;let id;if(process==="washed"){store.removeTag("residue");if(s.potential>=80&&s.clarity>=80)id="washed_legend";else if(s.clarity>=60)id="washed_clean";else id="washed_tea"}
    if(process==="natural"){if(s.potential>=80&&s.clarity>=75)id="natural_legend";else if(s.clarity>=70)id="natural_nut";else id="natural_earth"}
    if(process==="anaerobic"){if(s.potential>=85&&s.clarity>=85&&store.hasTag("zero_defect"))id="anaerobic_legend";else if(s.potential>=70&&s.clarity>=75)id="anaerobic_wine";else id="anaerobic_fail"}
    store.addTag(id);return id;
  }

  /** 执行依赖当前活力或已有标签的事件条件分支。 */
  function conditional(effectId){const s=store.current;
    if(effectId==="drought_mulch")applyEffects({yield:store.hasTag("mountain_mist")?0:-40});
    if(effectId==="drought_gamble")applyEffects(s.health>=70?{yield:-30}:{health:-15,yield:-80,potential:-4});
    if(effectId==="frost_gamble")applyEffects(store.hasTag("mountain_mist")?{health:-5}:{health:-15,yield:-90});
    if(effectId==="fire_gamble")applyEffects(s.health>=80?{yield:-40}:{health:-20,yield:-100,clarity:-8});
    if(effectId==="rust_gamble"){if(s.health>=65)applyEffects({yield:-60});else{applyEffects({health:-30,yieldMultiplier:.65,clarity:-15});store.addTag("dying")}}
  }

  /** 计算两份轻量状态快照之间的五项资源差值。 */
  function delta(before,after){return {gold:after.gold-before.gold,yield:after.yield-before.yield,health:after.health-before.health,potential:after.potential-before.potential,clarity:after.clarity-before.clarity}}

  /**
   * 结算当前轮的一个主线选项，并持久化选择日志和待展示故事。
   * @returns {object|null} 结算结果；非法、重复或已结束的选择返回 null。
   */
  function chooseRound(optionIndex){const s=store.current,round=CG.rounds[s.round],option=round.options[optionIndex];if(!option||s.status!=="ongoing"||s.choices.some(c=>c.round===round.id))return null;const before=store.snapshot();applyEffects(option.effects);addTags(option.tags);let flavor=null;if(option.process)flavor=processTag(option.process);criticalCheck();const after=store.snapshot();const gained=after.tags.filter(id=>!before.tags.includes(id));const result={round,option,before,after,deltas:delta(before,after),gained,flavor,failed:s.health<=0};s.choices.push({round:round.id,option:option.key,at:new Date().toISOString()});s.pending={kind:"story",roundId:round.id,optionKey:option.key,before,after,deltas:result.deltas,gained,flavor,failed:result.failed};store.save();return result}

  /** 计算指定事件轮的平静/奇遇/危机概率，并应用 R2 遮阴路线修正。 */
  function eventProbabilities(slot){let calm=.52,boon=.192,crisis=.288;if(slot===1&&store.hasTag("walnut_shade")){calm-=.05;boon+=.05}if(slot===1&&store.hasTag("full_sun")){calm-=.05;crisis+=.05}return {calm,boon,crisis}}

  /** 按事件权重随机抽取一项，同时叠加风土标签和低活力风险修正。 */
  function selectWeighted(items){const adjusted=items.map(x=>{let w=x.weight;if(x.type==="crisis"&&x.id==="crisis_frost"&&store.hasTag("mountain_mist"))w*=1.5;if(x.type==="crisis"&&x.id==="crisis_drought"&&store.hasTag("rust_immune"))w*=1.5;if(x.id==="crisis_forest_fire"&&store.hasTag("full_sun"))w*=1.5;if(store.current.health<50&&(x.id.includes("rust")||x.id==="crisis_berry_borer"))w*=2;return {x,w}});const total=adjusted.reduce((a,b)=>a+b.w,0);let roll=CG.random.value()*total;for(const item of adjusted){roll-=item.w;if(roll<=0)return item.x}return adjusted[adjusted.length-1].x}

  /**
   * 为 R1–R3 做一次随机事件判定。
   * @returns {null|{immune:boolean,event:object}} null 表示风调雨顺。
   */
  function rollEvent(slot){const probs=eventProbabilities(slot),r=CG.random.value();if(r<probs.calm)return null;const type=r<probs.calm+probs.boon?"boon":"crisis";const pool=CG.eventPools[slot].filter(e=>e.type===type);const event=selectWeighted(pool);if(event.id.includes("rust")&&store.current.flags.immuneRust)return {immune:true,event};return {immune:false,event}}

  /** 结算事件选项，记录事件日志，并返回资源差值与绝收状态。 */
  function chooseEvent(event,optionIndex){const option=event.options[optionIndex];if(!option)return null;const before=store.snapshot();applyEffects(option.effects);if(option.conditional)conditional(option.conditional);addTags(option.tags);if(option.flags)Object.assign(store.current.flags,option.flags);criticalCheck();const after=store.snapshot();store.current.events.push({slot:store.current.round,event:event.id,option:optionIndex,at:new Date().toISOString()});store.save();return {event,option,before,after,deltas:delta(before,after),failed:store.current.health<=0}}

  /** 清除待处理弹窗并推进到下一轮。 */
  function advance(){store.current.pending=null;store.current.round+=1;store.save()}

  /** 调用终局公式、标记对局完成并持久化最终状态。 */
  function finish(){const s=store.current;s.pending=null;s.settlement=CG.calculateSettlement(s);s.status="finished";s.finishedAt=new Date().toISOString();store.save();return s.settlement}

  // 仅暴露编排层和测试所需的稳定规则接口。
  CG.engine={applyEffects,normalize,chooseRound,rollEvent,chooseEvent,advance,finish,eventProbabilities};
})(window.CoffeeGame);
