# 小程序端轻量动效与加载体验优化方案

## 结论

可以在不改变现有功能和视觉样式的前提下，补一层轻量交互体验。当前小程序端已经具备几个适合承接动效的基础：

- 已引入 `@vant/weapp`，并且多处页面已使用 Vant 组件，后续可复用现有 `van-loading` / `van-skeleton` / `van-transition`，不需要新增依赖。
- 首页、树洞、搜索、我的列表、详情评论区都是相似的信息流结构，可以复用一套列表骨架、底部加载、卡片入场和点击反馈。
- `radial-menu` 已经使用 `wx.createAnimation`，说明项目本身可以接受局部动效；只需要把其他高频交互补齐，不做复杂动画系统。

建议做“基础体验补齐”，不做大规模视觉改版。优先级是：骨架屏 > 分页/提交 loading > 点击反馈 > 内容入场 > 导航感知动画。

## 当前观察

### 已有体验基础

- `package.json` 已依赖 `@vant/weapp`。
- `app.json` 已开启 `lazyCodeLoading: "requiredComponents"`、`darkmode: true`、`style: "v2"`，适合按页面引入少量组件。
- `pages/index/index.json`、`pages/treehole/treehole.json` 已启用下拉刷新，并使用自定义导航。
- `components/radial-menu` 已有展开/收起动画。
- `pages/application/application` 已使用 `Toast.loading` 做认证相关 loading。
- `components/image-uploader` 已有 `uploading` 状态，但当前主要通过全屏 `wx.showLoading` 表达上传中。

### 主要体验缺口

- 首页、树洞、搜索等列表首屏直接用 `wx.showLoading` 遮罩，用户看不到页面结构。
- 上拉加载更多也使用全屏 loading，滚动阅读时会被打断。
- 切换一级/二级分类时会清空列表再请求，缺少轻量占位和过渡。
- 详情页帖子内容和评论区分开请求，但没有独立的详情骨架、评论骨架或评论分页 loading。
- 大部分列表卡片、按钮、点赞、菜单项只有状态切换，没有按压反馈或短过渡。
- 原生小程序页面跳转不适合强行自定义复杂转场，应保留原生跳转，只补入口按压态和目标页首屏淡入。

## 设计原则

- 不新增业务功能，不改变接口参数、路由、权限、表单校验和数据结构。
- 不改变现有布局、颜色、字号、圆角、间距，只增加透明度、位移、缩放、骨架占位和 loading 状态。
- 不引入新依赖，优先用 WXSS + 当前 Vant Weapp。
- 动画时长控制在 `120ms - 220ms`；骨架呼吸控制在 `1.2s` 左右；避免长动画和循环装饰动画。
- 只动画 `opacity`、`transform`、`background-color`、`border-color`，避免对列表高度、宽度做频繁动画。
- 骨架只在首屏无缓存、分类切换、详情/评论初次加载时展示；已有缓存时直接展示缓存内容。
- 上拉加载更多使用页面底部 loading，不再弹全屏遮罩。

## 严格安全边界

为避免影响当前页面样式和功能，后续真正实施时必须遵守以下边界：

- 不修改现有元素的 `width`、`height`、`margin`、`padding`、`position`、`display`、`flex`、`float` 等布局属性，除非该属性只作用在新增的骨架或 loading 容器上。
- 不对全局标签选择器加动画，例如不写 `view {}`、`image {}`、`button {}` 级别的过渡或动画。
- 不使用 `transition: all`，只允许显式声明 `opacity`、`transform`、`background-color`、`border-color`。
- 列表卡片只允许做 `transform: translateY(...)` 和 `opacity` 入场，不改变卡片原始尺寸。
- 按压反馈只允许使用很小的 `scale(0.98)` 或透明度变化，不改变实际布局占位。
- 骨架屏必须复刻现有卡片外层尺寸，不能挤压导航、分类栏、底部输入框或固定悬浮按钮。
- 固定定位区域，例如详情页底部评论输入框、悬浮发布菜单、自定义导航栏，只能加透明度/位移过渡，不能改变 `bottom`、`top`、`z-index`、高度和宽度。
- 路由跳转保持现有 `wx.navigateTo`、`wx.switchTab`、`wx.navigateBack`，不加延迟跳转，不改页面栈逻辑。
- 每个页面单独接入、单独真机预览；发现任一页面错位，优先回滚该页面动效，不影响其他页面。
- 首批只建议落首页、树洞、详情页三处高频路径，验收稳定后再推广到搜索和个人列表。

## 推荐改动范围

### 1. 全局轻量 UX 工具类

建议在 `miniprogram/app.wxss` 增加少量通用类：

- `ux-fade-in`：页面首屏淡入。
- `ux-fade-up`：列表卡片轻微上移入场。
- `ux-pressable`：按钮、卡片、菜单项按压反馈。
- `ux-skeleton` / `ux-skeleton-line` / `ux-skeleton-avatar` / `ux-skeleton-thumb`：通用骨架。
- `ux-bottom-loading`：列表底部加载更多区域。
- `ux-safe-transition`：只声明必要属性的短过渡。

注意不要对全局 `view`、`button`、`image` 写 `transition: all`，避免影响性能和意外改样式。

### 2. 首页 `pages/index`

涉及文件：

- `miniprogram/pages/index/index.js`
- `miniprogram/pages/index/index.wxml`
- `miniprogram/pages/index/index.wxss`

建议新增状态：

- `initialLoading`：首次进入且无缓存时展示列表骨架。
- `listLoading`：分类切换或刷新时展示骨架。
- `loadingMore`：触底分页加载时展示底部 loading。
- `pageReady`：首屏数据落地后用于淡入。

建议调整点：

- 首屏不再只依赖 `wx.showLoading`，改为列表区域展示 3 个与 `.task-list-item` 尺寸一致的骨架卡片。
- `onReachBottom` 不再弹全屏 loading，改为底部 `<view class="ux-bottom-loading">`。
- `topNavChange`、`bottomNavChange` 清空 `tasks` 后展示骨架，数据回来后恢复列表。
- `.task-list-item` 增加 `hover-class` 或 `ux-pressable`，点击进入详情时有轻微按压反馈。
- `.menu-desc`、`.menu-desc-small` 的颜色和下划线增加短过渡。
- `.topnav` / `.scrollColor` 的吸顶状态增加 `background-color`、`opacity` 过渡。

不建议首期做：

- 不把整个列表改成 `swiper` 左右滑分类。当前分类切换和 cursor 分页绑定较紧，直接改成页面级 swiper 风险较高。

### 3. 树洞 `pages/treehole`

涉及文件：

- `miniprogram/pages/treehole/treehole.js`
- `miniprogram/pages/treehole/treehole.wxml`
- `miniprogram/pages/treehole/treehole.wxss`

建议与首页共用同一套列表体验：

- 首屏和分类切换使用树洞卡片骨架。
- 热榜 `swiper` 保留现有逻辑，只给热榜容器加淡入，不改轮播配置。
- 上拉加载更多改为底部 loading。
- 树洞彩色卡片只加 `opacity + translateY` 入场，不改原有背景色。
- 分类栏 active 态加短过渡。

### 4. 搜索页与我的列表页

涉及文件：

- `miniprogram/pages/search/search.js`
- `miniprogram/pages/search/search.wxml`
- `miniprogram/pages/search/search.wxss`
- `miniprogram/pages/uitem/my_task/my_task.*`
- `miniprogram/pages/uitem/my_like/my_like.*`
- `miniprogram/pages/uitem/myComment/myComment.*`
- `miniprogram/pages/uitem/myReply/myReply.*`

建议做复用型补齐：

- 增加 `initialLoading`、`loadingMore`、`noMore` 状态。
- 首次搜索和个人列表首屏展示 3 个列表骨架。
- 触底加载用底部 loading，不使用全屏遮罩。
- 列表项统一加按压反馈和短入场。
- 空结果保留当前逻辑，必要时只补一个简单空态文案，不增加新功能。

优先级低于首页、树洞和详情页，可以第二批做。

### 5. 详情页 `pages/detail`

涉及文件：

- `miniprogram/pages/detail/detail.js`
- `miniprogram/pages/detail/detail.wxml`
- `miniprogram/pages/detail/detail.wxss`

建议新增状态：

- `detailLoading`：帖子详情未返回时展示详情骨架。
- `commentLoading`：评论区首次加载或排序切换时展示评论骨架。
- `commentLoadingMore`：评论触底分页 loading。
- `submittingComment`：评论发送中，避免重复提交。
- `pageReady`：详情首屏淡入。

建议调整点：

- 帖子内容区先渲染详情骨架，数据回来后淡入真实内容。
- 评论区按 `list.length` 和 `commentLoading` 展示评论骨架，不影响底部评论输入框。
- 评论排序切换时只让评论区显示骨架，不重置帖子主体。
- 点赞按钮 `.like` 增加按压缩放；点赞图标状态切换增加短过渡。
- 评论点赞图标 `.click-img` 增加按压反馈。
- 评论发送保留现有阻塞逻辑，但增加 `submittingComment`，发送中禁用提交按钮或显示极简“发送中”。
- 底部输入区 `.release` 在页面进入和键盘状态变化时只做轻微透明度/位移过渡，不改固定定位和尺寸。

### 6. 发布页 `pages/addPost`

涉及文件：

- `miniprogram/pages/addPost/addPost.js`
- `miniprogram/pages/addPost/addPost.wxml`
- `miniprogram/pages/addPost/addPost.wxss`

建议调整点：

- 表单首屏加 `ux-fade-in`。
- 提交按钮增加 `submitting` 状态，提交中禁用按钮，防止重复发布。
- 保留 `wx.showLoading` 用于发布提交，因为发布涉及内容审核和接口写入，属于阻塞操作。
- 图片预览格和上传入口加按压反馈与出现动画。
- 表单 section 之间不做逐项延迟动画，避免页面显得繁琐。

### 7. 图片上传组件 `components/image-uploader`

涉及文件：

- `miniprogram/components/image-uploader/index.js`
- `miniprogram/components/image-uploader/index.wxml`
- `miniprogram/components/image-uploader/index.wxss`

建议调整点：

- 复用现有 `uploading` 状态，在组件内部显示局部上传遮罩或小 loading。
- 上传中禁用点击逻辑保持不变。
- 图片预览出现时加短淡入。
- 删除按钮按压反馈。
- 如果保留全屏 `wx.showLoading`，局部遮罩可以暂不做；但更推荐把上传反馈从全屏迁移到组件内部，减少打断感。

### 8. 个人中心与认证页

涉及文件：

- `miniprogram/pages/usercenter/usercenter.*`
- `miniprogram/pages/application/application.*`

建议调整点：

- 个人中心菜单项、列表项加按压反馈。
- 用户头像和昵称区域首屏淡入。
- 认证页已经使用 `Toast.loading`，不需要再新增骨架；只给表单容器和上传入口补短过渡。
- 发送验证码按钮倒计时已有状态，保持原样，只补按压/禁用态过渡。

## 跳转动画策略

小程序原生路由没有稳定的页面级自定义转场能力，尤其 `switchTab` 不适合做自定义动画。建议采用以下低风险方式：

- 保留所有 `wx.navigateTo`、`wx.switchTab`、`wx.navigateBack` 的原有逻辑。
- 给触发跳转的卡片、菜单项、按钮增加 `hover-class` 或 `ux-pressable`。
- 目标页首屏容器加 `ux-fade-in`，数据加载完成后进入。
- 不做手写延迟跳转，不为了动画阻塞路由。

这样用户会感知到“点下去有反馈、页面进来不突兀”，但不会影响页面栈、tab 切换和返回行为。

## 推荐实施顺序

1. 增加全局 `ux-*` 工具类和骨架样式。
2. 首页、树洞接入首屏骨架、分类切换骨架、底部 loading、卡片按压反馈。
3. 详情页接入详情骨架、评论骨架、评论底部 loading、点赞/评论点赞反馈。
4. 搜索页和个人列表页复用列表骨架与底部 loading。
5. 图片上传组件补局部上传反馈。
6. 发布页、个人中心、认证页补按压反馈和首屏淡入。

## 验收标准

- 首屏无缓存时不再只有全屏 loading，能看到页面结构占位。
- 上拉加载更多不再遮挡当前阅读内容。
- 分类切换时页面不会白屏突变。
- 详情页帖子主体和评论区可以分别 loading。
- 点赞、卡片点击、菜单点击有轻微反馈，但不改变原本布局。
- 暗黑模式下骨架和 loading 不刺眼。
- 不新增依赖，不新增复杂动画库。
- 真机滚动列表无明显掉帧。

## 不建议首期加入的内容

- 全站页面级自定义转场。
- 信息流左右滑全量切换分类。
- 每条列表项复杂 stagger 动画。
- 大量 Lottie / GIF / 自定义 canvas loading。
- 长时间循环装饰动画。
- 全局 `transition: all`。

## 预计改动量

轻量方案预计主要是 `WXSS + 少量状态字段 + WXML 条件渲染`：

- 全局样式：约 80 - 140 行。
- 首页/树洞：每页约 30 - 60 行状态和模板调整。
- 详情页：约 60 - 100 行状态和模板调整。
- 搜索/我的列表：每页约 20 - 40 行调整。
- 图片上传组件：约 20 - 40 行调整。

整体不会改变接口和核心业务逻辑，适合作为一轮体验补齐任务拆分提交。
