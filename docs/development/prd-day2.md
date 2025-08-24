# Silksong 信息中心 Day 2 PRD 最终精炼版（零歧义开发规范）

版本：Day2-Rev4-Corrected  
日期：2025-08-24  
目标读者：前端工程师 / 后端工程师 / 构建脚本工程 / AI Code Agent（Claude Code 等）  
本文件消除所有潜在歧义，所有 MUST / MUST NOT / SHOULD 具备明确执行含义。  
框架假设：Next.js 15（App Router），Node.js 18+，TypeScript 5.x，Supabase数据库。基于现有项目架构修正。

## ⚠️ 架构修正说明
本PRD已根据实际项目架构进行修正：
- 使用App Router而非Pages Router
- 采用Supabase数据库而非纯文件存储
- 调整性能要求至现实可达水平
- 保持现有优秀的技术栈配置

---

## 0. 术语与统一约定

1. 时间与时区：所有服务器端时间统一使用 UTC（ISO8601：YYYY-MM-DDTHH:mm:ssZ）。前端显示倒计时使用客户端本地时间差（不换算显示时区）。
2. 文件编码：UTF-8（无 BOM）。
3. 行结束符：LF（\n）。
4. 字段命名：全局 JSON 使用 camelCase（例：daysRemaining）。
5. 颜色写法：全部 HEX（小写），不使用 rgb()/hsl()。
6. 布尔逻辑：仅用 true/false，不使用 0/1 模拟。
7. 状态字段枚举：
   - differences.status: confirmed | hinted | tba
   - platform.status: confirmed | tba | unannounced
   - unconfirmed.status 固定为 unconfirmed
8. “hinted” 定义：有官方媒体/演示片段或开发者访谈含有功能暗示，但官方未发布明确单独确认句子。
9. “tba” 定义：机制/细节尚未公开或未在任何官方媒体中出现；仅知道该维度存在但内容未明。
10. “unannounced” 用于平台/发行形式：刚性存在可能性但官方未提及。禁止为其附加任何推测语句。
11. “unconfirmed” 仅用于 differences-unconfirmed.json，不得出现在主对比表。
12. 所有外链 source.url MUST 为 https 协议；若暂缺，设置为 null，不留空字符串。
13. 资源路径：站内引用一律以 / 开头绝对路径（不使用相对 ../）。

---

## 1. 环境变量 / 配置

| 名称                 | 示例                     | 说明                                  | 必须 |
| -------------------- | ------------------------ | ------------------------------------- | ---- |
| SILKSONG_RELEASE_ISO | 2025-09-04T00:00:00Z     | 全球统一发行 UTC 时间                 | YES  |
| SITE_ORIGIN          | https://silksong.example | 用于生成绝对 URL                      | YES  |
| ENABLE_SUBSCRIBE     | true                     | 启用/禁用订阅 API（false 时返回 503） | 可选 |
| BUILD_TIME_UTC       | 构建时注入               | 用于版本戳                            | 自动 |

若 SILKSONG_RELEASE_ISO 缺失：构建应失败（退出码 ≠0）。

---

## 2. 目录结构（基于App Router）

```text
/data/
  timeline.json
  differences.json
  differences-unconfirmed.json
  platforms.json
  faqs.json
  build-meta.json           (记录构建时间与哈希，可选)

public/
  og/30plus.png
  og/lt30.png
  og/lt7.png
  og/released.png
  og/current.png  (构建脚本复制或覆盖)
  favicon.ico
  robots.txt
  sitemap.xml (可留空后续)

app/                        # Next.js App Router 架构
  layout.tsx               # 根布局
  page.tsx                 # 首页
  compare-hollow-knight/
    page.tsx
  platforms/
    page.tsx
  tools/
    embed/
      page.tsx
  embed/
    countdown/
      page.tsx             # 纯静态HTML输出
  api/
    status/
      route.ts
    subscribe/
      route.ts             # 使用Supabase存储
    feed.xml/
      route.ts             # 返回XML
    og/
      route.ts             # 可延后

lib/                       # 保持现有完整配置
  supabase/               # Supabase客户端配置
  loadData.ts
  time.ts
  hash.ts
  rss.ts
  validators.ts
  buildOgSelection.ts
components/                # 保持现有组件结构
  ui/                     # shadcn/ui组件
hooks/                     # 自定义hooks
types/                     # TypeScript类型定义
scripts/
  select-og-current.mjs
```

MUST NOT 随意更改目录名称；新增文件需更新 PRD 附录。

---

## 3. 数据文件结构（零歧义）

### 3.1 differences.json（数组）

字段：

- dimension: string（唯一；作为 <tr> key）
- hk: string（允许含标点；禁止 HTML 标签）
- ss: string（同上）
- status: 'confirmed' | 'hinted' | 'tba'
- source: { label: string; url: string } | null
  - 若 status = confirmed 或 hinted：source MUST
    NOT 为 null（若暂无可靠引用则该行不得标记为 confirmed/hinted）
  - 若 status = tba：source MUST 为 null

验证规则（伪）：

```ts
assert(new Set(list.map(l=>l.dimension)).size === list.length)
assert(['confirmed','hinted','tba'].includes(item.status))
if(item.status !== 'tba') assert(item.source && httpsURL(item.source.url))
else assert(item.source === null)
```

### 3.2 differences-unconfirmed.json

字段：expectation, rationale, status 固定 'unconfirmed', note?  
限制：不得包含 “confirmed / official / guaranteed”等词根。

### 3.3 platforms.json

字段：platform, status('confirmed'|'tba'|'unannounced'), notes?, source?  
规则：

- status=confirmed → source MUST 为 https URL
- status≠confirmed → source 可为 null
- platform 名称统一大小写格式化（例 “PC (Steam)” “Game Pass (Day One)”）。

### 3.4 faqs.json

字段：q, a  
限制：

- 不得含 HTML（使用纯文本）
- 若答案包含日期，格式：September 4, 2025（英文 Month Day, Year）

### 3.5 timeline.json（假设已存在）

要求附加字段：

- id: string（唯一）
- date: ISO8601（UTC）
- title: string
- summary: string（供 RSS description）

禁止包含 HTML 标签（RSS 中统一 CDATA 包裹）。

---

## 4. 页面详解与实现约束

### 4.1 /compare-hollow-knight

UI 结构（顺序固定）：

1. <h1> 主标题
2. Methodology 段落（静态文案；禁止引用未确认）
3. “Last Updated: YYYY-MM-DD
   UTC” 小字（来源：取 differences.json 与 differences-unconfirmed.json 读文件 mtime 的最大值或构建时间）
4. 差异表（table > thead/tbody）列顺序：Dimension | Hollow Knight | Silksong | Status | Source
5. Content Scale 段：硬编码或来自 differences.json 特殊条目（推荐静态文案）
6. Unconfirmed Expectations 列表（ul > li）
7. CTA 链接区（/platforms /tools/embed /timeline）

可访问性：

- table 必须使用 <caption>（内容：“Confirmed & hinted differences matrix”）
- Status 使用 <span role="status" aria-label="confirmed">
- 颜色：
  - confirmed: #16a34a
  - hinted: #f59e0b
  - tba: #6b7280
  - unconfirmed 标签（仅侧区显示）：#9ca3af
  - 颜色显示同时 MUST 提供文本（不要只靠颜色）

移动端：

- 表格外包 div.wrapper { overflow-x:auto; }
- 不折行强制：可让单元格自然换行；不使用 white-space: nowrap 造成压缩。

Source 列：

- 如果 source = null → 输出 — （em dash 或 &mdash;）
- 所有外链 <a target="_blank" rel="noopener noreferrer">

禁止：

- 不使用 dangerouslySetInnerHTML
- 不内联 JS 修改表格结构

验收再补充：

- 表格行数（differences.json）≥15
- 第一次渲染不出现 CLS（避免懒加载高度跳跃）

### 4.2 /platforms

结构：

1. H1
2. Summary 段（自动：统计 confirmed 平台个数 + 列表 join）
3. 平台表：Platform | Status | Notes | Source
4. FAQ 折叠：每项使用 <button aria-expanded="false"> + 下方 <div hidden>
5. CTA 底部（对比 / 倒计时 / 清单）

FAQ 折叠规范：

- 点击 button → toggled → aria-expanded=true / false
- 切换：div.hidden = !expanded

Schema：

- FAQ JSON-LD：聚合 faqs.json 全部条目
- JSON-LD 注入 <script type="application/ld+json">（字符串化 JSON，不包含注释）

### 4.3 /tools/embed

内容模块：

1. H1
2. 功能简介（说明：UTC 基准；不收集用户数据；可自定义参数）
3. 预览区（iframe src 指向 /embed/countdown?theme=dark）
4. 参数说明表（参数/类型/可选值/默认/描述）
5. 代码复制组件：
   - <textarea readonly> 包含 embed 代码
   - 复制按钮（点击 → navigator.clipboard.writeText）
   - 成功提示（2 秒）

参数表（权威单一来源）：

| 参数      | 类型                            | 允许值             | 默认       | 必填 | 描述                                          |
| --------- | ------------------------------- | ------------------ | ---------- | ---- | --------------------------------------------- |
| theme     | string                          | light,dark         | light      | 否   | 颜色主题                                      |
| lang      | string                          | en,zh              | en         | 否   | 文案语言                                      |
| showTitle | boolean (string 'true'/'false') | true,false         | true       | 否   | 是否显示标题                                  |
| layout    | string                          | horizontal,compact | horizontal | 否   | 今日先忽略 compact（仍接受但渲染 horizontal） |
| border    | boolean                         | true,false         | false      | 否   | 是否显示 1px 边框                             |

默认 embed 代码模板（不可改顺序）：

```html
<iframe
  src="https://SITE_ORIGIN/embed/countdown?theme=dark&lang=en"
  width="320"
  height="140"
  frameborder="0"
  loading="lazy"
  referrerpolicy="no-referrer"
  title="Silksong Release Countdown"
></iframe>
```

### 4.4 /embed/countdown

实现要求：

- 单独 HTML，不依赖 React（减小体积）。
- 全部样式内联 <style>，不加载外部字体。
- 禁止引入第三方脚本。
- JS 总体积（未压缩）≤ 8KB。
- 页面 <meta name="robots" content="noindex">。

逻辑：

1. 解析 URLSearchParams。
2. 校验参数（无效值使用默认，不报错）。
3. releaseDate 从构建注入或使用内联常量（与后台保持一致）。
4. 每 1 秒更新一次文本 (setTimeout)；不能使用 requestAnimationFrame + setTimeout 嵌套增加复杂度。
5. diff <= 0 → 替换为 Released!/已发布（不再继续循环）。

倒计时格式：

- pattern: {d}d {h}h {m}m {s}s
- 数字不补零（例：3h，不是 03h）。
- d 可为 0（继续显示）。

### 4.5 /api/status

Method: GET only  
拒绝其它方法：返回 405 + Allow: GET

响应头：

- Content-Type: application/json; charset=utf-8
- Cache-Control: public, max-age=300
- ETag: 由 hash 生成（W/ 可选，统一不加 W/ 简化）
- Access-Control-Allow-Origin: \* （允许第三方引用）

字段定义（不可更名）：| 字段 | 类型 | 说明 | |------|------|------| | releaseDate | string
| 取自 env | | serverTime | string | new Date().toISOString() | | isReleased | boolean |
serverTime >= releaseDate | | daysRemaining | number | Math.max(0, floor(diffMs / 86400000)) | |
hoursRemaining | number | Math.max(0, floor(diffMs / 3600000)) | | totalSecondsRemaining | number |
Math.max(0, floor(diffMs / 1000)) | | lastTimelineUpdate | string | timeline.json 中最大 date | |
timelineItems | number | timeline.json length | | version | string |
BUILD_TIME_UTC（到分钟：YYYY-MM-DDTHH:mmZ） | | hash | string | sha256- 前缀 + Base64( releaseDate +
lastTimelineUpdate + timelineItems ) 前 24 字符（截断） |

304 处理：

- 若请求头 If-None-Match === 当前 hash → 返回 304（无 Body）。

错误情况：

- 若 timeline.json 缺失或解析失败 → 500 + {"error":"timeline_load_failed"}

### 4.6 /feed.xml (或 /api/feed)

方式一（推荐）：pages/feed.xml.ts 直接输出 XML（SSR）。  
HTTP 头：

- Content-Type: application/rss+xml; charset=utf-8
- Cache-Control: public, max-age=900

RSS 要求：

- <rss version="2.0">
- <channel> 内至少包含：title, link, description, lastBuildDate, language(en), ttl(30)
- Items 按 date 降序，最多 30 条。
- 每 item：
  - title
  - link= SITE_ORIGIN + /timeline# + id
  - guid isPermaLink="false"
  - pubDate (UTC RFC1123)
  - description 使用 <![CDATA[summary]]>

数据清洗：

- 转义 & < > 等（除 summary 用 CDATA）。

### 4.7 邮件订阅 /api/subscribe

**⚠️ 修正：使用现有Supabase数据库**

Method: POST only  
请求头 Content-Type: application/json  
请求体：{ "email": string, "source": string }  
字段限制：

- email 正则：/^[^\s@]+@[^\s@]+\.[^\s@]+$/
- source：允许空字符串；若存在必须以 / 开头（站内路径）或 http(s):// 外部来源。否则 400。

返回：

- 成功首次：200 {"ok":true,"message":"Subscribed"}
- 重复：200 {"ok":true,"message":"Already subscribed"}
- 邮件非法：400 {"ok":false,"message":"Invalid email"}
- 禁用（ENABLE_SUBSCRIBE=false）：503 {"ok":false,"message":"Subscription disabled"}

存储：

- 使用现有Supabase `email_subscriptions` 表
- 字段：id, email, source, created_at, ip_hash
- 使用现有的类型安全hooks: `useSupabaseInsert`
- 自动处理重复检查、事务性、备份等
- IP哈希处理与安全性由Supabase RLS策略保障

Rate Limit：

- 数据库级别检查：同一email 60秒内重复提交返回 "Already subscribed"
- 利用现有缓存机制，避免频繁数据库查询

### 4.8 OG 图选择脚本（构建阶段）

脚本：scripts/select-og-current.mjs  
伪逻辑：

```js
import { copyFileSync } from 'fs';
const release = new Date(process.env.SILKSONG_RELEASE_ISO).getTime();
const now = Date.now();
const diff = release - now;
let src = '30plus.png';
if (diff <= 0) src = 'released.png';
else {
  const days = Math.floor(diff / 86400000);
  if (days < 7) src = 'lt7.png';
  else if (days < 30) src = 'lt30.png';
}
copyFileSync(`public/og/${src}`, 'public/og/current.png');
```

失败策略：

- 若任一源文件缺失 → 脚本抛错 → 终止构建。

### 4.9 Schema（Homepage 与 Platforms）

Homepage JSON-LD 注入：

1. VideoObject（如无视频 ID 暂不注入该块；不得留空字段）
2. 可选 FAQ 1 条（Release Date）  
   多个脚本分开 <script> 注入，避免合并错误。

Platforms 页：

- FAQPage 聚合所有 faqs.json 条目
- 确保 JSON 合法（不含注释、结尾无逗号）

验证：使用结构化数据测试工具；结果无 error（warning 可忽略）。

### 4.10 内部链接

固定新增链接点位（必须出现）：

- index: “Compare Differences” → /compare-hollow-knight
- index: “Platforms & Game Pass” → /platforms
- compare-hollow-knight 页面底部：/platforms /tools/embed
- platforms 页面底部：/tools/embed /compare-hollow-knight
- timeline 页面底部：/tools/embed /compare-hollow-knight

所有链接 <a> 文案需具语义（禁止 “点击这里”）。

### 4.11 性能约束（修正版）

**⚠️ 性能要求已调整至现实可达水平**

| 指标                       | 原目标         | 修正目标       | 工具                      |
| -------------------------- | -------------- | -------------- | ------------------------- |
| 首页 HTML 首包（不含图片） | ≤ 35KB         | ≤ 50KB         | 本地 build 后查看 network |
| JS 总下载（初次加载）      | ≤ 180KB (gzip) | ≤ 250KB (gzip) | Lighthouse                |
| CLS                        | 0              | ≤ 0.05         | Lighthouse                |
| TTFB (本地)                | ≤ 150ms        | ≤ 150ms        | Chrome DevTools           |

允许但需优化：

- **Web Fonts**：限制使用2个字体族，启用font-display:swap，字体子集化
- **组件库**：保持现有shadcn/ui，但按需导入组件
- **动画库**：考虑用CSS动画替代部分Framer Motion使用

禁止：

- 不引入重量级框架额外副本（已用 React/Next）
- 图片（OG）不在首页内嵌展示（仅 meta）
- 避免不必要的第三方脚本

---

## 5. 可复用组件规范

### 5.1 状态 Badge 组件

Props：status: 'confirmed' | 'hinted' | 'tba'  
输出：

```html
<span class="badge badge--confirmed" aria-label="confirmed">confirmed</span>
```

CSS（示例）：

```css
.badge {
  display: inline-block;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1.2;
  font-weight: 500;
  color: #fff;
}
.badge--confirmed {
  background: #16a34a;
}
.badge--hinted {
  background: #f59e0b;
}
.badge--tba {
  background: #6b7280;
}
```

禁止动态内联 style（方便后续主题改造）。

---

## 6. 验证与测试用例（必须完整覆盖）

### 6.1 differences 数据测试

| 用例                     | 操作       | 期望              |
| ------------------------ | ---------- | ----------------- |
| 重复 dimension           | 添加重复键 | 构建脚本/单测抛错 |
| confirmed 但 source=null | 修改一条   | 构建失败          |
| tba 但 source 存在       | 修改一条   | 构建失败          |
| 超过 15 条               | 保持       | 通过              |

### 6.2 /api/status

| 用例               | 输入                       | 期望                             |
| ------------------ | -------------------------- | -------------------------------- |
| 正常请求           | GET                        | 200 JSON 含 isReleased           |
| If-None-Match 匹配 | Header ETag                | 304 无 Body                      |
| Release 已过       | 模拟 system time > release | isReleased=true; daysRemaining=0 |
| timeline 缺失      | 临时重命名文件             | 500 error 字段                   |

### 6.3 /api/subscribe

| 用例     | Body                   | 期望响应                  |
| -------- | ---------------------- | ------------------------- |
| 首次有效 | {"email":"a@b.com"}    | 200 Subscribed            |
| 重复提交 | 同上                   | 200 Already subscribed    |
| 非法邮箱 | {"email":"abc"}        | 400 Invalid email         |
| 速率限制 | 60s 内重复             | 200 Already subscribed    |
| 禁用     | ENABLE_SUBSCRIBE=false | 503 Subscription disabled |

### 6.4 /embed/countdown

| 用例            | URL                 | 期望                  |
| --------------- | ------------------- | --------------------- |
| 默认参数        | /embed/countdown    | theme=light, lang=en  |
| 无效 theme      | theme=purple        | 回落 light            |
| showTitle=false | showTitle=false     | 不渲染标题节点        |
| 倒计时结束      | 模拟 release 在过去 | 显示 Released!/已发布 |

### 6.5 RSS

| 用例      | 操作               | 期望                             |
| --------- | ------------------ | -------------------------------- |
| 校验      | 打开 /feed.xml     | 浏览器显示 XML，含 channel/title |
| Item 降序 | 修改 timeline 顺序 | 输出仍按日期排序                 |
| 长度截断  | timeline>30        | 仅取前 30 条                     |

### 6.6 OG 图脚本

| 用例 | daysRemaining=45 | 使用 30plus.png | | daysRemaining=15 | lt30.png | | daysRemaining=4 |
lt7.png | | daysRemaining=0 | released.png | | 源文件缺失 | 删除 lt30.png | 构建失败 |

---

## 7. 安全与合规

| 项目            | 要求                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------- |
| X-Frame-Options | 不在主域设置 deny，以支持外站 iframe（可不设置或设置 SAMEORIGIN；确保 /embed/countdown 不被阻断） |
| CSP（可后续）   | 暂不强制；若添加，可允许 self 'unsafe-inline'（倒计时内联脚本存在）                               |
| 不收集 PII      | 除 email（订阅）外不存储任何用户数据                                                              |
| Email 存储      | 不加密（阶段性），不公开；后期迁移 DB                                                             |
| 依赖            | 不新增额外后端依赖库（除 crypto 内置）                                                            |

---

## 8. 构建与部署步骤（标准化）

1. 校验环境变量（Node 脚本 verify-env.mjs）。
2. Lint & Type Check（eslint --max-warnings=0；tsc --noEmit）。
3. 运行数据验证脚本（validate-data.mjs）：
   - differences / platforms / faqs / timeline 按上述规则。
4. 执行 OG 图选择脚本（select-og-current.mjs）。
5. Next.js build。
6. 部署（Vercel / Node 容器任一），确保 public/og/current.png 带入产物。
7. 手工验证 /api/status /feed.xml /embed/countdown。

构建失败条件：任意脚本抛错。

---

## 9. 代码风格规范

| 项            | 规范                                                        |
| ------------- | ----------------------------------------------------------- |
| 语法          | TypeScript，禁止 any                                        |
| 引号          | 单引号                                                      |
| 分号          | 必须                                                        |
| Imports 顺序  | Node 内置 → 第三方 → 相对路径                               |
| CSS           | 可使用 module.css 或全局 minimal 样式；禁止引入大型 UI 框架 |
| 控制台日志    | 仅保留错误日志 console.error（生产）                        |
| Magic Numbers | 提取常量（如 86400000）                                     |

---

## 10. 性能优化细节（必做）

- differences / platforms 等数据采用静态 import（让 Next tree-shake）：
  `import differences from '../data/differences.json';`
- 不在首页同步加载对比全表（首页只需简短统计预览）。
- /embed/countdown 页面不加载任何其他域请求（0 外部请求）。
- 减少 re-render：对差异表全部为静态构建（不使用 useEffect）。

---

## 11. 失败回退策略

| 场景                    | 触发          | 回退                                   |
| ----------------------- | ------------- | -------------------------------------- |
| OG 图未生成 current.png | 构建脚本异常  | 使用 30plus.png 手动复制为 current.png |
| /api/status 500         | timeline 损坏 | 暂时手动恢复上一版本 timeline.json     |
| /feed.xml 解析失败      | 验证工具报错  | 回滚上一构建产物中 feed.xml            |
| /api/subscribe 错误频发 | CSV 写权限    | 临时返回 503 Subscription disabled     |

---

## 12. 验收主清单（一次性复核）

功能：

- [ ] /compare-hollow-knight 表格行 ≥15 行
- [ ] /compare-hollow-knight Unconfirmed 区独立且无 confirmed/hinted/tba 标签
- [ ] /platforms 平台 ≥10 行（含 Game Pass confirmed）
- [ ] /tools/embed 含参数表 + 复制按钮工作
- [ ] /embed/countdown 参数回退规则生效
- [ ] /api/status 含 isReleased
- [ ] /api/status 支持 If-None-Match→304
- [ ] /feed.xml 可解析（≥1 item）
- [ ] /api/subscribe 正常写 CSV
- [ ] OG current.png 与 daysRemaining 档位逻辑对应
- [ ] 内部链接 5 处全部可访问

内容：

- [ ] differences 中无 source=null 且 status≠tba
- [ ] 平台未对 unannounced 项添加推测性语句
- [ ] FAQ Game Pass 回答为肯定
- [ ] 文案未出现 “可能” 等模糊措辞于 confirmed 维度

SEO / Schema：

- [ ] Title 长度 < 60
- [ ] Meta 描述 < 160
- [ ] VideoObject / FAQ schema 验证 pass
- [ ] /embed/countdown noindex

性能：

- [ ] 首页首包 HTML ≤35KB
- [ ] 总 JS ≤180KB gzip
- [ ] CLS=0
- [ ] 首次加载无 console error

安全：

- [ ] /api/subscribe 不回显邮箱原文（日志）
- [ ] 所有外链 rel="noopener noreferrer"

---

## 13. 开发任务拆解（基于现有架构修正）

**⚠️ 任务时间重新评估，基于现有完善基础架构**

| 序号 | 任务                                  | 预计用时 | 架构优势              |
| ---- | ------------------------------------- | -------- | --------------------- |
| 1    | 数据文件完善 & 校验脚本               | 0.3h     | 现有基础完善          |
| 2    | /compare-hollow-knight 页面实现       | 0.6h     | 复用现有组件          |
| 3    | /platforms + FAQ 折叠 + Schema        | 0.5h     | shadcn/ui组件现成     |
| 4    | /api/status Route Handler             | 0.3h     | App Router API简化    |
| 5    | RSS feed.xml Route Handler            | 0.4h     | 现有RSS库配置         |
| 6    | OG 构建脚本 & 占位图放置              | 0.3h     | Next.js集成优化       |
| 7    | /embed/countdown App Router页面       | 0.5h     | App Router SSG优化    |
| 8    | /tools/embed 指南页                   | 0.4h     | 现有UI组件复用        |
| 9    | /api/subscribe Supabase集成           | 0.4h     | 现有hooks和表结构     |
| 10   | 内部链接 + SEO Meta                   | 0.2h     | 现有metadata配置      |
| 11   | 性能优化与字体配置                    | 0.4h     | 修正的性能目标        |
| 12   | 验收与修复                            | 0.7h     | 减少架构风险          |

**总计预估：4.0h**（相比原6.4h减少37%，得益于现有架构的完善度）

---

## 14. 限制（MUST NOT）

**⚠️ 已修正基于现有架构**

- ~~MUST NOT 引入数据库（MySQL/SQLite）今日范围~~ **已修正：保持现有Supabase数据库**
- MUST NOT 使用服务器端 session。
- MUST NOT 在 differences 中引用未经核实社区内容。
- MUST NOT 向外发送统计或第三方分析（GA、Pixel）。
- MUST NOT 使用 setInterval（倒计时）→ 采用递归 setTimeout 可控释放。
- MUST NOT 在 API 响应中包含 Stack Trace。
- MUST NOT 放弃现有的优秀技术栈配置（Supabase、shadcn/ui、类型安全等）
- MUST NOT 降级到CSV等落后存储方案

---

## 15. 后续扩展 Hook（实现时预留）

| Hook              | 预留方式                                                       |
| ----------------- | -------------------------------------------------------------- |
| 多语言扩展        | 数据结构不写死英文（未来 differences 字段可变为对象 {en, zh}） |
| OG 动态 Satori    | 保留 /api/og 路径占位文件（导出 501）                          |
| timeline 扩展 API | 预留 /api/timeline.ts 空壳（返回 501）                         |
| 邮件服务切换      | /api/subscribe 保留 TODO 注释：替换为队列                      |

---

## 16. 交付 Definition of Done（最终判定）

满足以下全部：

1. 验收主清单所有勾选项完成。
2. 所有 lint/type/test 脚本 0 错误。
3. 构建日志无红色 ERROR。
4. 手动访问 7 条核心路径（/ /compare-hollow-knight /platforms /tools/embed /embed/countdown
   /api/status /feed.xml）均 200（feed.xml 为 XML）。
5. 数据文件通过校验脚本（退出码 0）。
6. 任意工程成员或 AI
   Agent 按本 PRD 可独立实现同等功能，无需额外口头说明（人工抽查 Q&A 不出现“不确定”回答）。

---

## 17. 附录：示例校验脚本核心伪代码

```ts
import fs from 'fs';

function https(u:string){ try{ const x=new URL(u); return x.protocol==='https:';}catch{return false;} }

const diff = JSON.parse(fs.readFileSync('data/differences.json','utf-8'));
const dims = new Set();
for (const r of diff){
  if(dims.has(r.dimension)) throw new Error('duplicate dimension '+r.dimension);
  dims.add(r.dimension);
  if(!['confirmed','hinted','tba'].includes(r.status)) throw new Error('bad status');
  if(r.status==='tba' && r.source!==null) throw new Error('tba must null source');
  if(r.status!=='tba' && (!r.source || !https(r.source.url))) throw new Error('need https source');
}
```
