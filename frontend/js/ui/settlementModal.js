/** 终局展示模块：按杯测卡 → 交易卡 → 成绩卡的顺序展示结算结果。 */
(function(CG){
  CG.ui=CG.ui||{};
  /** 打开终局卡片链；绝收时改走单张失败卡，重新经营由调用方执行。 */
  CG.ui.showSettlement=function(result,onRestart){
    const f=CG.format;
    /** 展示风味标签、SCA 分数和品质等级。 */
    const showCup=()=>CG.ui.openModal(`<section class="settlement-full" role="dialog" aria-modal="true" aria-label="杯测卡"><article class="settlement-card cup-card"><div class="cup-flavor">${result.flavorTag}</div><div class="cup-score">${result.score.toFixed(1)}<small> 分</small></div><div class="cup-grade">${result.quality}</div><button class="primary-button" type="button" data-settle-next>继续</button></article></section>`,false);
    /** 展示买家、交割产量、单价、生态溢价、营收和净利润。 */
    const showTrade=()=>CG.ui.openModal(`<section class="settlement-full" role="dialog" aria-modal="true" aria-label="交易卡"><article class="settlement-card trade-card"><div class="trade-buyer">${result.buyer}</div><div class="trade-comment">“${result.buyerComment}”</div><span class="trade-field trade-final-yield">${f.number(result.finalYield,0)}</span><span class="trade-field trade-unit">${f.number(result.unitPrice,0)}</span><span class="trade-field trade-revenue">${f.number(result.revenue,0)}</span><span class="trade-field trade-score">${result.score.toFixed(1)}</span><span class="trade-field trade-eco">${Math.round(result.ecoPremium*100)}</span><div class="trade-profit">${f.number(result.netProfit,0)}</div><button class="primary-button" type="button" data-settle-next>继续</button></article></section>`,false);
    /** 展示最终经营指标、段位、远端榜单名次，以及排行榜/重开入口。 */
    const showGrade=async()=>{const rank=(await CG.leaderboard.get()).mine;CG.ui.openModal(`<section class="settlement-full" role="dialog" aria-modal="true" aria-label="成绩卡"><article class="settlement-card grade-card"><div class="grade-metric grade-yield">${f.number(result.finalYield,0)}kg</div><div class="grade-metric grade-revenue">${f.money(result.revenue)}</div><div class="grade-metric grade-profit">${f.money(result.netProfit)}</div><div class="grade-metric grade-tier">${result.tier}</div><div class="grade-metric grade-rank">${rank?`第 ${rank} 名`:"未上榜"}</div><div class="grade-actions"><button type="button" data-view-rank>查看排行榜</button><button type="button" data-restart>重新经营</button></div></article></section>`,false);document.querySelector("[data-view-rank]").addEventListener("click",()=>CG.ui.showLeaderboard(showGrade));document.querySelector("[data-restart]").addEventListener("click",onRestart)};
    if(result.failed){CG.ui.openModal(`<article class="modal-card windfall-card" role="dialog" aria-modal="true"><h2>🍂 庄园绝收</h2><p>树体活力已经归零，本季无法继续经营。最终净收益为 <b>${f.money(result.netProfit)}</b>。休整土地，下一局换一条更稳健的路线吧。</p><button class="primary-button" type="button" data-restart>重新经营</button></article>`,false);document.querySelector("[data-restart]").addEventListener("click",onRestart);return}
    showCup();document.querySelector("[data-settle-next]").addEventListener("click",()=>{showTrade();document.querySelector("[data-settle-next]").addEventListener("click",showGrade)})
  };
})(window.CoffeeGame);
