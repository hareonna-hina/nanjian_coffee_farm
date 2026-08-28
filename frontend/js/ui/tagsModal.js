/** 标签图鉴模块：只展示本局已获得标签，并在同一弹窗中切换详情。 */
(function(CG){
  CG.ui=CG.ui||{};
  /** 打开本局标签图鉴；弹窗内的 active 只表示当前查看项，不写入游戏状态。 */
  CG.ui.showTags=function(){
    let active=null;
    let listScrollTop=0;
    /** 重新读取已拥有标签、绘制列表/详情，并绑定详情切换。 */
    const render=()=>{
      const previousList=document.querySelector(".tags-list");
      if(previousList)listScrollTop=previousList.scrollTop;
      const owned=CG.stateStore.current.tags.filter(id=>CG.tags[id]);
      if(active&&!owned.includes(active))active=null;
      const detail=active?CG.tags[active]:null;
      CG.ui.openModal(`<article class="tags-card" role="dialog" aria-modal="true" aria-label="本局标签"><button class="modal-close" type="button" data-close aria-label="关闭">×</button><div class="tags-list modal-scroll">${owned.length?owned.map(id=>{const t=CG.tags[id];return `<button type="button" data-tag="${id}" class="tag-row ${id===active?"is-active":""}"><strong>${t.icon} ${t.name}</strong><span><i class="pill">${t.category}</i></span></button>`}).join(""):`<div class="tag-empty">尚未获得标签<br>完成一次经营选择后再来看看</div>`}</div><section class="tag-detail modal-scroll">${detail?`<h3>${detail.icon} ${detail.name}</h3><p><b>标签类别：</b>${detail.category}</p><p><b>获得来源：</b>${detail.source}</p><p><b>叙事介绍：</b>${detail.description}</p><p><b>实际作用：</b>${detail.effect}</p>`:`<div class="tag-empty">点击上方某个已获得标签<br>这里会显示详细介绍</div>`}</section></article>`,true);
      const nextList=document.querySelector(".tags-list");
      if(nextList)nextList.scrollTop=listScrollTop;
      document.querySelectorAll("[data-tag]").forEach(b=>b.addEventListener("click",()=>{active=b.dataset.tag;render()}));
    };
    render();
  };
})(window.CoffeeGame);
