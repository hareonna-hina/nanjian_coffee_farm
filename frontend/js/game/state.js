/**
 * 单局状态仓库。
 * 这是规则引擎和 UI 之间的唯一可变状态源，并负责把未完成对局持久化到 localStorage。
 */
(function(CG){
  /**
   * 创建一份严格符合企划书初始值的新状态。
   * @returns {object} 可直接交给规则引擎使用的新对局状态。
   */
  const initial=()=>({
    version:2,runId:"run_"+Date.now(),round:0,gold:CG.config.initialGold,yield:1000,health:80,potential:75,clarity:90,
    tags:[],flags:{immuneRust:false,reputationBonus:false},choices:[],events:[],pending:null,status:"ongoing",startedAt:new Date().toISOString(),settlement:null
  });

  CG.stateStore={
    // 当前内存状态；页面运行期间所有模块都读取同一个对象引用。
    current:initial(),

    /** 新建、保存并返回一局游戏。 */
    create(){this.current=initial();this.save();return this.current},

    /** 将当前对局序列化到浏览器；存储不可用时静默降级为仅内存模式。 */
    save(){try{localStorage.setItem(CG.config.storagePrefix+":run",JSON.stringify(this.current))}catch(_){}},

    /** 从浏览器恢复同版本对局；损坏或旧版数据不会覆盖默认状态。 */
    load(){try{const raw=localStorage.getItem(CG.config.storagePrefix+":run");if(raw){const parsed=JSON.parse(raw);if(parsed&&parsed.version===2)this.current=parsed}}catch(_){}return this.current},

    /** 删除已保存进度，并在内存中准备一份尚未开始的新状态。 */
    clear(){try{localStorage.removeItem(CG.config.storagePrefix+":run")}catch(_){}this.current=initial()},

    /** 提取用于选择前/后差值比较的轻量快照，避免 UI 持有完整可变状态。 */
    snapshot(){const s=this.current;return {gold:s.gold,yield:s.yield,health:s.health,potential:s.potential,clarity:s.clarity,tags:[...s.tags]}},

    /** 添加一个已注册且当前尚未拥有的标签。 */
    addTag(id){if(CG.tags[id]&&!this.current.tags.includes(id))this.current.tags.push(id)},

    /** 移除指定标签；当前用于水洗路线清除药剂残留。 */
    removeTag(id){this.current.tags=this.current.tags.filter(x=>x!==id)},

    /** 判断当前对局是否拥有指定标签。 */
    hasTag(id){return this.current.tags.includes(id)}
  };
})(window.CoffeeGame);
