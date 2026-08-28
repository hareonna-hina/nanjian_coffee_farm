# 南涧咖啡庄园

“南涧咖啡庄园”是依据《企划书 2.1》实现的移动端网页经营游戏。玩家在建园、生长、开花、采收、处理五个阶段做决策，经历随机奇遇或危机，最终以 SCA、瑕疵率、买家报价和净利润完成经营结算。

当前版本使用 **375 × 700 设计坐标系**，打开网页就直接进入游戏，不包含模拟手机边框、系统状态栏或网页内嵌预览说明。实际显示尺寸根据设备视口按 `min(视口宽/375, 视口高/700)` 等比计算：小屏缩小、大屏放大，并在剩余空间内水平、垂直居中。

前端使用原生 HTML、CSS 和经典 JavaScript 脚本，无打包器、无运行时依赖、无远程图片；默认以 `localStorage` 完成本地身份、续玩和排行榜闭环。

## 快速运行

环境要求：Python 3（本地静态服务器）和 Node.js 18+（测试与数值模拟）。游戏运行本身只需要现代浏览器。

```powershell
npm run serve
```

浏览器打开 `http://127.0.0.1:4173/`。也可直接打开 `frontend/index.html`，但推荐使用本地服务器，以获得与 GitHub Pages 一致的资源路径行为。

可用命令：

| 命令 | 作用 |
| --- | --- |
| `npm run serve` | 以 `frontend/` 为根目录启动 4173 端口静态服务器 |
| `npm test` | 运行核心规则回归测试和本地图片引用完整性测试 |
| `npm run simulate` | 随机运行 100,000 局，输出数值分布和高利润路线分布 |
| `node scripts/simulation.js 1000` | 自定义模拟局数，本例运行 1,000 局 |

## 已实现的游戏范围

- 开始页、首次昵称设置、8 位匿名 UID、帮助、五张风土志与排行榜。
- 五轮共十五个主线选项，选择前仅展示成本和方向性趋势，选择后才揭示精确变化。
- R1–R3 各一次随机判定，共十三个事件池条目和全部应对分支；R4 直接进入 R5。
- 资金、预计产量、树体活力、风味潜力、纯净度五项核心状态。
- 树体疲劳、首次濒死惩罚、活力归零绝收、卡蒂姆叶锈病免疫、标签去重。
- 水洗、日晒、厌氧三种处理法及其门槛；水洗可清除药剂微残留。
- SCA、瑕疵率、交割产量、买家、生态溢价、单价、营收、净利润和段位结算。
- 杯测卡 → 交易卡 → 成绩卡 → 排行榜/重新经营的完整闭环。
- 刷新续玩：主线故事、风调雨顺、事件免疫、待选事件都能恢复且不会重复计算。
- 项目内 43 张运行时图片全部本地化。企划书要求不做动画，因此只保留按钮按压和 Toast 状态反馈。

## 文件夹架构

```text
get_your_coffee/
├─ frontend/                     # 可直接部署的完整静态游戏
│  ├─ index.html                 # DOM 骨架和脚本加载顺序
│  ├─ manifest.json              # PWA 名称、主题色、启动方式
│  ├─ assets/images/             # 运行时图片，共 43 张
│  │  ├─ start/                  # 开始页背景（1）
│  │  ├─ stages/                 # 五轮中图和 A/B/C 选项插画（21）
│  │  ├─ events/                 # 随机事件插画（12）
│  │  └─ ui/                     # 主界面、帮助、事件、标签、结算、榜单底图（9）
│  ├─ css/                       # 样式分层
│  └─ js/
│     ├─ config.js               # 全局配置与 CoffeeGame 命名空间
│     ├─ game/                   # 纯数据、状态、规则与终局公式
│     ├─ api/                    # Supabase Auth/Functions/排行榜与本地降级适配
│     ├─ utils/                  # 格式化、随机数、视口缩放
│     ├─ ui/                     # DOM 页面与弹窗渲染
│     └─ main.js                 # 应用流程总编排入口
├─ supabase/                     # 远端数据库、RLS、公共榜单和 Edge Functions
│  ├─ config.toml
│  ├─ migrations/
│  └─ functions/
├─ scripts/                      # Monte Carlo 数值模拟入口
├─ tests/                        # 规则和资产回归测试
├─ .github/workflows/            # GitHub Pages 持续部署
├─ assets/                       # 43 张原始交付素材
├─ 示例UI/                       # 12 张企划界面参考图
├─ artifacts/                    # 阶段性浏览器验收截图，不参与运行或部署
├─ shared/rules/                 # 预留的前后端共享权威规则目录
├─ 企划书2.1.md                  # 游戏内容、界面与功能总需求
├─ 项目架构.txt                  # 目标工程组织方式
├─ 南涧大富翁变量表.md           # 资源变量与边界参考
├─ 南涧大富翁标签表.md           # 标签定义与效果参考
├─ 南涧大富翁计算逻辑.md         # 事件概率和终局公式参考
├─ package.json                  # 本地命令清单
├─ README.md                     # 本文档
└─ LICENSE                       # MIT 许可证
```

`assets/` 和 `示例UI/` 是原始需求/设计输入，`frontend/assets/images/` 是网页实际读取的发布资产；不要在代码中引用工作区外部路径。

## 各文件职责

### 前端入口与样式

| 文件 | 负责内容 |
| --- | --- |
| `frontend/index.html` | 定义开始页、经营页、弹窗根节点与 Toast；按依赖顺序加载全部 CSS/JS。页面根节点就是 375 × 700 游戏画布。 |
| `frontend/manifest.json` | 声明应用名称、短名称、主题色、背景色和 standalone 启动模式。JSON 语法不允许注释，因此职责记录在此。 |
| `frontend/css/reset.css` | 清除浏览器默认间距、统一盒模型、按钮、图片和标题列表的基础行为。 |
| `frontend/css/variables.css` | 集中定义墨绿、宣纸色、金色、阴影和中英文字体栈。 |
| `frontend/css/layout.css` | 375 × 700 设计坐标系、页面层叠、屏幕切换，以及自适应画布的居中基准。 |
| `frontend/css/components.css` | 主按钮、图标按钮、模态框、关闭按钮、滚动条、胶囊标签、趋势色和 Toast。 |
| `frontend/css/animations.css` | 响应系统“减少动态效果”偏好；按企划要求不提供持续动画。 |
| `frontend/css/pages.css` | 开始页、经营页、帮助、档案、故事、事件、标签、排行榜和三张结算卡的像素级布局。 |

### 游戏规则层 `frontend/js/game/`

| 文件 | 负责内容 | 主要输出/接口 |
| --- | --- | --- |
| `tags.js` | 维护所有标签的稳定 ID、图标、名称、类别、来源、叙事和实际效果。 | `CoffeeGame.tags` |
| `rounds.js` | 配置 R1–R5 的标题、故事、阶段图、十五个主线选项、资源效果、标签和 R5 处理法。 | `CoffeeGame.rounds` |
| `events.js` | 配置 R1–R3 的事件池、危机/奇遇类型、权重、三个应对选项与条件效果。 | `CoffeeGame.eventPools` |
| `state.js` | 创建初始状态，保存/恢复/清除当前对局，生成资源快照，增删查标签。 | `CoffeeGame.stateStore` |
| `engine.js` | 执行资源效果、硬边界、疲劳/濒死规则、R5 风味判定、事件抽取与主线/事件结算。 | `CoffeeGame.engine` |
| `settlement.js` | 计算 SCA、瑕疵率、交割产量、买家、生态溢价、营收、净利润、品质与段位。 | `calculateSettlement()`、`tierForProfit()` |

规则层不操作 DOM。测试和模拟脚本直接复用这组文件，因此浏览器玩法、单元测试和 Monte Carlo 不会出现三套公式。

### 数据适配层 `frontend/js/api/`

| 文件 | 负责内容 | 主要输出/接口 |
| --- | --- | --- |
| `supabase.js` | 使用公开 URL/publishable key 初始化浏览器客户端；SDK 不可用时自动转本地模式。 | `CoffeeGame.backend` |
| `auth.js` | 恢复 Supabase Session 或执行 Anonymous Auth；失败时保留本地身份。 | `auth.ensureAnonymous()` |
| `profile.js` | 本地持久化八位 UID/昵称，并通过 `update-profile` 同步远端档案。 | `profile.getOrCreate()`、`save()`、`updateName()` |
| `runs.js` | 保存最近 30 局；通过 `create-run` 取得服务端 run_id，通过 `submit-run` 提交终局。 | `runs.list()`、`createRemote()`、`submit()` |
| `leaderboard.js` | 查询公共只读 `leaderboard` view；不读取 `runs`、不按 auth_user_id 过滤，失败时回退本地榜。 | `leaderboard.get()` |

### 工具层 `frontend/js/utils/`

| 文件 | 负责内容 |
| --- | --- |
| `format.js` | 人民币、数字、单位、品质和趋势格式化；转义远端玩家昵称等外部文本。 |
| `random.js` | 提供统一 `[0,1)` 随机源；支持 URL `?rng=` 和 `use()` 注入固定序列进行复现。 |
| `viewport.js` | 按设备可用宽高对 375 × 700 根画布做 `contain` 式等比缩放，小屏缩小、大屏放大。 |

### UI 层 `frontend/js/ui/`

| 文件 | 负责内容 |
| --- | --- |
| `statusBar.js` | 把五项状态渲染到顶部；风味和纯净度只显示五档圆点，不显示后台精确数值。 |
| `decisionCards.js` | 渲染每轮三个主线选项及公开趋势，把选项索引回传给编排层。 |
| `eventModal.js` | 渲染随机事件故事、插画和三个应对按钮。 |
| `knowledgeModal.js` | 管理五张风土志内容与页签切换。 |
| `tagsModal.js` | 列出本局已获得标签，切换显示类别、来源、叙事和效果。 |
| `settlementModal.js` | 串联杯测卡、交易卡、成绩卡；绝收时显示失败卡。 |
| `leaderboardModal.js` | 渲染榜单、玩家 UID、利润、SCA 和自己的名次，可从成绩卡返回。 |
| `screens.js` | 管理通用弹窗、Toast、开始/经营页面切换、昵称、帮助、主线故事、平静和免疫结果。 |

### 应用入口、测试、后端与运维

| 文件 | 负责内容 |
| --- | --- |
| `frontend/js/config.js` | 创建全局命名空间，保存 375 × 700 设计尺寸、存储前缀和可选 Supabase 配置。 |
| `frontend/js/main.js` | 唯一业务编排入口：初始化、开始/续玩、主线后分流、事件结算、轮次推进和终局。 |
| `scripts/simulation.js` | 在 Node 中构造最小浏览器环境，随机运行大量完整对局并汇总分布。 |
| `scripts/simulation.py` | Python 兼容包装器，将参数和退出码转交给 JavaScript 模拟器。 |
| `tests/game.test.js` | 验证初始值、传奇厌氧、水洗去残留、疲劳、濒死、免疫、生态否决、边界和标签去重。 |
| `tests/assets.test.js` | 扫描 HTML/CSS/JS 的图片引用，验证文件存在且发布素材数不少于 43。 |
| `tests/backend.test.js` | 验证公共榜单字段、最佳局排序、runs 私有 RLS、Edge Function 所有权校验和前端查询边界。 |
| `supabase/config.toml` | Supabase 本地项目、API、匿名认证、站点 URL 和 Edge Function JWT 配置。 |
| `supabase/migrations/001_profiles.sql` | 创建玩家档案表及 UID/昵称约束。 |
| `supabase/migrations/002_runs.sql` | 创建对局状态枚举、对局表、最佳对局外键与查询索引。 |
| `supabase/migrations/003_leaderboard.sql` | 创建只暴露最佳局的公开排行榜视图及稳定排序规则。 |
| `supabase/migrations/004_rls.sql` | 开启 RLS，限制原始档案/对局访问，只公开排行榜视图。 |
| `supabase/migrations/005_public_leaderboard.sql` | 为已上线数据库重建公共只读榜单；每人按四级规则仅保留最佳局。 |
| `supabase/functions/create-run/index.ts` | 校验 Supabase 用户，为其创建服务端随机种子和 ongoing 对局。 |
| `supabase/functions/update-profile/index.ts` | 校验昵称并 upsert 玩家档案。 |
| `supabase/functions/submit-run/index.ts` | 校验 JWT、run_id 所有权、状态和载荷，以服务端权限写入终局并更新 best_run_id。 |
| `.github/workflows/deploy-pages.yml` | main 分支推送后使用 Node 22 先测试，再发布 `frontend/` 到 GitHub Pages。 |
| `package.json` | 声明 `serve`、`test`、`simulate` 命令；JSON 语法不允许行内注释。 |
| `.gitignore` | 排除 `node_modules`、系统杂项、临时截图、本地配置覆盖和环境变量文件。 |
| `LICENSE` | MIT 开源许可。 |

## 脚本加载链路

项目不使用 ES Module 或打包器。所有脚本都挂到同一个 `window.CoffeeGame` 命名空间，因此 `frontend/index.html` 中的顺序就是依赖顺序：

```text
config
  ↓
tags → rounds → events → state → settlement → engine
  ↓
supabase → auth → profile → runs → leaderboard
  ↓
format → random → viewport
  ↓
statusBar → decisionCards → eventModal → knowledgeModal → tagsModal
  → settlementModal → leaderboardModal → screens
  ↓
main（最后初始化和绑定事件）
```

更改脚本顺序时应先确认其使用的 `CoffeeGame.*` 是否已经由前面的文件创建。例如 `engine.js` 需要 `state.js`、`rounds.js`、`events.js` 和 `tags.js`，`main.js` 则依赖几乎所有模块，所以必须最后加载。

## 一局游戏的代码链路

### 1. 启动和匿名身份

```text
DOMContentLoaded
  → main.init()
  → viewport.fit()                    适配 375 × 700
  → auth.ensureAnonymous()
  → profile.getOrCreate()             读取或创建 UID
  → stateStore.load()                 恢复未完成对局
  → ui.showStart()                    显示开始/继续按钮
  → 首次无昵称时 ui.showProfile(true)
```

### 2. 主线选择

```text
decisionCards 点击
  → main.chooseRound(optionIndex)
  → engine.chooseRound(optionIndex)
      → stateStore.snapshot()         选择前快照
      → applyEffects()                应用资源变化和疲劳规则
      → addTags() / processTag()      添加普通标签或 R5 风味标签
      → criticalCheck()               首次濒死惩罚
      → normalize()                   截断资源边界
      → 保存 choices + pending + 状态
  → ui.showStory(result)
```

`pending` 在规则已经计算、但玩家尚未确认故事时写入。刷新后只恢复弹窗，不再次调用 `chooseRound()`，因此不会重复扣钱、加产量或授予标签。

### 3. 主线后的分流与随机事件

```text
故事卡“继续经营”
  → main.afterMainStory()
  ├─ R1–R3 → engine.rollEvent(round)
  │           ├─ null → showCalm() → advanceRound()
  │           ├─ immune → showImmune() → advanceRound()
  │           └─ event → showEvent()
  │                       → handleEvent()
  │                       → engine.chooseEvent()
  │                       → advanceRound() 或绝收终局
  ├─ R4 → advanceRound()，直接进入处理阶段
  └─ R5 → finishGame()
```

事件先用 `eventProbabilities()` 判定平静/奇遇/危机，再由 `selectWeighted()` 在对应池内按权重抽取。`random.js` 是唯一随机入口，因此测试可以稳定复现结果。

### 4. 终局结算和排行榜

```text
main.finishGame()
  → engine.finish()
  → calculateSettlement(state)
      → SCA 与风味修正
      → 瑕疵率与合格交割产量
      → 买家门槛与基础单价
      → 生态溢价与药剂残留否决
      → 营收、净利润、品质、段位
  → runs.submit()                     本地保存并调用 submit-run
  → settlementModal.showSettlement()
  → 杯测卡 → 交易卡 → 成绩卡
  → leaderboard.get()                 读取公共脱敏 view 的全服榜单
  → 查看排行榜或清档重新经营
```

## 状态与本地存储

所有 key 都以 `config.storagePrefix = "nanjian-coffee-v1"` 开头：

| localStorage key | 内容 | 写入模块 |
| --- | --- | --- |
| `nanjian-coffee-v1:profile` | `publicUid`、`playerName`、`createdAt` | `api/profile.js` |
| `nanjian-coffee-v1:run` | 当前完整对局、选择/事件日志、`pending`、结算结果 | `game/state.js` |
| `nanjian-coffee-v1:runs` | 最近 30 局的日志与结算摘要 | `api/runs.js` |

核心状态字段：

| 字段 | 含义 |
| --- | --- |
| `round` | 0–4 分别对应 R1–R5；终局推进后可为 5 |
| `gold` / `yield` | 当前资金和预计产量 |
| `health` / `potential` / `clarity` | 树体活力、风味潜力、纯净度 |
| `tags` / `flags` | 稳定标签 ID 与少量机制开关 |
| `choices` / `events` | 可审计的主线、事件选择日志 |
| `pending` | 刷新时要恢复的故事/平静/免疫/事件节点 |
| `status` | `ongoing` 或 `finished` |
| `settlement` | 最终标准化结算对象 |

## Supabase 远端链路与安全边界

- 浏览器只保存 Supabase URL 和 publishable key；secret/service-role key 只由 Edge Function 从环境变量读取。
- Anonymous Auth 用户在数据库中属于 `authenticated` 角色。
- `runs_select_own` 继续限制玩家只能读取自己的完整对局；客户端没有 runs UPDATE policy。
- `create-run` 和 `submit-run` 先验证 JWT，再以服务端权限写入；`submit-run` 同时匹配 `run_id` 与 `auth_user_id`。
- `leaderboard` 是单独的默认执行者权限 view，只投影 rank、昵称、公开 UID、净利润、SCA、交割产量和段位。
- view 对 `anon/authenticated` 只授予 SELECT，不支持客户端写入，也不暴露 run_id、auth_user_id、选择日志或 final_state。
- 005 视图直接从 finished runs 按“净利润 → SCA → 交割产量 → 更早完成”选择每人最佳局，不依赖 best_run_id 的更新时序。

当前 `submit-run` 已做身份、所有权、状态、字段范围和载荷裁剪，并由 Edge Function 执行数据库 UPDATE。若需要竞赛级防作弊，还应继续把随机数和完整规则迁入共享服务端模块，由 seed 和选择日志重放终局；当前安全边界保证的是“不能读写其他玩家完整记录”，不是阻止玩家篡改自己浏览器中的游戏逻辑。

## 验证方式

### 自动化规则与资产检查

```powershell
npm test
```

当前包含十二项规则断言，覆盖启动资金、成本倍率、负债、处理法、疲劳、濒死、免疫、生态否决、边界和标签唯一性。资产测试会扫描代码图片引用并核对 44 张发布图片；后端测试会检查排行榜/RLS/Edge Function/前端查询的安全边界。

### 数值分布检查

```powershell
npm run simulate
```

默认随机运行 100,000 局并输出 SCA、净利润、活力、交割产量、买家、段位和 Top 10% 路线选择次数。修改资源数值、事件概率、买家门槛或处理法判定后，应同时比较模拟分布，避免单条测试通过但整体经济系统失衡。

### 浏览器人工验收清单

- 在 375 × 700 视口下，游戏应铺满画布且没有手机边框、扬声器、系统状态栏或 Home 指示条。
- 在小于 375 × 700 的视口下，画布应完整等比缩小，不应横向溢出或裁掉底部按钮。
- 在大于 375 × 700 的视口下，画布应按高度或宽度约束等比放大，而不是维持 375 × 700 的固定显示尺寸。
- 当设备宽高比不是 375:700 时，剩余区域应均匀留在画布两侧或上下，画布保持居中且不变形。
- 首次打开必须要求昵称；保存后开始页显示昵称和八位 UID。
- 五轮每个决策卡可点，故事差值、标签揭晓、平静/事件/免疫弹窗可继续。
- 任意待处理弹窗刷新后能恢复，资源和选择日志不重复结算。
- 正常结局依次显示杯测、交易、成绩；活力归零显示绝收卡。
- 成绩进入本地榜单，只保留当前玩家净利润最高的一局。
- 帮助、风土志、标签、排行榜和档案弹窗可正确打开/关闭，键盘焦点可见。

## 注释约定

- 每个 JS/TS 文件顶部说明模块边界；每个业务函数/公开方法前说明用途，复杂函数补充参数、返回值和副作用。
- 数据文件说明其字段结构和消费模块，避免把显示文案误当作可执行规则。
- CSS、SQL、TOML、YAML 和 HTML 按职责区块注释。
- `package.json` 与 `frontend/manifest.json` 遵循标准 JSON，语法本身不允许注释，所以逐文件职责集中记录在本 README。
- 注释解释“为什么”和规则边界；字段名已能表达的赋值不重复逐行翻译。
