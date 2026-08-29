import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT="C:\\Users\\Bocchi\\Desktop\\get_your_coffee";
const BUILD=path.join(ROOT,"artifacts","ppt_build");
const OUTPUT=path.join(ROOT,"artifacts","KFTI_咖啡庄园项目汇报_修订版.pptx");
const PPT_IMG=path.join(ROOT,"PPT图片");
const W=1280,H=720;

const C={
  paper:"#F7F0E4",
  paper2:"#EFE2D1",
  ink:"#302218",
  coffee:"#6E3F27",
  coffee2:"#9A6545",
  green:"#5D743E",
  sage:"#A8B18B",
  sand:"#CBB596",
  white:"#FFFDF8",
  muted:"#75675B",
  line:"#D9C8B0",
};

async function writeBlob(file,blob){
  await fs.writeFile(file,new Uint8Array(await blob.arrayBuffer()));
}

function addRect(slide,name,position,fill,line={style:"solid",fill:"none",width:0},radius=0,shadow){
  return slide.shapes.add({geometry:"rect",name,position,fill,line,borderRadius:radius,shadow});
}

function addText(slide,name,text,position,{fontSize=22,color=C.ink,bold=false,typeface="Microsoft YaHei",alignment="left",verticalAlignment="top",lineSpacing=1.15,fill="none",insets={top:0,right:0,bottom:0,left:0}}={}){
  const box=slide.shapes.add({geometry:"textbox",name,position,fill,line:{style:"solid",fill:"none",width:0}});
  box.text=text;
  box.text.style={fontSize,color,bold,typeface,alignment,verticalAlignment,lineSpacing,autoFit:"shrinkText",insets};
  return box;
}

function addRule(slide,name,left,top,width,color=C.line,height=2){
  return addRect(slide,name,{left,top,width,height},color);
}

function addImage(slide,name,imagePath,position,{fit="contain",radius=18,shadow=true,alt=name,crop}={}){
  if(shadow)addRect(slide,`${name}-shadow`,{left:position.left+8,top:position.top+10,width:position.width,height:position.height},"#3A2418/14",{style:"solid",fill:"none",width:0},radius);
  return slide.images.add({blob:readFileSync(imagePath),contentType:"image/png",alt,fit,position,geometry:"roundRect",borderRadius:radius,...(crop?{crop}:{})});
}

function addFooter(slide,page){
  addRule(slide,`footer-line-${page}`,70,676,1140,C.line,1);
  addText(slide,`footer-label-${page}`,"KFTI × 南涧咖啡庄园",{left:72,top:684,width:300,height:20},{fontSize:14,color:C.muted,bold:true});
  addText(slide,`footer-page-${page}`,String(page).padStart(2,"0"),{left:1150,top:684,width:58,height:20},{fontSize:14,color:C.muted,bold:true,alignment:"right"});
}

function addHeader(slide,page,eyebrow,title,subtitle=""){
  slide.background.fill=C.paper;
  addText(slide,`eyebrow-${page}`,eyebrow,{left:72,top:42,width:430,height:24},{fontSize:16,color:C.coffee2,bold:true});
  addText(slide,`title-${page}`,title,{left:72,top:72,width:1136,height:70},{fontSize:48,color:C.ink,bold:true,lineSpacing:1});
  if(subtitle)addText(slide,`subtitle-${page}`,subtitle,{left:72,top:145,width:1030,height:34},{fontSize:22,color:C.muted});
  addRule(slide,`accent-${page}`,72,183,90,C.coffee2,4);
  addFooter(slide,page);
}

function setNotes(slide,body,sources){
  slide.speakerNotes.textFrame.setText(`${body}\n\n[Sources]\n${sources.map(s=>`- ${s}`).join("\n")}`);
  slide.speakerNotes.setVisible(true);
}

const deck=Presentation.create({slideSize:{width:W,height:H}});

// 01 — 封面
{
  const slide=deck.slides.add();
  slide.background.fill=C.paper;
  addRect(slide,"cover-rail",{left:0,top:0,width:24,height:H},C.coffee);
  addText(slide,"cover-kicker","INTERACTIVE COFFEE EXPERIENCE",{left:86,top:100,width:540,height:34},{fontSize:18,color:C.coffee2,bold:true});
  addText(slide,"cover-title","KFTI ×\n南涧咖啡庄园",{left:82,top:185,width:640,height:178},{fontSize:68,color:C.ink,bold:true,lineSpacing:1});
  addText(slide,"cover-subtitle","从认识自己的咖啡偏好，到经营一座山地庄园",{left:86,top:390,width:610,height:76},{fontSize:32,color:C.coffee,bold:true,lineSpacing:1.2});
  addRule(slide,"cover-rule",86,500,118,C.coffee2,5);
  addText(slide,"cover-meta","项目汇报 · 互动测试 × 经营模拟",{left:86,top:535,width:600,height:36},{fontSize:22,color:C.muted});
  addImage(slide,"cover-landscape",path.join(ROOT,"frontend","assets","images","stages","mainpage_phase1_middle_picture.png"),{left:790,top:70,width:410,height:580},{fit:"cover",radius:26,alt:"无量山咖啡庄园山地场景"});
  setNotes(slide,"开场先强调：这不是两个孤立页面，而是围绕咖啡认知设计的两段连续体验。",[
    "frontend/assets/images/stages/mainpage_phase1_middle_picture.png",
  ]);
}

// 02 — 两个小游戏首页
{
  const slide=deck.slides.add();
  addHeader(slide,2,"项目界面","两个小游戏，从不同入口走近咖啡","KFTI 从个人偏好出发，南涧咖啡庄园从产区经营出发。 ");
  addImage(slide,"home-kfti",path.join(PPT_IMG,"KFTI_page.png"),{left:112,top:205,width:310,height:440},{fit:"contain",radius:22,alt:"KFTI 咖啡人格测试首页"});
  addImage(slide,"home-estate",path.join(PPT_IMG,"page.png"),{left:858,top:205,width:310,height:440},{fit:"contain",radius:22,alt:"南涧咖啡庄园首页"});
  addText(slide,"home-left-label","KFTI 咖啡人格测试",{left:112,top:620,width:310,height:30},{fontSize:21,color:C.coffee,bold:true,alignment:"center"});
  addText(slide,"home-right-label","南涧咖啡庄园",{left:858,top:620,width:310,height:30},{fontSize:21,color:C.green,bold:true,alignment:"center"});
  addText(slide,"home-center-top","认识自己",{left:490,top:290,width:300,height:44},{fontSize:30,color:C.coffee,bold:true,alignment:"center"});
  addText(slide,"home-center-arrow","↓",{left:600,top:355,width:80,height:50},{fontSize:30,color:C.sand,bold:true,alignment:"center"});
  addText(slide,"home-center-bottom","理解产区",{left:490,top:425,width:300,height:44},{fontSize:30,color:C.green,bold:true,alignment:"center"});
  addText(slide,"home-center-caption","两段体验，共同组成\n完整的咖啡认知链",{left:482,top:510,width:316,height:72},{fontSize:22,color:C.ink,bold:true,alignment:"center",lineSpacing:1.3});
  setNotes(slide,"这一页单独展示两个小游戏的入口：首页视觉不同，但都以轻量、移动端和咖啡文化为共同体验基础。",[
    "PPT图片/KFTI_page.png",
    "PPT图片/page.png",
  ]);
}

// 03 — 双产品定位
{
  const slide=deck.slides.add();
  addHeader(slide,3,"01 / 项目定位","两条体验路径，回答同一个问题","怎样让咖啡从“饮品”变成可理解、可参与、可复玩的文化体验？");
  addText(slide,"s2-left-index","01",{left:92,top:235,width:100,height:72},{fontSize:58,color:C.coffee2,bold:true});
  addText(slide,"s2-left-title","KFTI 咖啡人格测试",{left:92,top:315,width:430,height:44},{fontSize:32,color:C.ink,bold:true});
  addText(slide,"s2-left-body","从日常选择切入，把奶感、仪式、猎奇与酸苦偏好转译成一组可被讲述的咖啡人格。",{left:92,top:378,width:430,height:120},{fontSize:22,color:C.muted,lineSpacing:1.35});
  addText(slide,"s2-left-outcome","认识自己 → 找到风味入口",{left:92,top:540,width:430,height:38},{fontSize:24,color:C.coffee,bold:true});

  addRule(slide,"s2-divider",628,230,2,C.line,350);

  addText(slide,"s2-right-index","02",{left:708,top:235,width:100,height:72},{fontSize:58,color:C.green,bold:true});
  addText(slide,"s2-right-title","南涧咖啡庄园",{left:708,top:315,width:430,height:44},{fontSize:32,color:C.ink,bold:true});
  addText(slide,"s2-right-body","把产区、农艺、采收与处理变成五轮经营决策，让玩家亲手承担成本、风险与品质之间的取舍。",{left:708,top:378,width:430,height:120},{fontSize:22,color:C.muted,lineSpacing:1.35});
  addText(slide,"s2-right-outcome","理解产区 → 看见选择后果",{left:708,top:540,width:430,height:38},{fontSize:24,color:C.green,bold:true});
  setNotes(slide,"这一页建立整体框架：KFTI负责降低理解门槛，庄园负责把知识变成决策，两者共同完成从偏好到产区的认知链。",[
    "PPT图片/KFTI_page.png",
    "PPT图片/page.png",
    "README.md",
  ]);
}

// 04 — KFTI机制
{
  const slide=deck.slides.add();
  addHeader(slide,4,"02 / KFTI 机制","12 道情境题，把抽象偏好变成四维人格","题目不直接问“喜欢哪种豆”，而是用团队协作、生活习惯与选择方式映射偏好。 ");
  addImage(slide,"kfti-question",path.join(PPT_IMG,"KFTI_choice.png"),{left:82,top:205,width:300,height:440},{fit:"contain",radius:20,alt:"KFTI 情境选择题页面"});
  addText(slide,"s3-claim","四个维度共同构成人格代码",{left:468,top:218,width:660,height:42},{fontSize:32,color:C.ink,bold:true});
  const dims=[
    ["M · Milk","奶感与连接","关注温和、包容与情绪联结"],
    ["R · Ritual","仪式与层次","偏好结构、过程与完整体验"],
    ["X · Novelty","新奇与反差","乐于尝试非典型组合与复杂风味"],
    ["A · Acid / Bitter","酸苦取向","强调鲜明个性，而非迎合多数口味"],
  ];
  dims.forEach((d,i)=>{
    const y=292+i*79;
    addText(slide,`s3-code-${i}`,d[0],{left:468,top:y,width:185,height:34},{fontSize:24,color:i<2?C.coffee:C.green,bold:true});
    addText(slide,`s3-name-${i}`,d[1],{left:668,top:y,width:180,height:34},{fontSize:22,color:C.ink,bold:true});
    addText(slide,`s3-desc-${i}`,d[2],{left:850,top:y,width:350,height:44},{fontSize:20,color:C.muted});
    if(i<3)addRule(slide,`s3-sep-${i}`,468,y+55,715,C.line,1);
  });
  setNotes(slide,"KFTI 的信息设计重点是：先让用户回答熟悉的情境，再在结果页解释咖啡偏好的含义，降低专业术语的进入门槛。",[
    "PPT图片/KFTI_choice.png",
    "PPT图片/KFTI_result_2.png",
  ]);
}

// 05 — KFTI结果
{
  const slide=deck.slides.add();
  addHeader(slide,5,"03 / KFTI 输出","结果不止给标签，还给出一套可继续探索的线索","人格代码、风味档案、产区推荐、四维解释与关系提示共同组成完整结果页。 ");
  const positions=[
    {left:66,top:205,width:338,height:440},
    {left:470,top:205,width:338,height:440},
    {left:874,top:205,width:338,height:440},
  ];
  ["KFTI_result_1.png","KFTI_result_2.png","KFTI_result_3.png"].forEach((f,i)=>addImage(slide,`kfti-result-${i+1}`,path.join(PPT_IMG,f),positions[i],{fit:"cover",radius:18,alt:`KFTI 结果页第 ${i+1} 部分`}));
  addText(slide,"s4-label-1","身份与风味",{left:94,top:608,width:280,height:28},{fontSize:18,color:C.white,bold:true,alignment:"center",fill:"#5A3322/88",insets:{top:3,right:8,bottom:3,left:8}});
  addText(slide,"s4-label-2","四维拆解",{left:498,top:608,width:280,height:28},{fontSize:18,color:C.white,bold:true,alignment:"center",fill:"#5A3322/88",insets:{top:3,right:8,bottom:3,left:8}});
  addText(slide,"s4-label-3","高光与关系",{left:902,top:608,width:280,height:28},{fontSize:18,color:C.white,bold:true,alignment:"center",fill:"#5A3322/88",insets:{top:3,right:8,bottom:3,left:8}});
  setNotes(slide,"以 MRXA“层次探索家”为例，结果页同时回答‘我是谁、我偏好什么、可以喝什么、为什么会这样’，把一次测试变成后续探索入口。",[
    "PPT图片/KFTI_result_1.png",
    "PPT图片/KFTI_result_2.png",
    "PPT图片/KFTI_result_3.png",
  ]);
}

// 06 — 庄园主循环
{
  const slide=deck.slides.add();
  addHeader(slide,6,"04 / 庄园主循环","五轮经营，把产区知识放进真实取舍","每一次选择都同时改变资金、产量、树体活力、风味潜力与纯净度。 ");
  addText(slide,"s5-number","5",{left:80,top:215,width:130,height:115},{fontSize:92,color:C.green,bold:true});
  addText(slide,"s5-number-label","个经营阶段",{left:205,top:252,width:260,height:52},{fontSize:32,color:C.ink,bold:true});
  addText(slide,"s5-stages","建园　→　生长　→　开花　→　采收　→　处理",{left:80,top:350,width:700,height:44},{fontSize:26,color:C.coffee,bold:true});
  addRule(slide,"s5-stage-rule",80,416,670,C.line,2);
  addText(slide,"s5-detail","15 个主线选项围绕海拔与品种、遮阴生态、挂果策略、采收标准和生豆处理展开。玩家看到的是方向性趋势，精确影响在选择后揭晓。",{left:80,top:448,width:670,height:132},{fontSize:22,color:C.muted,lineSpacing:1.35});
  addText(slide,"s5-resource","资金 · 预计产量 · 树体活力 · 风味潜力 · 纯净度",{left:80,top:603,width:670,height:34},{fontSize:22,color:C.green,bold:true});
  addImage(slide,"estate-choice",path.join(PPT_IMG,"choice.png"),{left:865,top:195,width:320,height:468},{fit:"contain",radius:20,alt:"南涧咖啡庄园第一阶段选择界面"});
  setNotes(slide,"庄园端的核心不是记知识点，而是理解变量之间的耦合：高风味往往意味着更高成本、更慢生长或更低产量。",[
    "PPT图片/choice.png",
    "README.md",
    "frontend/js/game/rounds.js",
  ]);
}

// 07 — 随机事件
{
  const slide=deck.slides.add();
  addHeader(slide,7,"05 / 风险与决策","随机事件让农业经营的风险变得可感知","危机与奇遇不是装饰，而是要求玩家在资金、树势和长期品质之间再次取舍。 ");
  addImage(slide,"estate-event",path.join(PPT_IMG,"accident.png"),{left:72,top:195,width:375,height:470},{fit:"contain",radius:20,alt:"南涧咖啡庄园突发事件卡"});
  addText(slide,"s6-big","13",{left:525,top:222,width:120,height:90},{fontSize:78,color:C.coffee2,bold:true});
  addText(slide,"s6-big-label","个事件池条目",{left:648,top:252,width:260,height:42},{fontSize:30,color:C.ink,bold:true});
  addText(slide,"s6-body","前三轮各进行一次随机判定，可能出现风调雨顺、奇遇或危机。每个事件提供三种应对：投入资源解决、接受局部损失，或承担不确定结果。",{left:525,top:335,width:660,height:112},{fontSize:22,color:C.muted,lineSpacing:1.35});
  addText(slide,"s6-example-title","以“干热春旱”为例",{left:525,top:485,width:330,height:36},{fontSize:26,color:C.green,bold:true});
  addText(slide,"s6-example","铺设滴灌：资金换活力\n覆草堆肥：低成本缓解损失\n听天由命：零成本，但结果取决于树势",{left:525,top:535,width:600,height:105},{fontSize:21,color:C.ink,lineSpacing:1.4});
  setNotes(slide,"事件系统把气候、病虫害、劳动力与乡土互助等因素转化为玩家可以理解的经营压力。",[
    "PPT图片/accident.png",
    "README.md",
    "frontend/js/game/events.js",
    "frontend/js/game/engine.js",
  ]);
}

// 08 — 结算链
{
  const slide=deck.slides.add();
  addHeader(slide,8,"06 / 反馈闭环","选择最终被翻译成品质、市场与利润","从资源变化到标签，从 SCA 与瑕疵率到买家报价，结果始终可追溯到此前的经营取舍。 ");
  addImage(slide,"round-summary",path.join(PPT_IMG,"summary.png"),{left:54,top:202,width:300,height:442},{fit:"contain",radius:18,alt:"本轮结算卡"});
  addImage(slide,"trade-card",path.join(PPT_IMG,"trading_card.png"),{left:395,top:202,width:300,height:442},{fit:"contain",radius:18,alt:"生豆交易结算卡"});
  const chain=[
    ["01","资源与标签","记录每轮选择造成的即时变化"],
    ["02","品质与瑕疵","综合风味潜力、纯净度、活力和标签"],
    ["03","买家与单价","根据 SCA、处理法和生态认证匹配市场"],
    ["04","营收与净利润","扣除成本、折旧与负债后形成最终成绩"],
  ];
  chain.forEach((item,i)=>{
    const y=218+i*100;
    addText(slide,`s7-num-${i}`,item[0],{left:770,top:y,width:60,height:34},{fontSize:20,color:i<2?C.coffee2:C.green,bold:true});
    addText(slide,`s7-title-${i}`,item[1],{left:842,top:y,width:290,height:34},{fontSize:24,color:C.ink,bold:true});
    addText(slide,`s7-desc-${i}`,item[2],{left:842,top:y+38,width:350,height:42},{fontSize:19,color:C.muted});
    if(i<3)addRule(slide,`s7-line-${i}`,770,y+82,420,C.line,1);
  });
  addText(slide,"s7-end","一局经营，形成一条完整的因果链。",{left:770,top:620,width:430,height:34},{fontSize:24,color:C.coffee,bold:true});
  setNotes(slide,"这一页强调系统的可解释性：玩家不仅看到一个分数，还能看到每轮资源、标签、买家、单价与净利润是如何形成的。",[
    "PPT图片/summary.png",
    "PPT图片/trading_card.png",
    "README.md",
    "frontend/js/game/settlement.js",
  ]);
}

// 09 — 复玩与技术质量
{
  const slide=deck.slides.add();
  addHeader(slide,9,"07 / 可复玩与验证","榜单把单局结果变成可比较、可复盘的反馈","每位庄园主只保留净利润最高的一局，鼓励玩家重走路线并理解差异。 ");
  addText(slide,"s8-claim","产品已经形成可运行、可验证的闭环",{left:78,top:222,width:610,height:48},{fontSize:32,color:C.ink,bold:true});
  const points=[
    ["刷新续玩","当前对局、待处理弹窗和选择日志均可恢复"],
    ["规则回归","核心数值、标签、免疫与结算规则由自动测试覆盖"],
    ["数值模拟","Monte Carlo 可批量运行 100,000 局观察分布"],
    ["榜单反馈","本地历史保留个人最佳局，并展示利润与 SCA"],
  ];
  points.forEach((p,i)=>{
    const y=310+i*78;
    addText(slide,`s8-point-title-${i}`,p[0],{left:78,top:y,width:145,height:34},{fontSize:23,color:i<2?C.coffee2:C.green,bold:true});
    addText(slide,`s8-point-desc-${i}`,p[1],{left:236,top:y,width:480,height:46},{fontSize:20,color:C.muted});
    if(i<3)addRule(slide,`s8-sep-${i}`,78,y+56,620,C.line,1);
  });
  addImage(slide,"ranking",path.join(PPT_IMG,"ranking.png"),{left:820,top:190,width:350,height:470},{fit:"contain",radius:20,alt:"南涧咖啡庄园排行榜界面"});
  setNotes(slide,"除玩法闭环外，庄园端还提供刷新续玩、自动测试与数值模拟，使演示版本具备继续迭代的工程基础。",[
    "PPT图片/ranking.png",
    "README.md",
    "tests/game.test.js",
    "scripts/simulation.js",
  ]);
}

// 10 — 收束与下一步
{
  const slide=deck.slides.add();
  slide.images.add({blob:readFileSync(path.join(ROOT,"frontend","assets","images","stages","mainpage_phase5_middle_picture.png")),contentType:"image/png",alt:"咖啡处理阶段山地场景",fit:"cover",position:{left:0,top:0,width:W,height:H}});
  addRect(slide,"final-paper-overlay",{left:0,top:0,width:W,height:H},"#F7F0E4/88");
  addText(slide,"s9-kicker","PROJECT SYNTHESIS",{left:78,top:62,width:360,height:28},{fontSize:17,color:C.coffee2,bold:true});
  addText(slide,"s9-title","我们交付的不是两套页面，\n而是一条完整的咖啡认知路径",{left:78,top:116,width:960,height:128},{fontSize:52,color:C.ink,bold:true,lineSpacing:1.05});
  addRule(slide,"s9-rule",80,275,110,C.coffee2,5);
  const verbs=["认识自己","理解产区","承担决策","看见结果"];
  verbs.forEach((v,i)=>{
    addText(slide,`s9-verb-${i}`,v,{left:82+i*286,top:326,width:240,height:52},{fontSize:30,color:i<2?C.coffee:C.green,bold:true,alignment:"center"});
    if(i<3)addText(slide,`s9-arrow-${i}`,"→",{left:300+i*286,top:328,width:70,height:44},{fontSize:28,color:C.sand,bold:true,alignment:"center"});
  });
  addText(slide,"s9-next-title","下一步，让两段体验真正连起来",{left:82,top:445,width:500,height:40},{fontSize:28,color:C.ink,bold:true});
  addText(slide,"s9-next","KFTI 结果联动庄园首轮路线推荐　·　统一身份与可分享结果报告　·　完成服务端权威复算与公开榜单",{left:82,top:510,width:1080,height:74},{fontSize:22,color:C.muted,lineSpacing:1.35});
  addText(slide,"s9-close","让每一次喝咖啡，都成为理解风味与土地的开始。",{left:82,top:625,width:930,height:38},{fontSize:26,color:C.coffee,bold:true});
  setNotes(slide,"收束时回到开场：KFTI帮助用户找到自己的入口，庄园让用户理解一杯咖啡背后的土地与经营。下一步重点是把两段体验通过推荐、身份与分享机制连成完整产品。",[
    "frontend/assets/images/stages/mainpage_phase5_middle_picture.png",
    "README.md",
    "PPT图片目录内全部用户提供截图",
  ]);
}

await fs.mkdir(path.join(BUILD,"rendered"),{recursive:true});
for(const [index,slide] of deck.slides.items.entries()){
  const png=await deck.export({slide,format:"png",scale:1});
  await writeBlob(path.join(BUILD,"rendered",`slide-${index+1}.png`),png);
  const layout=await slide.export({format:"layout"});
  await fs.writeFile(path.join(BUILD,"rendered",`slide-${index+1}.layout.json`),await layout.text());
}
const montage=await deck.export({format:"webp",montage:true,scale:1});
await writeBlob(path.join(BUILD,"deck-montage.webp"),montage);
const pptx=await PresentationFile.exportPptx(deck);
await pptx.save(OUTPUT);
console.log(OUTPUT);
