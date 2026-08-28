/** 核心规则回归测试：在 Node 环境直接加载与浏览器完全相同的 game 模块。 */
const assert=require("node:assert/strict");
// 最小浏览器兼容层；Map 让每条用例可以隔离 localStorage。
global.window=global;
global.location={search:""};
global.crypto=require("node:crypto").webcrypto;
const memory=new Map();
global.localStorage={getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
[
  "../frontend/js/config.js","../frontend/js/game/tags.js","../frontend/js/game/rounds.js","../frontend/js/game/events.js",
  "../frontend/js/game/state.js","../frontend/js/utils/format.js","../frontend/js/utils/random.js","../frontend/js/game/settlement.js","../frontend/js/game/engine.js"
].forEach(require);
const CG=global.CoffeeGame;
let passed=0;
/** 执行单条同步测试，统一输出通过/失败标记，并把异常交给 Node 终止进程。 */
function test(name,fn){try{fn();passed++;console.log(`✓ ${name}`)}catch(error){console.error(`✗ ${name}`);throw error}}
/** 清空测试存储并返回严格初始状态。 */
function fresh(){memory.clear();return CG.stateStore.create()}

// 验证初始资源、轮次和标签基线。
test("初始状态使用三万元启动资金",()=>{const s=fresh();assert.deepEqual([s.gold,s.yield,s.health,s.potential,s.clarity],[30000,1000,80,75,90]);assert.equal(s.version,2);assert.equal(s.round,0);assert.deepEqual(s.tags,[])});

// 验证主线和事件负资金选项同时放大，正向事件收入不受影响。
test("选项花费按统一倍率计算且正向收入不变",()=>{assert.equal(CG.rounds[0].options[0].effects.gold,-24000);assert.equal(CG.rounds[0].options[0].cost,"-¥24,000");assert.equal(CG.rounds[1].options[0].effects.gold,-8000);assert.equal(CG.rounds[1].options[0].cost,"-¥8,000");const rust=CG.eventPools[1].find(event=>event.id==="crisis_rust_disease");assert.equal(rust.options[0].effects.gold,-4000);assert.match(rust.options[0].summary,/资金 -¥4,000/);const bees=CG.eventPools[1].find(event=>event.id==="boon_wild_bees");assert.equal(bees.options[2].effects.gold,150)});

// 验证选择选项后扣除的确实是放大后的费用，而不只是界面文案发生变化。
test("主线选择按放大后的金额实际扣款",()=>{const s=fresh();CG.engine.chooseRound(0);assert.equal(s.gold,6000)});

// 负余额 -10,000 已含债务本金，再扣 20% 利息，最终债务成本合计为 12,000。
test("终局负债按一点二倍计入总利润",()=>{const s=fresh();s.gold=-10000;s.yield=0;const out=CG.calculateSettlement(s);assert.equal(out.netProfit,-42800)});

// 验证高门槛传奇厌氧路线、买家和关键结算数字。
test("传奇厌氧路线可达且结算公式正确",()=>{fresh();for(const choice of [0,0,0,0,2]){const result=CG.engine.chooseRound(choice);assert.ok(result);if(CG.stateStore.current.round<4)CG.engine.advance()}const s=CG.stateStore.current;assert.ok(s.tags.includes("anaerobic_legend"));const out=CG.engine.finish();assert.equal(out.score,90.5);assert.equal(out.defectRate,.005);assert.equal(out.ecoPremium,.15);assert.equal(out.buyer,"👑 SCA 90+ 顶级精品竞拍团");assert.ok(out.finalYield>=0)});

// 验证 R5 水洗对药剂残留的清除与生态溢价恢复。
test("水洗会清除药剂微残留并恢复生态溢价",()=>{const s=fresh();s.round=4;s.tags=["residue","walnut_shade"];const result=CG.engine.chooseRound(0);assert.ok(result);assert.ok(!s.tags.includes("residue"));const out=CG.calculateSettlement(s);assert.equal(out.ecoPremium,.15)});

// 验证低活力疲劳只折半正向风味增益。
test("树体疲劳使正向风味增益减半",()=>{const s=fresh();s.round=1;s.health=40;s.potential=50;CG.engine.chooseRound(2);assert.equal(s.potential,56)});

// 验证濒死状态不会重复施加一次性惩罚。
test("首次进入濒死区触发一次性惩罚",()=>{const s=fresh();s.health=35;CG.engine.chooseRound(0);assert.equal(s.health,10);assert.ok(s.tags.includes("dying"));assert.equal(s.clarity,80);assert.equal(s.yield,510)});

// 注入固定随机数，验证卡蒂姆对叶锈病无损免疫。
test("卡蒂姆标签对叶锈病触发无损免疫",()=>{const s=fresh();s.round=1;s.tags=["rust_immune"];s.flags.immuneRust=true;CG.random.use([.9,.9]);const rolled=CG.engine.rollEvent(1);assert.ok(rolled);assert.equal(rolled.event.id,"crisis_rust_disease");assert.equal(rolled.immune,true)});

// 验证残留标签优先于所有正向生态认证。
test("药剂残留一票否决全部生态溢价",()=>{const s=fresh();s.tags=["organic","walnut_shade","bees","residue","washed_clean"];const out=CG.calculateSettlement(s);assert.equal(out.ecoPremium,0)});

// 验证极端效果也无法越过各项资源硬边界。
test("所有资源严格截断到合法边界",()=>{const s=fresh();CG.engine.applyEffects({yield:9000,health:300,potential:-999,clarity:-999});assert.equal(s.yield,3000);assert.equal(s.health,100);assert.equal(s.potential,0);assert.equal(s.clarity,0)});

// 验证标签集合语义，防止同一加成重复叠加。
test("同一标签不会重复叠加",()=>{fresh();CG.stateStore.addTag("bees");CG.stateStore.addTag("bees");assert.equal(CG.stateStore.current.tags.filter(x=>x==="bees").length,1)});

console.log(`\n${passed} 项规则测试全部通过。`);
