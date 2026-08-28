/** 无量山风土志模块：维护五张与经营阶段对应的科普卡，并提供分页浏览。 */
(function(CG){
  // 卡片使用受控静态 HTML，内容来自企划书的咖啡知识设定。
  const cards=[
    {tab:"R1 建园",title:"海拔为什么影响咖啡风味？",html:"<p style='text-indent:2em;'>海拔越高，气温越低，果实成熟越慢，糖分、酸质与香气前体通常有更长的积累时间。</p><h3>三种品种路线</h3><ul><li>瑰夏：花香明亮、层次细腻，适合高海拔冷凉环境。</li><li>波旁：甜感平衡，常见坚果与焦糖调性，表现经典稳定。</li><li>卡蒂姆：抗病性强、产量高，更适合追求稳产的路线。</li></ul>"},
    {tab:"R2 生长",title:"咖啡为什么需要遮阴？",html:"<p style='text-indent:2em;'>遮阴树能削弱烈日、降低叶温，并减缓土壤水分蒸发。核桃落叶还能增加有机质，改善红壤结构。</p><h3>林下共生</h3><p style='text-indent:2em;'>古茶、酸木瓜与咖啡形成多层林相，增加生物多样性，也会带来更复杂的管理与微生物环境。</p>"},
    {tab:"R3 开花",title:"咖啡花为什么像茉莉？",html:"<p style='text-indent:2em;'>咖啡花含有与茉莉相近的芳香物质，开放时间短，却决定后续坐果的整齐程度。</p><h3>蜜蜂的作用</h3><p style='text-indent:2em;'>中华黑蜂在花间授粉，可提高坐果率与均一度。健康蜂群也是庄园生态多样性的直接信号。</p>"},
    {tab:"R4 采收",title:"为何精品咖啡强调成熟红果？",html:"<p style='text-indent:2em;'>成熟红果的糖度、酸质与香气前体更完整。青果会带来草本涩感，过熟破损果则容易滋生杂菌。</p><p style='text-indent:2em;'>分批手采成本高，却能显著提高批次均一度，也为厌氧等高风险处理提供更干净的原料。</p>"},
    {tab:"R5 处理",title:"水洗、日晒与厌氧区别在哪？",html:"<ul><li>水洗：去除果皮果胶，风味清晰明亮，最稳健。</li><li>日晒：整果慢干，甜感和醇厚度更强，对翻耙与洁净度有要求。</li><li>厌氧：密闭控温发酵，能创造强烈花果酒香，也会放大任何原料瑕疵。</li></ul>"}
  ];
  CG.ui=CG.ui||{};
  /** 打开风土志；默认定位当前轮，也可显式指定 0–4 页索引。 */
  CG.ui.showKnowledge=function(initial){
    let active=Math.max(0,Math.min(4,initial??CG.stateStore.current.round));
    /** 按 active 重建卡片，并给页签重新绑定切页事件。 */
    const render=()=>{CG.ui.openModal(`<article class="modal-card info-modal knowledge-modal" role="dialog" aria-modal="true" aria-label="无量山风土志"><button class="modal-close" type="button" data-close aria-label="关闭">×</button><nav class="info-tabs">${cards.map((c,i)=>`<button type="button" data-knowledge="${i}" class="${i===active?"is-active":""}">${c.tab}</button>`).join("")}</nav><section class="info-body modal-scroll"><h2>${cards[active].title}</h2>${cards[active].html}<p class="pager">❧　${active+1} / 5　❧</p></section></article>`,true);document.querySelectorAll("[data-knowledge]").forEach(b=>b.addEventListener("click",()=>{active=Number(b.dataset.knowledge);render()}))};
    render();
  };
})(window.CoffeeGame);
