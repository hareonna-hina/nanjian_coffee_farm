/**
 * R1–R3 随机事件池配置模块。
 * Event 包含 id/type/weight/title/story/image/options；事件选项可声明 effects、tags、flags 或 conditional。
 * engine.rollEvent 负责抽取事件，engine.chooseEvent 负责执行玩家选择。
 */
(function(CG){
  // 事件插画公共路径。
  const E="assets/images/events/";
  // 三轮都可能复用的叶锈病事件只定义一次，确保规则和文案一致。
  const rust={id:"crisis_rust_disease",type:"crisis",weight:20,title:"连绵梅雨·叶锈病",image:E+"accident_R2_illness.png",story:"　盛夏西南季风带来连日暴雨，叶片泛起黄色锈斑——叶锈病正在梯田间蔓延。",options:[
    {title:"💊 全山喷洒波尔多液",hint:"快速压住病斑，但会留下药剂风险。",summary:"资金 -¥200<br/>活力 ↑↑<br/>纯净 ↓↓",effects:{gold:-200,health:25,clarity:-12},tags:["residue"]},
    {title:"🧤 彝寨人工物理清园",hint:"逐株剪除病叶，以人力守住有机路线。",summary:"资金 -¥120<br/>活力 ↑<br/>纯净 ↑",effects:{gold:-120,health:10,clarity:5,yield:-100},tags:["organic"]},
    {title:"🎲 祈愿山神硬抗",hint:"不投入资金，由当前树势承受病害。",summary:"零成本,结果取决于活力",conditional:"rust_gamble",effects:{},tags:[]}
  ]};
  CG.eventPools={
    0:[
      {id:"crisis_drought",type:"crisis",weight:30,title:"澜沧江干热春旱",image:E+"accident_R1_drought.png",story:"　入春后澜沧江峡谷连续四十天无雨，干热风倒灌，梯田土壤迅速开裂。",options:[
        {title:"💧 铺设滴灌管网",hint:"为根区补水，迅速缓解旱情。",summary:"资金 -¥160<br/>活力 ↑",effects:{gold:-160,health:15}},
        {title:"🌿 覆草堆肥保墒",hint:"用枯草与落叶减缓水分蒸发。",summary:"资金 -¥60<br/>产量小幅变化",conditional:"drought_mulch",effects:{gold:-60}},
        {title:"🎲 听天由命",hint:"暂不干预，让树体自行抵抗。",summary:"零成本,结果取决于活力",conditional:"drought_gamble",effects:{}}
      ]},
      {id:"crisis_frost",type:"crisis",weight:30,title:"无量山高山倒春寒",image:E+"accident_R1_snowy.png",story:"　清明前后强冷空气突袭，高海拔坡地气温骤降逼近零度，嫩叶开始失去光泽。",options:[
        {title:"🔥 林间堆烟熏防冻",hint:"利用烟层减缓地表热量散失。",summary:"资金 -¥150<br/>活力 ↑",effects:{gold:-150,health:10}},
        {title:"🌱 物理薄膜覆盖",hint:"覆盖幼株，代价是损失部分结果枝。",summary:"资金 -¥70<br/>产量 ↓",effects:{gold:-70,yield:-40}},
        {title:"🎲 靠老树抗逆硬抗",hint:"依赖品种与高山驯化抵抗寒潮。",summary:"零成本,结果取决于印记",conditional:"frost_gamble",effects:{}}
      ]},
      {id:"boon_agri_academy",type:"boon",weight:40,title:"省农科院高原风土考察队",image:E+"accident_R1_scientific_team.png",story:"　云南省农科院专家组路过南涧，对庄园的红壤与海拔梯度产生兴趣，并愿意提供一次现场指导。",options:[
        {title:"🧪 配合测土配方改良",hint:"做完整土壤检测并调整水肥方案。",summary:"资金 -¥120<br/>风味/活力 ↑",effects:{gold:-120,potential:6,health:10}},
        {title:"📝 虚心听取水肥建议",hint:"记录专家的低成本管理建议。",summary:"零成本<br/>活力 ↑",effects:{health:10}},
        {title:"🎁 赠送试验样豆联络",hint:"以少量样豆换取持续关注。",summary:"产量 -30kg<br/>风味 ↑",effects:{yield:-30,potential:4}}
      ]}
    ],
    1:[
      {id:"crisis_pruning_error",type:"crisis",weight:20,title:"外聘农工修剪失误",image:E+"accident_R2_mistake.png",story:"　外聘的新手短工误剪了大量主干结果枝，树冠留下凌乱伤口。",options:[
        {title:"💊 喷施生物刺激素",hint:"帮助伤口恢复并催发新梢。",summary:"资金 -¥140<br/>活力 ↑",effects:{gold:-140,health:15,potential:2}},
        {title:"✂️ 老把式人工复剪",hint:"请熟手重新整理树形。",summary:"资金 -¥50<br/>产量 ↓",effects:{gold:-50,yield:-50}},
        {title:"🎲 听其自然自愈",hint:"不投入，等树体自行恢复。",summary:"零成本<br/>产量/风味 ↓",effects:{yield:-90,potential:-3}}
      ]},
      {id:"crisis_forest_fire",type:"crisis",weight:20,title:"山林引火烧荒险情",image:E+"accident_R2_fire.png",story:"　邻地开荒烧荒，火星被山风吹入地头，防护林边缘冒起浓烟。",options:[
        {title:"🚒 雇佣水车开隔离带",hint:"快速切断火线，稳妥保住林地。",summary:"资金 -¥150<br/>活力 ↑",effects:{gold:-150,health:5}},
        {title:"🧤 全庄园人工扑打",hint:"全员上阵，以体力和枝叶损伤换控制。",summary:"资金 -¥40<br/>活力/纯净 ↓",effects:{gold:-40,health:-10,clarity:-5}},
        {title:"🎲 赌谷风转向硬抗",hint:"等待风向改变，风险取决于当前树势。",summary:"零成本,结果取决于活力",conditional:"fire_gamble",effects:{}}
      ]},
      rust,
      {id:"boon_wild_bees",type:"boon",weight:40,title:"无量山野生中华黑蜂群过境",image:E+"accident_R2_bees.png",story:"　盛花期的野生黑蜂群被梯田花香吸引，在林缘短暂停驻并尝试筑巢。",options:[
        {title:"🍯 购置木桶就地引蜂",hint:"留下蜂群，形成稳定共生。",summary:"资金 -¥100<br/>产量/风味 ↑",effects:{gold:-100,yield:60,potential:3},tags:["bees"]},
        {title:"🌸 静享自然充分授粉",hint:"不打扰蜂群，让花期充分受粉。",summary:"零成本<br/>产量 ↑",effects:{yield:40}},
        {title:"🐝 收集野蜂蜜售卖",hint:"将短期蜂蜜收入投入庄园。",summary:"资金 +¥150",effects:{gold:150}}
      ]}
    ],
    2:[
      Object.assign({},rust,{id:"crisis_rust_disease_late",weight:15}),
      {id:"crisis_berry_borer",type:"crisis",weight:15,title:"咖啡果小蠹虫侵袭",image:E+"accident_R3_bookworm.png",story:"　采收前监测到果小蠹虫钻蛀幼果，受害浆果内部极易霉变。",options:[
        {title:"🧪 悬挂性诱捕器防虫",hint:"用信息素诱捕成虫，保护剩余果实。",summary:"资金 -¥160 <br/>活力/风味 ↑",effects:{gold:-160,health:5,potential:2}},
        {title:"✂️ 人工筛摘虫蛀果",hint:"逐株摘除受害果，减少扩散。",summary:"资金 -¥80<br/>产量 ↓",effects:{gold:-80,yield:-60}},
        {title:"🎲 听天由命不处理",hint:"承担霉变与虫蛀继续扩散。",summary:"零成本<br/>多项下降",effects:{clarity:-12,yield:-80,potential:-4}}
      ]},
      {id:"crisis_labor_shortage",type:"crisis",weight:15,title:"彝乡秋茶采摘工期冲突",image:E+"accident_R3_conflict.png",story:"　茶山秋茶收购价上涨，村民纷纷转去采茶，庄园突然遭遇严重用工荒。",options:[
        {title:"💰 溢价抢招熟练采摘工",hint:"提高工价，稳住采摘队。",summary:"资金 -¥180<br/>风味 ↑",effects:{gold:-180,potential:4}},
        {title:"🤝 联合本寨亲友互助采",hint:"依靠乡邻换工完成采收。",summary:"资金 -¥60<br/>产量 ↓",effects:{gold:-60,yield:-50}},
        {title:"🚜 散工快速扫园通采",hint:"以速度换成熟度与精细度。",summary:"零成本<br/>纯净/风味 ↓",effects:{clarity:-10,potential:-4}}
      ]},
      {id:"crisis_flood_road",type:"crisis",weight:15,title:"山洪冲毁出山通村土路",image:E+"accident_R3_flood.png",story:"　暴雨引发峡谷山洪，通村土路塌方，鲜果面临积压堆沤风险。",options:[
        {title:"🚜 自费雇挖机抢修便道",hint:"当天抢通最关键的运输路段。",summary:"资金 -¥180<br/>活力 ↑",effects:{gold:-180,health:5}},
        {title:"🐴 高山马帮接驳倒运",hint:"分批背运，牺牲部分鲜果。",summary:"资金 -¥80<br/>产量 ↓",effects:{gold:-80,yield:-60}},
        {title:"🎲 原地堆放等待抢修",hint:"承担积压导致的腐败与损耗。",summary:"零成本<br/>多项下降",effects:{clarity:-15,potential:-6,yield:-100}}
      ]},
      {id:"boon_cupping_tour",type:"boon",weight:20,title:"寻豆师与网红探店团队造访",image:E+"accident_R3_cupping_tour.png",story:"　知名精品咖啡寻豆团队自驾无量山，上门拜访并希望了解庄园的独特批次。",options:[
        {title:"☕ 举办林间私享杯测会",hint:"用专业体验建立长期采购印象。",summary:"资金 -¥150<br/>风味/声誉 ↑",effects:{gold:-150,potential:5},flags:{reputationBonus:true}},
        {title:"📹 开放果园配合短视频",hint:"让庄园故事被更多人看到。",summary:"零成本<br/>风味认知 ↑",effects:{potential:3}},
        {title:"🏷️ 现场预售尝鲜包",hint:"出售少量样豆，回笼现金。",summary:"资金 +¥180<br/>产量 -20kg",effects:{gold:180,yield:-20}}
      ]},
      {id:"boon_torch_festival",type:"boon",weight:20,title:"南涧彝家火把节乡邻换工",image:E+"accident_R3_torch_festival.png",story:"　恰逢火把节与农闲，本寨乡亲主动来庄园换工，山坡一时热闹起来。",options:[
        {title:"🍖 备牛汤锅跳菜宴",hint:"以宴席感谢乡邻并精细打理。",summary:"资金 -¥100<br/>活力/纯净 ↑",effects:{gold:-100,health:15,clarity:5}},
        {title:"🤝 集中抢修排灌沟渠",hint:"把人力用于最急需的水利维护。",summary:"零成本<br/>活力 ↑",effects:{health:10}},
        {title:"🔥 火把节夜间火光诱虫",hint:"利用火光降低林间虫口密度。",summary:"零成本<br/>纯净 ↑",effects:{clarity:4}}
      ]}
    ]
  };

  // 事件中只有负资金属于花费；正向收入和零成本选项维持原值。
  // 叶锈病事件会跨轮复用，因此用 Set 防止同一个选项被重复放大。
  const costMultiplier=CG.config.optionCostMultiplier||1;
  const adjustedOptions=new Set();
  Object.values(CG.eventPools).flat().forEach(event=>event.options.forEach(option=>{
    if(adjustedOptions.has(option))return;
    adjustedOptions.add(option);
    if(option.effects.gold<0){
      option.effects.gold*=costMultiplier;
      const money="资金 -¥"+Math.abs(option.effects.gold).toLocaleString("zh-CN");
      option.summary=option.summary.replace(/资金\s*-¥[\d,]+/,money);
    }
  }));
})(window.CoffeeGame);
