/**
 * 终局结算模块。
 * 将最终状态转换为 SCA、瑕疵率、交割产量、买家、生态溢价、营收、净利润与段位。
 */
(function(CG){
  // 只列出会直接修正 SCA 分数的标签；未列出的标签贡献为 0。
  const scoreMods={washed_legend:4,washed_clean:2.5,washed_tea:1,natural_legend:4.5,natural_nut:2,natural_earth:-2,anaerobic_legend:6.5,anaerobic_wine:3,anaerobic_fail:-10,residue:-3,dying:-2.5};
  // 可叠加的生态认证单价溢价；药剂残留会在计算时一票否决。
  const ecoMods={organic:.20,walnut_shade:.15,bees:.10,mixed_forest:.10};

  /** 按净利润返回排行榜段位。 */
  function tier(net){if(net>=200000)return"👑无量山咖王";if(net>=120000)return"🟣庄园大亨";if(net>=70000)return"🔵资深咖农";if(net>=30000)return"🟢彝乡新秀";return"⚪勉强糊口"}

  /** 按 SCA 分数返回市场品质级别。 */
  function quality(score){if(score>=90)return"大赛竞拍级";if(score>=85)return"独立精品级";if(score>=80)return"精品商业级";return"大宗商业级"}

  /**
   * 计算最终净利润。资金为负时，负余额已经包含债务本金，因此这里只再扣除 20% 利息，
   * 使债务本金与利息合计按配置中的 1.2 倍偿还。
   */
  function netProfit(revenue,gold){
    const debtInterest=gold<0?Math.abs(gold)*(CG.config.debtRepaymentMultiplier-1):0;
    return Math.round(revenue+gold-CG.config.initialGold-CG.config.fixedDepreciation-debtInterest);
  }

  /**
   * 执行完整终局公式；本函数只读传入状态，不推进轮次。
   * @param {object} s 完成 R5 或因活力归零结束的对局状态。
   * @returns {object} 可直接供三张结算卡和排行榜使用的标准化结果。
   */
  CG.calculateSettlement=function(s){
    if(s.health<=0){return {failed:true,score:0,defectRate:1,finalYield:0,buyer:"庄园绝收",buyerComment:"树体活力归零，本季无法交付生豆。",basePrice:0,ecoPremium:0,unitPrice:0,revenue:0,netProfit:netProfit(0,s.gold),tier:"🍂 庄园绝收",quality:"未评级",flavorTag:"本季绝收"}}
    const mod=s.tags.reduce((sum,id)=>sum+(scoreMods[id]||0),0);
    const score=Math.max(0,Math.min(100,Math.round((60+.12*s.potential+.12*s.clarity+mod)*10)/10));
    let defect=Math.max(.005,((100-s.clarity)/10+(100-s.health)/20)/100);
    if(s.tags.includes("zero_defect"))defect=Math.max(.005,defect-.015);
    defect=Math.min(.999,defect);
    const finalYield=Math.max(0,s.yield*(1-defect));
    let buyer,basePrice,comment;
    if(score>=90&&s.tags.includes("anaerobic_legend")){buyer="👑 SCA 90+ 顶级精品竞拍团";basePrice=450+(score-90)*120;comment="极少数无量山顶级批次，进入全球竞拍通道。"}
    else if(score>=85&&!s.tags.includes("anaerobic_fail")){buyer="✨ 独立精品烘焙商";basePrice=120+(score-85)*20;comment="风味清晰、个性鲜明，适合精品单品豆菜单。"}
    else if(score>=80&&score<85&&defect<=.05){buyer="☕ 云南精品商业连锁专线";basePrice=60+(score-80)*6;comment="稳定、干净且具有产区辨识度，适合规模门店。"}
    else{buyer="📦 大宗速溶与深加工厂";basePrice=Math.max(15,35-defect*100);comment="按大宗商业批次定价，重视稳定交割与基础洁净。"}
    if(s.flags.reputationBonus&&!s.tags.includes("residue"))basePrice+=5;
    const eco=s.tags.includes("residue")?0:s.tags.reduce((sum,id)=>sum+(ecoMods[id]||0),0);
    const unitPrice=basePrice*(1+eco);
    const revenue=finalYield*unitPrice;
    const finalNetProfit=netProfit(revenue,s.gold);
    const flavorIds=["anaerobic_legend","natural_legend","washed_legend","anaerobic_wine","washed_clean","natural_nut","washed_tea","natural_earth","anaerobic_fail"];
    const flavor=flavorIds.find(id=>s.tags.includes(id));
    return {failed:false,score,defectRate:defect,finalYield,buyer,buyerComment:comment,basePrice,ecoPremium:eco,unitPrice,revenue,netProfit:finalNetProfit,tier:tier(finalNetProfit),quality:quality(score),flavorTag:flavor?CG.tags[flavor].icon+" "+CG.tags[flavor].name:"暂无风味标签"};
  };
  // 排行榜需要在不构造完整结算结果时复用同一段位阈值。
  CG.tierForProfit=tier;
})(window.CoffeeGame);
