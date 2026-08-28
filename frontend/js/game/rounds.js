/**
 * 五轮主线配置模块。
 * Round 包含 id/title/story/visual/options，Option 包含展示文案、资源 effects、tags 和可选 process。
 * UI 只渲染配置，真正的资源变动由 engine.chooseRound 统一执行。
 */
(function(CG){
  // 生命周期插画的公共路径，避免每个选项重复书写目录。
  const A="assets/images/stages/";
  CG.rounds=[
    {
      id:"R1",title:"阶段 1 / 5　建园 · 选地育苗",story:"你站在无量山脚下。海拔、坡向与品种，将决定未来数年的经营命脉。",visual:A+"mainpage_phase1_middle_picture.png",
      options:[
        {key:"A",title:"🏔️ 无量山巅·高山冷凉瑰夏",short:"　承包 1800m 云雾山顶，风味极佳但长势缓慢。",image:A+"mainpage_phase1_A.png",cost:"-¥1,200",trends:["风味 ↑↑","活力 ↓","产量 ↓↓"],effects:{gold:-1200,potential:18,health:-25,yield:-400},tags:["mountain_mist"],story:"　　晨雾还未散去，你便沿石阶登上海拔一千八百米的山顶。冷风让幼苗微微伏低，定植速度比预想更慢；可厚重云层过滤了烈日，红壤持续保持湿润。第一排瑰夏苗在雾中站稳时，你知道这条路会辛苦，却也最接近无量山的花香极限。"},
        {key:"B",title:"⚖️ 罗伯克茶园缓坡·老树红波旁",short:"　利用向阳老茶园缓坡，传承坚果焦糖的经典风味。",image:A+"mainpage_phase1_B.png",cost:"-¥700",trends:["风味 ↑","活力 ↓","产量 ↓"],effects:{gold:-700,potential:8,health:-10,yield:-100},tags:["bourbon_nut"],story:"　　你接下罗伯克旧茶园的向阳缓坡，沿着原有等高线修整梯田。老茶根留下的疏松红壤让波旁苗很快适应，日照与山风也恰到好处。没有孤注一掷的惊险，却有一种稳妥而悠长的甜香，在新翻的泥土里慢慢显露。"},
        {key:"C",title:"🛡️ 澜沧江干热河谷·梯田卡蒂姆",short:"　河谷热量充足，抗病苗长势旺盛，适合规模经营。",image:A+"mainpage_phase1_C.png",cost:"-¥300",trends:["产量 ↑↑","活力 ↑","风味 ↓"],effects:{gold:-300,potential:-15,health:20,yield:400},tags:["rust_immune"],story:"　　澜沧江河谷的热风吹过新修梯田，卡蒂姆幼苗在强光下迅速挺直叶片。耐热抗病的血统让它们几乎没有缓苗期，很快铺满坡面。你用较低成本换来可观规模，也接受了风味上限不及高山品种的现实。"}
      ]
    },
    {
      id:"R2",title:"阶段 2 / 5　生长 · 林下共生",story:"幼苗进入生长期。你要在烈日、产量与林下生态之间建立一套微气候。",visual:A+"mainpage_phase2_middle_picture.png",
      options:[
        {key:"A",title:"🌿 无量山高山泡核桃套种",short:"　核桃与野樱花提供柔和遮阴，改善林下小气候。",image:A+"mainpage_phase2_A.png",cost:"-¥400",trends:["风味 ↑","活力 ↑","产量 ↓"],effects:{gold:-400,potential:8,health:15,yield:-150},tags:["walnut_shade"],story:"　　核桃幼树被种进咖啡行间，野樱花补在坡脚。几场山雨之后，落叶与果皮堆肥开始覆盖红土，正午的直射光被切成斑驳碎影。咖啡枝叶舒展开来，虽然林木分走少量地力，却换来更稳定、凉润的山地微气候。"},
        {key:"B",title:"☀️ 梯田开荒·全光照密植",short:"　清理杂木、铺设地膜，以更高风险追求更大产量。",image:A+"mainpage_phase2_B.png",cost:"-¥200",trends:["产量 ↑↑","活力 ↓","风味 ↓"],effects:{gold:-200,potential:-8,health:-15,yield:350,clarity:5},tags:["full_sun"],story:"　　你清理坡面杂木，铺开地膜，让河谷阳光毫无遮挡地落在咖啡树上。密植地块很快抽出大量新枝，果园显得格外兴旺；但午后叶缘开始卷曲，干热山风也让防护林变得脆弱。规模增长的同时，风险悄悄累积。"},
        {key:"C",title:"🍊 无量山古树茶与酸木瓜混种",short:"　复合花粉与落果微生物，塑造独特的山野果韵。",image:A+"mainpage_phase2_C.png",cost:"-¥350",trends:["风味 ↑↑","纯净 ↓","产量 ↓"],effects:{gold:-350,potential:12,clarity:-8,yield:-100},tags:["mixed_forest"],story:"　　古茶树与酸木瓜被保留在咖啡行间，花粉、落果与山野微生物让林地气味变得复杂。咖啡树不再是整齐单一的队列，而像融进一片小森林。管理难度随之上升，却也留下独属于南涧山地的酸甜果韵。"}
      ]
    },
    {
      id:"R3",title:"阶段 3 / 5　成熟 · 开花挂果",story:"春雨初歇，白花如茉莉般盛开。你要在单果养分与挂果数量间作选择。",visual:A+"mainpage_phase3_middle_picture.png",
      options:[
        {key:"A",title:"✂️ 彝家阿妹精细疏果",short:"　剪除弱枝弱果，把养分集中给最饱满的核心果实。",image:A+"mainpage_phase3_A.png",cost:"-¥300",trends:["风味 ↑↑","纯净 ↑","产量 ↓↓↓"],effects:{gold:-300,potential:15,clarity:5,yieldMultiplier:.55},tags:["thinning_sugar"],story:"　　春雨停在清晨，采茶阿妹们沿梯田逐株查看花序，把弱枝、密花与迟开的花蕾仔细剪去。满树繁花变得疏朗，留下的果枝却获得更充足的光照与养分。短期产量明显减少，每一颗果实的糖分与成熟整齐度却开始集中。"},
        {key:"B",title:"🧪 喷施高产保果微肥",short:"　沿山道喷施复合叶面肥，最大化追求结实数量。",image:A+"mainpage_phase3_B.png",cost:"-¥250",trends:["产量 ↑↑","活力 ↓","风味 ↓"],effects:{gold:-250,potential:-10,health:-15,yieldMultiplier:1.35},tags:["high_yield"],story:"　　背负喷桶的工人沿山道穿行，微肥雾落在叶面与花序上。数周后，枝头挂果密得压弯枝条，整片梯田呈现出惊人的丰产景象。树体却在持续输送养分后显出疲态，果实之间也不得不分享有限的糖分。"},
        {key:"C",title:"🐝 引进无量山中华黑蜂授粉",short:"　林下布置蜂箱，让自然授粉提高果实均一与生态价值。",image:A+"mainpage_phase3_C.png",cost:"-¥150",trends:["产量 ↑","活力 ↑","风味 ↑"],effects:{gold:-150,potential:4,health:5,yieldMultiplier:1.1},tags:["bees"],story:"　　木制蜂箱被安放在林缘，中华黑蜂循着茉莉般的咖啡花香穿梭山谷。细小振翅声持续了整个花期，授粉后的幼果整齐饱满。庄园没有剧烈变化，却建立起更稳定的生态循环，也获得一份能被市场识别的共生价值。"}
      ]
    },
    {
      id:"R4",title:"阶段 4 / 5　丰产 · 成熟采收",story:"枝头转为玛瑙红。采收标准将决定鲜果进入处理厂前的成熟度与洁净度。",visual:A+"mainpage_phase4_middle_picture.png",
      options:[
        {key:"A",title:"🍒 彝乡精采·100%全红果手采",short:"　多轮巡回，只摘成熟巅峰红果，彻底剔除青涩果。",image:A+"mainpage_phase4_A.png",cost:"-¥500",trends:["纯净 ↑↑","风味 ↑","产量 ↓"],effects:{gold:-500,clarity:15,potential:6,yield:-100},tags:["zero_defect"],story:"　　熟练采工分成小队，沿着陡坡一遍遍巡回，只把颜色最深、触感饱满的红果放进竹篓。青果继续留在枝头，黑果与虫蛀果当场剔除。采收周期被拉长，合格鲜果却呈现出近乎一致的成熟度。"},
        {key:"B",title:"🚜 陡坡震落·水渠粗筛通采",short:"　机械震落整树果实，再用引水渠完成快速粗筛。",image:A+"mainpage_phase4_B.png",cost:"-¥150",trends:["成本 ↓","纯净 ↓","风味 ↓"],effects:{gold:-150,clarity:-5,potential:-2},tags:["bulk_pick"],story:"　　小型震枝机沿着梯田推进，红果、半熟果一起落上接果布，再顺着水渠快速浮选。傍晚前，大部分鲜果已经集中装袋，效率远超人工巡采。代价是成熟度难以完全一致，几颗青果仍混进了批次。"},
        {key:"C",title:"🍷 枯霜微冻·无量山挂枝晚采",short:"　推迟采收，让微霜与谷风在枝头浓缩糖分和酒韵。",image:A+"mainpage_phase4_C.png",cost:"-¥300",trends:["风味 ↑↑","纯净 ↓↓","风险 ↑"],effects:{gold:-300,potential:10,clarity:-15},tags:["late_harvest"],story:"　　你决定再等一阵。夜间微霜覆上果皮，白天干热谷风又缓慢带走水分，浆果像在枝头进行一场天然风干。糖香明显浓缩，部分果实却因成熟过度出现破皮与不均，带来难以回避的洁净风险。"}
      ]
    },
    {
      id:"R5",title:"阶段 5 / 5　成果 · 生豆处理",story:"鲜果已经运抵处理厂。最后一种工艺，将把四轮积累兑现为真正的杯中风味。",visual:A+"mainpage_phase5_middle_picture.png",
      options:[
        {key:"A",process:"washed",title:"💧 无量山高山泉水水洗",short:"　冷泉去除果胶，稳健展现干净、明亮的高山酸质。",image:A+"mainpage_phase5_A.png",cost:"-¥400",trends:["稳健","纯净表达","可清残留"],effects:{gold:-400},tags:[],story:"　　鲜果在当日完成脱皮，随后进入无量山冷泉水槽反复清洗。清凉流水带走黏附果胶，也冲淡了田间可能留下的药剂痕迹。高架床上的生豆迅速而均匀地干燥，杯中风味变得清澈，原料本身的高山酸质终于完整显现。"},
        {key:"B",process:"natural",title:"☀️ 澜沧江河谷暖阳慢速日晒",short:"　在高架网床慢干 25 天，让果肉糖分深入生豆。",image:A+"mainpage_phase5_B.png",cost:"-¥250",trends:["平衡","甜感 ↑","洁净有要求"],effects:{gold:-250},tags:[],story:"　　整颗咖啡果被均匀摊上河谷高架网床，白天接受暖阳与谷风，夜里覆布回潮。工人持续二十五天翻耙，果肉糖分缓慢进入生豆。空气里逐渐出现熟果、红糖与坚果气息，原料洁净度则决定这些甜香是否干净。"},
        {key:"C",process:"anaerobic",title:"🧪 无量山恒温罐控温厌氧发酵",short:"　72 小时密闭发酵，以极高风险冲击夜茉莉与陈酿。",image:A+"mainpage_phase5_C.png",cost:"-¥600",trends:["高风险","高回报","原料要求高"],effects:{gold:-600},tags:[],story:"　　全红果被装入不锈钢罐，排出氧气后在山间低温里静置七十二小时。压力表轻轻起伏，发酵香从取样阀中逸出。这个过程会放大最好的花香，也会放大任何隐藏瑕疵；开罐的一刻，整季经营的答案终于清晰。"}
      ]
    }
  ];

  // 企划数据保留基础价格，运行时统一套用费用倍率，便于后续整体调价。
  const costMultiplier=CG.config.optionCostMultiplier||1;
  CG.rounds.forEach(round=>round.options.forEach(option=>{
    if(option.effects.gold<0){
      option.effects.gold*=costMultiplier;
      option.cost="-¥"+Math.abs(option.effects.gold).toLocaleString("zh-CN");
    }
  }));
})(window.CoffeeGame);
