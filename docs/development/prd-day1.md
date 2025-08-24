# Silksong Release Tracker - 今日 PRD (T0)

**目标**：在 8 小时内将现有 Silksong 站点从"传闻追踪"升级为"官方发布倒计时 + 玩家准备中心"

---

## 1. 今日核心功能清单

### 1.1 Hero 区域重构 ⭐ (优先级：P0)
**当前状态**：传闻/猜测导向  
**目标状态**：官方确认 + 倒计时导向

**具体改动**：
- 标题改为：`Hollow Knight: Silksong releases September 4, 2025`
- 副标题：`Official countdown, platform details, and pre-launch prep`
- 添加实时倒计时组件（天/时/分/秒）
- CTA 按钮：`Get Release Reminder` (邮件订阅)

**验收标准**：
- [ ] 倒计时显示正确（基于 2025-09-04 00:00 UTC）
- [ ] 移动端倒计时不换行
- [ ] 倒计时每秒更新
- [ ] CTA 按钮跳转到订阅表单

---

### 1.2 Timeline 页面新建 ⭐ (优先级：P0)
**路径**：`/timeline`  
**功能**：结构化展示官方声明与重要事件

**数据结构**：创建 `timeline.json`
```json
[
  {
    "id": "release-date-announced",
    "date": "2025-08-21T15:00:00Z",
    "type": "official",
    "title": "Release date officially announced",
    "source": {
      "name": "Team Cherry",
      "url": "官方链接"
    },
    "summary": "Team Cherry confirmed Silksong will launch on September 4, 2025 across all platforms.",
    "tags": ["release-date", "platforms"]
  }
]
```

**页面元素**：
- 时间轴设计（垂直，最新在顶部）
- 类型标签（Official / Media / Community）
- 来源链接
- 过滤器（可选：今日不强求）

**验收标准**：
- [ ] JSON 驱动渲染
- [ ] 响应式时间轴
- [ ] 外链在新窗口打开
- [ ] 至少包含发布日期公告条目

---

### 1.3 Pre-Launch Checklist 页面 ⭐ (优先级：P0)
**路径**：`/checklist`  
**功能**：玩家发布前准备清单

**数据结构**：创建 `checklist.json`
```json
[
  {
    "id": "wishlist-steam",
    "category": "Account Setup",
    "text": "Add Silksong to Steam wishlist",
    "link": "https://store.steampowered.com/app/1030300/",
    "priority": "high"
  },
  {
    "id": "replay-hk",
    "category": "Lore Prep",
    "text": "Replay Hollow Knight ending for story context",
    "link": null,
    "priority": "medium"
  }
]
```

**页面功能**：
- 分类展示（Account / Lore / Hardware / Community）
- 可勾选完成（localStorage 存储）
- 进度条显示
- 可打印版本链接

**验收标准**：
- [ ] 勾选状态持久化
- [ ] 进度百分比计算正确
- [ ] 分类折叠/展开
- [ ] 至少 8 个有用的清单项

---

### 1.4 VideoGame Schema 添加 (优先级：P1)
**位置**：主页 `<head>` 内  
**目标**：结构化数据优化

**Schema 内容**：
```json
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Hollow Knight: Silksong",
  "alternateName": "Silksong",
  "datePublished": "2025-09-04",
  "gamePlatform": ["PC", "Nintendo Switch", "PlayStation 5", "Xbox Series X/S"],
  "genre": ["Metroidvania", "Action", "Adventure"],
  "publisher": "Team Cherry",
  "developer": "Team Cherry"
}
```

**验收标准**：
- [ ] 通过 Google Rich Results Test
- [ ] JSON-LD 格式正确
- [ ] 不包含未确认信息

---

### 1.5 导航结构更新 (优先级：P1)
**当前**：单页面  
**目标**：多页面导航

**导航项**：
- Home
- Timeline  
- Checklist
- Platforms (占位)
- FAQ

**技术要求**：
- 当前页面高亮
- 移动端汉堡菜单
- 面包屑导航

**验收标准**：
- [ ] 所有页面导航一致
- [ ] 移动端导航可用
- [ ] 当前页面状态明确

---

## 2. 内容填充标准

### 2.1 Timeline 初始内容 (至少 3 条)
1. **发布日期公告** (2025-08-21)
2. **平台确认** (引用官方 Steam/Nintendo 页面)
3. **开发进度更新** (最近一次官方声明)

### 2.2 Checklist 初始内容 (至少 8 项)
**Account Setup**:
- Steam wishlist
- Nintendo eShop follow
- Xbox Game Pass 准备

**Lore Preparation**:
- Hollow Knight 结局回顾
- Hornet 角色背景复习

**Technical Prep**:
- 控制器设置检查
- 存储空间预留

**Community**:
- 加入官方 Discord
- 关注 Team Cherry 社交媒体

---

## 3. 技术实现要求

### 3.1 倒计时组件
**技术栈**：原生 JS 或现有框架  
**更新频率**：每秒  
**显示格式**：`XX days, XX hours, XX minutes, XX seconds`  
**容错**：发布后显示 "Released!" 状态

### 3.2 数据管理
**文件位置**：`/data/` 目录  
**格式**：JSON  
**更新方式**：手动编辑 + git commit  
**缓存**：静态生成时嵌入

### 3.3 响应式要求
**断点**：
- 移动端：< 768px
- 平板：768px - 1024px  
- 桌面：> 1024px

**关键适配**：
- 倒计时在小屏不换行
- Timeline 在移动端垂直紧凑
- Checklist 分类在小屏可折叠

---

## 4. SEO 优化 (今日必做)

### 4.1 页面标题模板
- 首页：`Silksong Release Date: September 4, 2025 | Official Countdown`
- Timeline：`Silksong Release Timeline | Official Updates & News`  
- Checklist：`Silksong Pre-Launch Checklist | Player Preparation Guide`

### 4.2 Meta Description
- 首页：`Hollow Knight: Silksong releases September 4, 2025. Live countdown, official timeline, platforms, and pre-launch preparation checklist.`
- 控制在 155 字符内
- 包含主要关键词

### 4.3 内部链接
- 首页链向 Timeline 和 Checklist
- Timeline 引用回首页倒计时
- 所有页面 footer 交叉链接

---

## 5. 今日发布检查清单

### 5.1 功能测试
- [ ] 倒计时显示正确且实时更新
- [ ] Timeline 页面加载无错误
- [ ] Checklist 勾选功能正常
- [ ] 所有外链在新窗口打开
- [ ] 移动端导航可用

### 5.2 内容审核
- [ ] 所有信息基于官方来源
- [ ] 无拼写错误
- [ ] 链接有效
- [ ] 图片 alt 文本完整

### 5.3 技术验证
- [ ] 页面加载速度 < 3秒
- [ ] Schema 通过验证
- [ ] 无 console 错误
- [ ] 所有页面返回 200 状态

---

## 6. 验收标准总结

**完成定义**：
1. 3 个页面正常访问 (/, /timeline, /checklist)
2. 倒计时准确显示且实时更新
3. Timeline 至少 3 条官方内容
4. Checklist 至少 8 项可勾选
5. 移动端基本可用
6. Schema 验证通过
7. 页面加载速度合格

**今日成功指标**：
- 用户能清楚看到发布日期和倒计时
- 能获取有用的准备信息
- 页面专业可信
- SEO 基础优化到位
