/** 随机事件弹窗模块：显示事件叙事和三个应对选项。 */
(function(CG){
  CG.ui=CG.ui||{};
  /** 打开不可直接关闭的事件卡，并把玩家选择的索引交给编排层结算。 */
  CG.ui.showEvent=function(event,onChoose){CG.ui.openModal(`<article class="event-card" role="dialog" aria-modal="true" aria-label="突发事件：${event.title}"><img class="event-image" src="${event.image}" alt="${event.title}" loading="eager" fetchpriority="high" decoding="async"><section class="event-copy modal-scroll"><h2>${event.type==="crisis"?"🌪️":"🎁"} ${event.title}</h2><p>${event.story}</p></section><div class="event-options">${event.options.map((o,i)=>`<button type="button" class="event-option" data-event-option="${i}"><h3>${o.title}</h3><p>${o.hint}</p><strong>${o.summary}</strong></button>`).join("")}</div></article>`,false);document.querySelectorAll("[data-event-option]").forEach(btn=>btn.addEventListener("click",()=>onChoose(Number(btn.dataset.eventOption))))};
})(window.CoffeeGame);
