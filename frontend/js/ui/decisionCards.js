/** 主线决策卡模块：将当前 Round 的三个选项渲染为可点击卡片。 */
(function(CG){
  CG.ui=CG.ui||{};
  /** 渲染选项的公开提示，并把点击索引交回 main.js 编排层。 */
  CG.ui.renderDecisions=function(round,onChoose){const root=document.getElementById("decision-list");root.innerHTML=round.options.map((o,i)=>`<button class="decision-card" type="button" data-option="${i}" aria-label="选择 ${o.title}"><img src="${o.image}" alt="" loading="eager" fetchpriority="high" decoding="async"><span class="decision-copy"><h2>${o.key}. ${o.title}</h2><p>${o.short}</p></span><span class="decision-effects"><span class="cost">${o.cost}</span>${o.trends.slice(0,2).map(t=>`<span>${t}</span>`).join("")}</span></button>`).join("");root.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>onChoose(Number(btn.dataset.option))))};
})(window.CoffeeGame);
