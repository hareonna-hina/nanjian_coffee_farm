/** 排行榜弹窗模块：把 leaderboard 聚合结果渲染为名次表，并高亮当前玩家。 */
(function(CG){
  CG.ui=CG.ui||{};
  /** 打开排行榜；onClose 用于从终局成绩卡查看后返回原卡。 */
  CG.ui.showLeaderboard=function(onClose){const data=CG.leaderboard.get(),profile=CG.profile.getOrCreate();CG.ui.openModal(`<article class="leaderboard-card" role="dialog" aria-modal="true" aria-label="排行榜"><button class="modal-close" type="button" data-close aria-label="返回">×</button><div class="leaderboard-list modal-scroll">${data.rows.map(r=>`<div class="leaderboard-row ${r.uid===profile.publicUid?"is-me":""}"><strong>${r.rank}</strong><span>${r.name}<small style="display:block;font-size:7px;color:#756d58">${r.uid}</small></span><b>${CG.format.money(r.profit)}</b><span>${r.sca.toFixed(1)}</span></div>`).join("")}</div><div class="my-rank">${data.mine?`第 ${data.mine} 名 · ${profile.playerName||"新庄园主"}`:"未完成"}<br><small>每位庄园主只保留净利润最高的一局。</small></div></article>`,true,onClose)};
})(window.CoffeeGame);
