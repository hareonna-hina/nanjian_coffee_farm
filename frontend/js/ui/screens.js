/**
 * 页面与通用弹窗编排模块。
 * 负责开始页/经营页切换、通用弹窗生命周期，以及帮助、档案、故事和平静/免疫结果卡。
 */
(function(CG){
  CG.ui=CG.ui||{};
  /** 获取唯一弹窗挂载节点。 */
  const root=()=>document.getElementById("modal-root");
  /** 关闭并清空当前弹窗，然后执行可选的返回回调。 */
  CG.ui.closeModal=function(onClose){root().classList.remove("is-open");root().innerHTML="";if(onClose)onClose()};
  /** 注入弹窗 HTML、绑定关闭按钮并把焦点移到第一个可交互控件。 */
  CG.ui.openModal=function(html,closable=true,onClose){const r=root();r.innerHTML=`<div class="modal-overlay">${html}</div>`;r.classList.add("is-open");if(closable)r.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>CG.ui.closeModal(onClose)));const focus=r.querySelector("button,input");if(focus)setTimeout(()=>focus.focus(),0)};
  /** 显示 1.9 秒的非阻塞状态提示；新消息会覆盖旧计时器。 */
  CG.ui.toast=function(message){const t=document.getElementById("toast");t.textContent=message;t.classList.add("is-visible");clearTimeout(CG.ui.toastTimer);CG.ui.toastTimer=setTimeout(()=>t.classList.remove("is-visible"),1900)};
  /** 切换到开始页，并根据存档决定主按钮显示“开始”还是“继续”。 */
  CG.ui.showStart=function(){document.getElementById("start-screen").classList.add("is-active");document.getElementById("game-screen").classList.remove("is-active");const p=CG.profile.getOrCreate();document.getElementById("player-chip").textContent=p.playerName?`${p.playerName} · UID ${p.publicUid}`:`新庄园主 · UID ${p.publicUid}`;const s=CG.stateStore.current;document.getElementById("start-button").textContent=s.status==="ongoing"&&s.choices.length?"继续经营":"开始经营"};
  /** 切换到经营页，并按当前 round 重绘主视觉、标题、状态和决策卡。 */
  CG.ui.renderGame=function(){const s=CG.stateStore.current,round=CG.rounds[s.round]||CG.rounds[4];document.getElementById("start-screen").classList.remove("is-active");document.getElementById("game-screen").classList.add("is-active");document.getElementById("stage-image").src=round.visual;document.getElementById("round-title").textContent=round.title;document.getElementById("round-story").textContent=round.story;CG.ui.renderStatus();CG.ui.renderDecisions(round,CG.app.chooseRound)};
  /** 打开昵称/UID 卡；required=true 时禁止关闭，确保首次进入先完成昵称。 */
  CG.ui.showProfile=function(required=false){const p=CG.profile.getOrCreate(),safe=CG.format.html;CG.ui.openModal(`<article class="modal-card profile-modal" role="dialog" aria-modal="true" aria-label="庄园主身份">${required?"":`<button class="modal-close" type="button" data-close aria-label="关闭">×</button>`}<h2>庄园主档案</h2><label for="player-name">庄园主昵称</label><input id="player-name" maxlength="16" value="${safe(p.playerName||"")}" placeholder="例如：无量山咖农_07"><div class="profile-uid">UID ${safe(p.publicUid)}</div><button class="primary-button" type="button" data-save-profile>保存昵称</button></article>`,!required);const input=document.getElementById("player-name"),button=document.querySelector("[data-save-profile]");button.addEventListener("click",async()=>{if(!input.value.trim()){CG.ui.toast("请先输入一个庄园主昵称");input.focus();return}button.disabled=true;button.textContent="保存中…";try{await CG.profile.updateName(input.value);CG.ui.closeModal();CG.ui.showStart()}catch(_error){button.disabled=false;button.textContent="保存昵称";CG.ui.toast("昵称同步失败，请检查网络后重试")}})};
  // 四张静态帮助卡对应目标、流程、指标与结算规则。
  const helpPages=[
    {tab:"玩法目标",title:"如何开始经营庄园？",html:"<p style='text-indent:2em;'>你将通过 5 个阶段经营无量山咖啡庄园，在风土选择、农艺管理、采收与处理之间做出决策，目标是在终局获得更高净利润。</p><ul><li>经营流程：主线选择 → 故事结算 → 随机事件 → 下一阶段。</li><li>最终按照净利润排名，同分再比较 SCA 与交割产量。</li></ul>"},
    {tab:"经营流程",title:"五个关键阶段",html:"<ul><li>R1 建园：选择海拔与品种。</li><li>R2 生长：建立遮阴或混种体系。</li><li>R3 开花：平衡授粉、挂果与疏果。</li><li>R4 采收：决定成熟度与采摘效率。</li><li>R5 处理：水洗、日晒或厌氧，定型杯中风味。</li></ul><p style='text-indent:2em;'>前三轮结束后各有一次随机事件判定。</p>"},
    {tab:"指标说明",title:"看懂庄园状态",html:"<ul><li>流动资金：允许透支，负数会成为经营垫资。</li><li>预计产量：最终还要扣除瑕疵损耗。</li><li>树体活力：低于 50% 时正向风味增益减半；低于 30% 会濒死。</li><li>风味潜力 / 纯净度：只展示五档状态，不显示后台精确值。</li><li>标签：记录机制、生态认证、风味与惩罚。</li></ul>"},
    {tab:"结算排行",title:"市场怎样给你的豆子定价？",html:"<p style='text-indent:2em;'>终局先根据风味潜力、纯净度和标签计算 SCA，再扣除物理瑕疵，匹配竞拍团、独立烘焙商、商业连锁或大宗工厂。</p><p style='text-indent:2em;'>生态认证会提高最终单价；药剂微残留会让所有生态溢价归零。初始资金为 ¥30,000；净利润扣除初始本金与 ¥800 固定折旧费，负债按本金的 1.2 倍偿还后进入排行榜。</p>"}
  ];
  /** 打开帮助弹窗，并在四个页签间局部重绘。 */
  CG.ui.showHelp=function(){
    let active=0;
    /** 按 active 重建帮助卡，并给页签重新绑定切页事件。 */
    const render=()=>{const p=helpPages[active];CG.ui.openModal(`<article class="modal-card info-modal" role="dialog" aria-modal="true" aria-label="帮助"><button class="modal-close" type="button" data-close aria-label="关闭">×</button><nav class="info-tabs">${helpPages.map((x,i)=>`<button type="button" data-help="${i}" class="${i===active?"is-active":""}">${x.tab}</button>`).join("")}</nav><section class="info-body modal-scroll"><h2>${p.title}</h2>${p.html}<p class="pager">❧　${active+1} / 4　❧</p></section></article>`,true);document.querySelectorAll("[data-help]").forEach(b=>b.addEventListener("click",()=>{active=Number(b.dataset.help);render()}))};
    render();
  };
  /** 展示主线叙事、资源差值和新标签；确认后交回 main.js 继续事件判定。 */
  CG.ui.showStory=function(result,onContinue){const d=result.deltas,f=CG.format;CG.ui.openModal(`<article class="story-card" role="dialog" aria-modal="true" aria-label="本轮结算"><h2 class="story-title">${result.round.id} · ${result.option.title}</h2><div class="story-text modal-scroll">${result.option.story}</div><div class="round-deltas"><span>${f.deltaText("gold",d.gold)}</span><span>${f.deltaText("yield",d.yield)}</span><span>${f.deltaText("health",d.health)}</span><span>${f.deltaText("potential",d.potential)}</span><span>${f.deltaText("clarity",d.clarity)}</span></div><div class="story-tag">${result.gained.length?result.gained.map(id=>`${CG.tags[id].icon} <b>${CG.tags[id].name}</b><br><small>${CG.tags[id].effect}</small>`).join("<br>"):"本轮未获得新标签"}</div><button class="primary-button" type="button" data-story-continue>继续经营</button></article>`,false);document.querySelector("[data-story-continue]").addEventListener("click",()=>{CG.ui.closeModal();onContinue()})};
  /** 展示“未抽中额外事件”的平静结果，并提供进入下一阶段按钮。 */
  CG.ui.showCalm=function(onContinue){CG.ui.openModal(`<article class="modal-card windfall-card" role="dialog" aria-modal="true"><h2>🍃 风调雨顺</h2><p>山风与雨水都恰到好处，这一阶段没有额外事件。庄园在平稳节奏中继续生长。</p><button class="primary-button" type="button" data-calm>进入下一阶段</button></article>`,false);document.querySelector("[data-calm]").addEventListener("click",()=>{CG.ui.closeModal();onContinue()})};
  /** 展示卡蒂姆对叶锈病的无损免疫结果，并继续下一阶段。 */
  CG.ui.showImmune=function(event,onContinue){CG.ui.openModal(`<article class="modal-card windfall-card" role="dialog" aria-modal="true"><h2>🛡️ 抗病免灾</h2><p>${event.title}来袭，但梯田卡蒂姆的抗病基因让叶片保持健康。没有资源损失，也无需额外处理。</p><button class="primary-button" type="button" data-calm>进入下一阶段</button></article>`,false);document.querySelector("[data-calm]").addEventListener("click",()=>{CG.ui.closeModal();onContinue()})};
})(window.CoffeeGame);
