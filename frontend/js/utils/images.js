/**
 * 图片按需加载与后台预加载模块。
 * 首屏不调用本模块；进入经营阶段后才在空闲时预取当前阶段可能出现的事件图和下一阶段图片。
 */
(function(CG){
  // 同一路径始终复用同一个 Promise，防止重复创建 Image 和重复发起预加载。
  const imageRequests=new Map();
  // 同一轮只安排一次后台任务，避免页面重绘重复排队。
  const roundRequests=new Map();
  const settlementImages=[
    "assets/images/ui/cuptest_card_background.png",
    "assets/images/ui/trading_card_background.png",
    "assets/images/ui/grading_card_background.png"
  ];

  /**
   * 低优先级预加载并尝试提前解码一张图片；网络或 decode 失败只返回 null，不中断游戏。
   * @param {string} src 相对于 frontend/index.html 的图片路径。
   * @returns {Promise<string|null>} 成功时返回原路径，失败时返回 null。
   */
  function preloadImage(src){
    if(!src||typeof Image==="undefined")return Promise.resolve(null);
    if(imageRequests.has(src))return imageRequests.get(src);
    const request=new Promise(resolve=>{
      const img=new Image();
      let finished=false;
      /** 只完成一次请求；decode 拒绝不会向外抛出。 */
      const complete=loaded=>{
        if(finished)return;
        finished=true;
        if(!loaded||typeof img.decode!=="function"){resolve(loaded?src:null);return}
        img.decode().catch(()=>{}).then(()=>resolve(src));
      };
      img.decoding="async";
      img.fetchPriority="low";
      img.onload=()=>complete(true);
      img.onerror=()=>complete(false);
      img.src=src;
      if(img.complete)complete(img.naturalWidth>0);
    });
    imageRequests.set(src,request);
    return request;
  }

  /**
   * 去重后并行预加载多张图片；单张失败会被吸收，不影响其他资源和游戏流程。
   * @param {string[]} srcs 图片路径数组。
   * @returns {Promise<(string|null)[]>} 每张图片对应的完成结果。
   */
  function preloadImages(srcs){
    const unique=[...new Set((Array.isArray(srcs)?srcs:[]).filter(Boolean))];
    return Promise.all(unique.map(preloadImage));
  }

  /** 收集某阶段的主视觉和三个可能选择图。 */
  function roundImages(index){
    const round=CG.rounds[index];
    return round?[round.visual,...round.options.map(option=>option.image)]:[];
  }

  /** 收集该阶段主线结束后可能触发的全部随机事件图。 */
  function eventImages(index){return (CG.eventPools[index]||[]).map(event=>event.image)}

  /**
   * 在浏览器空闲时安排本阶段事件图与下一阶段图片；R5 改为预加载三张结算卡底图。
   * @param {number} index 当前阶段的零基索引。
   * @returns {Promise<(string|null)[]>} 本轮后台预加载完成结果。
   */
  function preloadForRound(index){
    if(roundRequests.has(index))return roundRequests.get(index);
    const next=index<CG.rounds.length-1?roundImages(index+1):index===CG.rounds.length-1?settlementImages:[];
    const sources=[...eventImages(index),...next];
    const request=new Promise(resolve=>{
      const run=()=>preloadImages(sources).then(resolve);
      if(typeof requestIdleCallback==="function")requestIdleCallback(run,{timeout:1200});
      else setTimeout(run,0);
    });
    roundRequests.set(index,request);
    return request;
  }

  CG.preloadImage=preloadImage;
  CG.preloadImages=preloadImages;
  CG.imageLoading={preloadForRound};
})(window.CoffeeGame);
