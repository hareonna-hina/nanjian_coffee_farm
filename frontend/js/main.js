/**
 * 应用编排入口。
 * 串联身份、存档、主线、随机事件、终局与 UI；所有规则计算仍委托给 game/engine.js。
 */
(function(CG){
  const store=CG.stateStore;

  /** 完成终局结算、等待本地/远端成绩保存并打开结算卡链；重开时清除旧进度。 */
  async function finishGame(){const result=CG.engine.finish();CG.ui.renderStatus();try{await CG.runs.submit(store.current)}catch(_error){CG.ui.toast("成绩已保存在本机，远端同步失败")};CG.ui.showSettlement(result,()=>{CG.ui.closeModal();store.clear();startNew()})}

  /** 推进状态中的轮次并重绘下一阶段经营页。 */
  function advanceRound(){CG.engine.advance();CG.ui.renderGame()}

  /** 保存当前尚待用户处理的弹窗节点，保证刷新后不会重复结算规则。 */
  function remember(kind,data){store.current.pending=Object.assign({kind},data||{});store.save()}

  /** 跨三个事件池按稳定 ID 找回事件配置，供刷新恢复使用。 */
  function findEvent(id){for(const pool of Object.values(CG.eventPools)){const found=pool.find(e=>e.id===id);if(found)return found}return null}

  /** 结算事件选择；绝收则立即终局，否则提示差值并进入下一轮。 */
  function handleEvent(event,index){const result=CG.engine.chooseEvent(event,index);CG.ui.closeModal();CG.ui.renderStatus();if(result.failed){finishGame();return}const f=CG.format;CG.ui.toast(`事件已结算：资金 ${f.deltaText("gold",result.deltas.gold)} · 产量 ${f.deltaText("yield",result.deltas.yield)}`);advanceRound()}

  /** 主线故事确认后的流程分叉：R1–R3 抽事件、R4 直进 R5、R5 终局。 */
  function afterMainStory(){const s=store.current;CG.ui.renderStatus();if(s.round<=2){const rolled=CG.engine.rollEvent(s.round);if(!rolled){remember("calm");CG.ui.showCalm(advanceRound);return}if(rolled.immune){remember("immune",{eventId:rolled.event.id});CG.ui.showImmune(rolled.event,advanceRound);return}remember("event",{eventId:rolled.event.id});CG.ui.showEvent(rolled.event,index=>handleEvent(rolled.event,index));return}if(s.round===3){advanceRound();return}finishGame()}

  /** 接收决策卡索引并调用规则引擎；成功时展示该选项的故事结算。 */
  function chooseRound(index){const result=CG.engine.chooseRound(index);if(!result)return;if(result.failed){finishGame();return}CG.ui.showStory(result,afterMainStory)}

  /** 创建全新状态；在线时先取得服务端 run_id/seed，再进入 R1。 */
  async function startNew(){const state=store.create();try{await CG.runs.createRemote(state)}catch(_error){CG.ui.toast("远端开局失败，本局将保存在本机")};CG.ui.renderGame()}

  /**
   * 根据 pending 恢复刷新前的故事/平静/免疫/事件弹窗。
   * @returns {boolean} 是否成功恢复了一个待处理节点。
   */
  function resumePending(){const p=store.current.pending;if(!p)return false;if(p.kind==="story"){const round=CG.rounds.find(r=>r.id===p.roundId),option=round&&round.options.find(o=>o.key===p.optionKey);if(round&&option){CG.ui.showStory(Object.assign({round,option},p),afterMainStory);return true}}if(p.kind==="calm"){CG.ui.showCalm(advanceRound);return true}const event=findEvent(p.eventId);if(p.kind==="immune"&&event){CG.ui.showImmune(event,advanceRound);return true}if(p.kind==="event"&&event){CG.ui.showEvent(event,index=>handleEvent(event,index));return true}return false}

  /** 开始按钮处理器：存在有效未完成对局则续玩，否则等待服务端新建一局。 */
  async function startOrResume(){const s=store.current;if(s.status==="ongoing"&&s.choices.length&&s.round<5){CG.ui.renderGame();if(!resumePending()&&s.choices.some(c=>c.round===CG.rounds[s.round].id))afterMainStory()}else await startNew()}

  // UI 只依赖这三个应用级动作，避免直接调用内部流程函数。
  CG.app={chooseRound,startNew,finishGame};

  /** 初始化画布、匿名身份、存档、开始页与所有静态入口事件。 */
  async function init(){CG.viewport.fit();await CG.auth.ensureAnonymous();store.load();CG.ui.showStart();document.getElementById("start-button").addEventListener("click",startOrResume);document.getElementById("help-button").addEventListener("click",CG.ui.showHelp);document.querySelectorAll("[data-open]").forEach(btn=>btn.addEventListener("click",()=>{const what=btn.dataset.open;if(what==="knowledge")CG.ui.showKnowledge();if(what==="leaderboard")CG.ui.showLeaderboard();if(what==="profile")CG.ui.showProfile();if(what==="tags")CG.ui.showTags()}));const p=CG.profile.getOrCreate();if(!p.playerName)CG.ui.showProfile(true)}

  // 兼容脚本位于 body 末尾和异步加载两种场景，保证 init 只在 DOM 可用后执行。
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})(window.CoffeeGame);
