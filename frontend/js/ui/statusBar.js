/** 经营页状态栏模块：把当前状态转换为资金、产量、活力和两项五档品质。 */
(function(CG){
  /** 把品质档位对象渲染为五个圆点和对应中文描述。 */
  function dots(q){return `<span class="status-dots">${[1,2,3,4,5].map(i=>`<i class="${i<=q.level?"on":""}"></i>`).join("")}</span><small>${q.label}</small>`}
  CG.ui=CG.ui||{};
  /** 重绘五项状态，并同步侧栏标签数量徽章。 */
  CG.ui.renderStatus=function(){const s=CG.stateStore.current,f=CG.format,qf=f.quality(s.potential,"potential"),qc=f.quality(s.clarity,"clarity");document.getElementById("status-bar").innerHTML=`
    <div class="status-value ${s.gold<0?"is-negative":""}">${f.money(s.gold)}${s.gold<0?"<small>经营垫资</small>":""}</div>
    <div class="status-value">${f.kg(s.yield)}</div>
    <div class="status-value">${Math.round(s.health)}%</div>
    <div class="status-value">${dots(qf)}</div>
    <div class="status-value">${dots(qc)}</div>`;document.getElementById("tag-count").textContent=s.tags.length};
})(window.CoffeeGame);
