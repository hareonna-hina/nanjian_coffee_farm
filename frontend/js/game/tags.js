/**
 * 标签字典模块。
 * 键是规则引擎保存的稳定标签 ID；值包含展示信息、来源说明和终局效果文案。
 * engine.js 负责授予/移除标签，settlement.js 负责读取会影响结算的标签。
 */
(function(CG){
  CG.tags={
    mountain_mist:{icon:"🏔️",name:"无量巅云雾慢熟",category:"风土印记",source:"R1 主线",description:"极高海拔的云雾与冷凉延长浆果成熟期，使香气前体缓慢积累，也增强咖啡树面对倒春寒的抵抗力。",effect:"风味积累更强；遭遇倒春寒时损伤降低。"},
    bourbon_nut:{icon:"🍬",name:"罗伯克经典坚果",category:"风土印记",source:"R1 主线",description:"红壤老茶园缓坡孕育出的经典波旁风貌，甜感平衡，常见坚果与焦糖调性。",effect:"记录本局的经典稳健品种路线。"},
    rust_immune:{icon:"🛡️",name:"河谷抗病金身",category:"机制",source:"R1 主线",description:"梯田卡蒂姆继承了强韧的抗病基因，能在湿热环境里保持叶片健康。",effect:"抽中任一叶锈病事件时无损免疫。"},
    walnut_shade:{icon:"🌿",name:"无量山核桃林遮阴",category:"生态认证",source:"R2 主线",description:"高山核桃与野樱花提供柔和遮阴，落叶改善土壤团粒结构，形成稳定的林下微气候。",effect:"终局收购单价 +15%；R2 奇遇概率提高。"},
    full_sun:{icon:"☀️",name:"谷风暴风速生",category:"机制",source:"R2 主线",description:"全光照密植让树体快速分枝并提高产量，但也放大干热与山火风险。",effect:"本轮显著增产；R2 危机概率提高。"},
    mixed_forest:{icon:"🍊",name:"酸木瓜与古茶共韵",category:"生态认证",source:"R2 主线",description:"古茶树、酸木瓜与咖啡共同组成复合林相，花粉和落果微生物塑造独特的山野果韵。",effect:"终局收购单价 +10%。"},
    thinning_sugar:{icon:"🍯",name:"彝妹疏果浓糖",category:"机制",source:"R3 主线",description:"精细疏果将树体养分集中到少量核心果实，显著提高糖度与风味潜能。",effect:"大幅提高风味潜能与纯净度，但牺牲产量。"},
    high_yield:{icon:"📦",name:"梯田枝头硕果",category:"风土印记",source:"R3 主线",description:"保果微肥带来整齐繁密的果串，记录庄园追求规模产出的集约化农艺路线。",effect:"显著增产，但透支树体与部分风味。"},
    bees:{icon:"🐝",name:"无量深山土蜂共生",category:"生态认证",source:"R3 主线 / 随机事件",description:"中华黑蜂促进咖啡花充分授粉，也证明庄园保有健康的生物多样性。",effect:"终局收购单价 +10%。"},
    zero_defect:{icon:"💎",name:"彝乡零瑕疵",category:"机制",source:"R4 主线",description:"多轮只采成熟红果，剔除青果、黑果和虫蛀果，给高风险发酵留下极洁净的原料。",effect:"厌氧大成功必要条件；终局瑕疵率额外降低 1.5%。"},
    bulk_pick:{icon:"⚙️",name:"水渠浮选大通采",category:"风土印记",source:"R4 主线",description:"震枝通采配合水渠浮选，效率很高，但不同成熟度的果实会混在一起。",effect:"保住产量与资金，降低少量风味与纯净度。"},
    late_harvest:{icon:"🍷",name:"枯霜晚采挂枝干",category:"风土印记",source:"R4 主线",description:"浆果在枝头经历微霜与谷风，发生轻度脱水，糖分和酒韵更加集中。",effect:"提升风味潜能，但显著降低纯净度。"},
    organic:{icon:"🌱",name:"滇西高山有机手作",category:"生态认证",source:"随机事件",description:"以人工剪除病枝、物理清园代替化学农药，保住庄园的高山有机信誉。",effect:"终局收购单价 +20%。"},
    residue:{icon:"⚠️",name:"药剂微残留",category:"惩罚",source:"随机事件",description:"波尔多液快速遏制病害，却给生豆留下药剂涩感与认证风险。",effect:"SCA -3.0；所有生态溢价归零。可被 R5 水洗清除。"},
    dying:{icon:"🍂",name:"哀牢落叶/早采青涩",category:"被动缺陷",source:"树体濒死 / 随机事件",description:"树势严重受损后叶片脱落，未熟果被迫提前采收，带来明显青涩和产量损失。",effect:"SCA -2.5；首次由濒死触发时纯净度 -10、产量 ×0.85。"},
    washed_legend:{icon:"🍋",name:"佛手柑与高山野白花",category:"风味",source:"R5 水洗",description:"冷泉洗净果胶，清晰展现佛手柑般明澈的酸质与高山野白花香。",effect:"SCA +4.0。"},
    washed_clean:{icon:"🍏",name:"澜沧江柑橘明澈酸",category:"风味",source:"R5 水洗",description:"纯净平衡的柑橘与青苹果酸质，适合精品商业咖啡馆。",effect:"SCA +2.5。"},
    washed_tea:{icon:"🍵",name:"罗伯克清淡绿茶感",category:"风味",source:"R5 水洗",description:"水洗去除了杂味，但原料风味积累有限，呈现清淡绿茶与草本气息。",effect:"SCA +1.0。"},
    natural_legend:{icon:"🍍",name:"峡谷热带果脯与黑糖",category:"风味",source:"R5 日晒",description:"河谷暖阳让果肉糖分缓慢渗入生豆，形成热带果脯、熟木瓜与黑糖甜感。",effect:"SCA +4.5。"},
    natural_nut:{icon:"🌰",name:"高山泡核桃与焦糖",category:"风味",source:"R5 日晒",description:"经典坚果、烤杏仁与焦糖调性，醇厚平衡，适合意式拼配。",effect:"SCA +2.0。"},
    natural_earth:{icon:"🍂",name:"梯田杂草与泥土涩感",category:"风味缺陷",source:"R5 日晒",description:"纯净度不足让慢速日晒混入落地土味、草本与收敛涩感。",effect:"SCA -2.0。"},
    anaerobic_legend:{icon:"✨",name:"无量夜茉莉与陈酿",category:"金色风味",source:"R5 厌氧",description:"极净全红果在冷凉恒温罐中形成浓郁夜茉莉花香与陈酿酒韵，是竞拍级表现。",effect:"SCA +6.5；进入顶级竞拍团的必要标签。"},
    anaerobic_wine:{icon:"🍷",name:"彝乡风干果酒香",category:"风味",source:"R5 厌氧",description:"适度无氧代谢形成熟苹果、红葡萄与彝家野果酒般的复合香气。",effect:"SCA +3.0。"},
    anaerobic_fail:{icon:"🤢",name:"闷罐败酸与烂果腐臭",category:"致命缺陷",source:"R5 厌氧",description:"原料条件不足使杂菌和醋酸菌失控，出现刺鼻败酸与腐败果味。",effect:"SCA -10.0；无法进入独立精品烘焙商合同。"}
  };
})(window.CoffeeGame);
