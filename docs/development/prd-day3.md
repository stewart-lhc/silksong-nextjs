# Silksong 信息中心 Day 3 PRD（Rev2 —— 根据专业开发反馈的零歧义修订版）

版本：Day3-Rev2  
修订日期：2025-08-24  
替代：Day3-Rev1（本版本对反馈中的所有指出点进行了显式澄清与结构调整）  
读者：前端 / 后端 / 构建工程 / AI Code Agent  
技术栈承接 Day2（Next.js 14 + TypeScript 5 + Node.js 18+）

---

## A. 修订摘要（Changelog）

| 编号 | 反馈来源问题                        | Rev2 处理结果（已落实为 MUST / 规则）                                                               |
| ---- | ----------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------- | -------- |
| C1   | i18n / 总量时间评估过于乐观         | 重新估算：Day3 需 3–4 开发人日（单人），新增里程碑与优先顺序说明                                    |
| C2   | 动态 OG 字体“系统字体”不确定        | 明确：打包指定字体（Inter 或替代），路径固定 /public/fonts/；Satori / Canvas 统一加载；缺失构建失败 |
| C3   | /api/log 写文件在 Serverless 易丢失 | 明确：Day3 采用 “Ephemeral Accept 模式” 标注用途=实验；增加 STORAGE_MODE=ephemeral                  | persistent（预留）；持久化推入 Day4+ |
| C4   | Double Opt-in pending.json 写入竞态 | 改为 “每 token 独立文件” 目录结构 /data/pending/<token>.json + 原子 rename；Race 规约化；无需锁     |
| C5   | sitemap URL 数量计算歧义            | 明确：列出完整枚举算法（显式页面集合 × 多语言 + 根默认），给出公式与示例                            |
| C6   | /api/timeline after 时区/格式       | after 参数 MUST 为 RFC3339/ISO8601 且包含 “Z” 或显式偏移；否则 400 invalid_after                    |
| C7   | 全站日期标准                        | 明确：所有输入 / 输出 / 存储时间 MUST 为 UTC；不接受本地模糊时间；无时区即错误                      |
| C8   | OG 字体 fallback 语义               | 定义 OG_FONT_PRIMARY / OG_FONT_FALLBACK；未配置 fallback 使用 system-ui,sans-serif                  |
| C9   | i18n 缺失 key 检测机制              | 新增校验脚本描述：以 en.json 为基准，缺失 → 构建失败；多余 key 警告（不失败）                       |
| C10  | /api/log 敏感字段过滤               | 增补：拒绝 payload 中包含 email/ useragent / user_agent / ua（大小写不敏感）                        |
| C11  | Double Opt-in token 策略            | 明确：token 生成 = 32 hex（sha256(email + salt + unixMs) 前 32）；文件名 = token.json               |
| C12  | 扩展环境变量清单                    | 加入：LOG_STORAGE_MODE, OG_FONT_PRIMARY, OG_FONT_FALLBACK, DEPLOY_ENV                               |
| C13  | 任务拆解执行顺序                    | 分阶段：Phase 1（P0 核心）/ Phase 2（P1）/ Phase 3（收尾）                                          |
| C14  | /api/log 结果格式                   | 明确统一响应：成功 204（无 Body）；错误含 {"error": "..."}                                          |
| C15  | 过期 token 行为                     | 新增：访问确认页面过期 token 时 410 Gone（语义化）                                                  |
| C16  | 订阅并发重复点击                    | 规则：同 email 存在 pending → 不生成新 token；返回同提示                                            |
| C17  | OG ETag 构成                        | 补充：哈希基础串 = releaseDate + '                                                                  | ' + daysRemaining + '                | ' + variant + ' | ' + lang |
| C18  | /api/differences updated 字段来源   | 明确：取 differences.json / differences-unconfirmed.json mtime 最大值（UTC）                        |
| C19  | 目录新增                            | /data/pending/ /public/fonts/ /scripts/validate-i18n.mjs                                            |
| C20  | 失败回退                            | 增 OG 字体缺失 → 回退静态 current.png + 构建警告（可设 FAIL_ON_OG_FONT_MISSING 控制失败）           |

---

## 0. 术语与全局新增统一约定（补充）

1. 时间格式：所有 API 输入 / 输出 / 文件字段涉及时间均为 UTC ISO8601（含 Z）。缺少 Z
   / 偏移 → 判为非法。
2. RFC 引用：时间校验参考 RFC3339 子集（严格模式）。
3. “Ephemeral
   Accept 模式”：指功能在无持久化文件系统环境中可能丢数据，已在 PRD 标记且本迭代视为可接受风险。
4. 构建失败策略：凡写明 “MUST 构建失败” 的条件若触发 → 退出码 ≠0。其余为警告。

---

## 1. 环境变量（Rev2 全量）

| 变量                     | 示例                 | 说明                           | 必须                         | 失败策略                               |
| ------------------------ | -------------------- | ------------------------------ | ---------------------------- | -------------------------------------- |
| SUPPORTED_LOCALES        | en,zh                | 逗号列表                       | YES                          | 缺失失败                               |
| DEFAULT_LOCALE           | en                   | 需包含于 SUPPORTED_LOCALES     | YES                          | 缺失/不匹配失败                        |
| SILKSONG_RELEASE_ISO     | 2025-09-04T00:00:00Z | UTC                            | YES                          | 缺失失败                               |
| OG_FONT_PRIMARY          | Inter                | 动态 OG 主字体 PostScript 名称 | YES                          | 缺失失败                               |
| OG_FONT_FALLBACK         | Noto Sans            | 可选                           | NO                           | 缺失→使用 system-ui,sans-serif         |
| EMAIL_SENDER             | noreply@site.com     | 发件人                         | 条件（Double Opt-in 启用时） | 缺失→禁用订阅流程（构建警告）          |
| EMAIL_TRANSPORT          | mock                 | mock/file/smtp/none            | YES                          | none → 订阅仍运行但不发送              |
| SMTP_HOST/PORT/USER/PASS | ...                  | 当 smtp 时必填                 | 条件                         | 任一缺失→构建失败（如 transport=smtp） |
| SITE_HASH_SALT           | 随机串               | token / hash 盐                | YES                          | 缺失失败                               |
| LOG_STORAGE_MODE         | ephemeral            | ephemeral（文件）              | YES                          | 缺失→默认 ephemeral                    |
| ENABLE_LOGGING           | true                 | 控制 /api/log                  | NO                           | 缺失→视为 false                        |
| DEPLOY_ENV               | local                | local / vercel / prod          | NO                           | 决策调试分支（日志前缀）               |
| FAIL_ON_OG_FONT_MISSING  | false                | true/false                     | NO                           | true → 缺字体失败；false → 回退警告    |

OG 字体文件路径约定：

- 主字体文件必须存在：`public/fonts/OGFontPrimary.woff2`（文件名 = OG_FONT_PRIMARY 去空格 + .woff2）
- 若提供 fallback：`public/fonts/OGFontFallback.woff2`
- 校验脚本规则（伪）：

```text
if(!exists(primaryFontPath)) {
  if(FAIL_ON_OG_FONT_MISSING==='true') fail;
  else warn + mark fallback=system;
}
```

---

## 2. 动态 OG (/api/og) 修订细则

1. 首选实现：使用 @vercel/og（Satori）渲染。若运行时抛错 → fallbackRedirect（302）→
   /og/current.png。
2. 字体加载：
   - 读取 public/fonts/ 主字体 Buffer：传入 Satori fonts 数组。
   - 字体 weight：不指定则默认 400。
3. ETag 生成：
   - Base string：`releaseDate|daysRemaining|variant|lang`
   - 摘要：sha256 → 16 hex 前缀。
4. 失败监控：每次 fallback 记录 console.error（生产可降级为 console.warn）。
5. 颜色对比度：强调条（<=7 天）文本颜色固定 #ffffff；背景条 #dc2626。
6. 已发布状态：主数字区域替换为 Released!/已发布！且不显示剩余天数字段。
7. Cache-Control: public, max-age=3600, stale-while-revalidate=300（追加 SWR 便于平台缓存）。

---

## 3. /api/timeline 修订

| 项目       | 值                                                                |
| ---------- | ----------------------------------------------------------------- | -------------------------------- |
| 排序       | 默认按 date 降序（最新在前）                                      |
| after 参数 | 若提供：必须匹配 `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z | [+\-]\d{2}:\d{2})$/`；非法 → 400 |
| 时区处理   | 不做本地猜测；不允许无 Z 的纯日期形式                             |
| limit      | 缺省 20；<1 → 使用 1；>50 → 截断为 50（不报错）                   |
| 响应顺序   | 仍为降序（对 after 过滤后再降序）                                 |

---

## 4. /api/differences 修订补充

1. updated 字段：读取 differences.json 与 differences-unconfirmed.json mtime 最大值 ISO8601。
2. status 过滤解析逻辑：输入字符串用逗号分割→去重→仅保留合法枚举；若结果空 → 返回全部。
3. format=grouped：只包含出现过的组；未出现的组键可省略。
4. Cache-Control：public, max-age=300, stale-while-revalidate=60。

---

## 5. Double Opt-in 存储 & 并发控制（修订）

### 5.1 存储结构

目录：`/data/pending/`  
文件：`<token>.json`  
内容：

```json
{
  "email": "user@example.com",
  "created": "2025-08-24T10:30:12.123Z",
  "token": "abcdef1234...32hex"
}
```

### 5.2 创建流程（原子化）

1. 规范 email → lower case trim。
2. 扫描 pending 目录（单次 readdir）查找是否存在该 email（逐个读取直到匹配或结束，量小可接受）。
3. 若存在且未过期 → 直接返回 “Check your inbox”（不再新建）。
4. 否则生成 token：sha256(email + SITE_HASH_SALT + Date.now()) → 取前 32 hex。
5. 写临时文件：`/data/pending/<token>.json.tmp`（flag = 'wx' 防止同名冲突）→ 成功后 rename 为
   `<token>.json`。

### 5.3 确认流程

1. GET /subscribe/confirm?token=...
2. 查找 `/data/pending/<token>.json`：不存在 → 404（无泄漏邮箱）。
3. 解析 created：若已过期（>48h）→ 删除文件 → 410 Gone（JSON 页面或 SSR 文案）。
4. 写入 subscribers CSV（幂等：如已存在 email 记录可忽略重复）。
5. 删除 token 文件。

### 5.4 安全与限制

| 规则       | 描述                                       |
| ---------- | ------------------------------------------ |
| 过期计算   | created + 172800000 ms                     |
| token 长度 | 固定 32 hex（大小写小写）                  |
| 日志       | 不记录 email 明文（仅调试可 DEBUG=1 控制） |
| 重放防护   | 二次使用 token → 因文件已删除 → 404        |

---

## 6. /api/log（Ephemeral Accept 模式）

| 项         | 规则                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Method     | POST                                                                                                   |
| Body 限制  | ≤ 5120 bytes（raw）                                                                                    |
| 解析       | JSON.parse；失败 → 400 invalid_json                                                                    |
| type 校验  | 必须 perf 或 embed                                                                                     |
| 敏感词拒绝 | 对 payload 序列化的小写字符串中含 substring: 'email','useragent','user_agent','ua' → 400 forbidden_key |
| 存储策略   | LOG_STORAGE_MODE=ephemeral → 追加行至 /data/logs-YYYYMMDD.ndjson                                       |
| 写入格式   | 单行 JSON 不换行，无缩进                                                                               |
| 成功响应   | 204 无 Body                                                                                            |
| 关闭模式   | ENABLE_LOGGING != true → 204（直接忽略）                                                               |
| 持久化规划 | LOG_STORAGE_MODE=persistent 预留（Day3 不实现，写入时输出 warn）                                       |

---

## 7. sitemap.xml 明确算法

页面集合（逻辑名称 → 路径模板）：

- home → /
- compare → /compare-hollow-knight
- platforms → /platforms
- timeline → /timeline
- checklist → /checklist
- toolsEmbed → /tools/embed

语言扩展：

- 默认语言（DEFAULT_LOCALE）使用上述原路径。
- 非默认语言（例如 zh）：在每条路径前添加 `/<locale>`（home 变为 `/zh/`）。

总 URL 集合生成伪代码：

```text
urls = []
for each locale in SUPPORTED_LOCALES:
  prefix = (locale===DEFAULT_LOCALE) ? '' : `/${locale}`
  for each basePath in basePaths:
    path = (basePath==='/' ? '/' : basePath)
    if (prefix) path = prefix + (path==='/' ? '/' : path)
    urls.push(path)
```

不包含：/embed/countdown（理由：仅嵌入用途）。  
示例：SUPPORTED_LOCALES=en,zh → 6 基础页面 × 2 = 12 URL。

---

## 8. i18n 校验脚本（validate-i18n.mjs）

规则：

1. 以 en.json 为基准；遍历所有 key。
2. zh.json 缺失任何 key → 构建失败。
3. zh.json 多出 en.json 未包含 key → 控制台 warn（不失败）。
4. 值为空字符串 → 失败（禁止占位）。

---

## 9. 性能与体积（附实施细化）

| 项目                    | 目标                                                  | 实施策略 |
| ----------------------- | ----------------------------------------------------- | -------- |
| 首页 JS gzip ≤170KB     | 分离 i18n JSON：动态 import(`../i18n/${locale}.json`) |
| 动态 OG 冷启动 ≤600ms   | 预加载字体 Buffer（模块顶层读取缓存）                 |
| embed countdown JS ≤9KB | 条件分支 + 手写最小化工具函数；不引入 polyfill        |

---

## 10. 新增/修订 验收用例（增量）

| 模块             | 用例                                     | 期望                |
| ---------------- | ---------------------------------------- | ------------------- |
| /api/og          | 缺主字体 + FAIL_ON_OG_FONT_MISSING=false | 302 fallback + warn |
| /api/og          | ETag 重复                                | 304                 |
| /api/timeline    | after 缺 Z                               | 400 invalid_after   |
| /api/differences | status=invalid → 忽略返回全部            | count = 全部        |
| Double Opt-in    | 重复提交未确认                           | 不生成新 token      |
| Double Opt-in    | 过期 token                               | 410                 |
| /api/log         | 包含 "UserAgent":"..."                   | 400 forbidden_key   |
| sitemap          | URL 去重验证                             | 不出现重复路径      |
| i18n             | zh.json 缺少 key                         | 构建失败            |
| i18n             | zh.json 多余 key                         | 警告但继续          |

---

## 11. 任务阶段化（现实工期 3–4 人日）

| 阶段               | 内容                                                                     | 产出         |
| ------------------ | ------------------------------------------------------------------------ | ------------ |
| Phase 1 (P0 Core)  | i18n 基础 / timeline page / /api/timeline / dynamic OG / differences API | 核心功能上线 |
| Phase 2 (P1 Value) | checklist / embed 扩展 / sitemap / Double Opt-in（结构 + mock）          | 扩展价值功能 |
| Phase 3 (P1/收尾)  | /api/log / 校验脚本增强 / ETag 全面回归测试 / 性能调优                   | 质量闭环     |

若 Phase 1 未完成，不允许提前实施 Phase 2/3。

---

## 12. 失败与回退策略（补充）

| 场景                                                 | 判定              | 回退                                                    |
| ---------------------------------------------------- | ----------------- | ------------------------------------------------------- |
| 动态 OG 字体读取失败 & FAIL_ON_OG_FONT_MISSING=false | catch             | 302 → /og/current.png                                   |
| pending 文件写入异常                                 | write/rename 报错 | 返回 500 {"error":"pending_write_failed"}（用户可重试） |
| /api/log 写入失败                                    | append 抛错       | 204（忽略）+ console.warn                               |
| i18n 校验失败                                        | 缺关键 key        | 中止构建                                                |
| sitemap 生成失败                                     | 脚本崩溃          | 构建失败（防止发布不完整 SEO 版本）                     |

---

## 13. 代码骨架约定（片段示例）

动态 OG 伪代码（仅骨架说明，不是完整实现）：

```ts
export const config = { runtime: 'edge' };
import { ImageResponse } from '@vercel/og';
import { loadFont } from '@/lib/ogFont'; // 缓存实现

export default async function handler(req:Request){
  try{
    const { searchParams } = new URL(req.url);
    const lang = ['en','zh'].includes(searchParams.get('lang')||'') ? searchParams.get('lang')! : 'en';
    const data = computeCountdown();
    const fontData = await loadFont(process.env.OG_FONT_PRIMARY);
    const body = <div style={{ /* layout */ }}>...</div>;
    const png = new ImageResponse(body,{
      width:1200,height:630,fonts:[{name:process.env.OG_FONT_PRIMARY,data:fontData,style:'normal',weight:400}]
    });
    // 计算 ETag
    return new Response(png.body,{ headers:{ 'Content-Type':'image/png','Cache-Control':'public, max-age=3600, stale-while-revalidate=300', ETag: etag } });
  }catch(e){
    return Response.redirect(`${process.env.SITE_ORIGIN}/og/current.png`,302);
  }
}
```

---

## 14. MUST / MUST NOT（Rev2 汇总）

MUST（新增或强化）：

- 所有日期时间输入参数（after / token 过期判定等）必须使用 UTC ISO8601（含 Z 或偏移）
- i18n zh.json 缺失任一 en.json key → 构建失败
- 动态 OG 主字体文件存在或（若允许）触发 fallback 行为
- Double Opt-in 每 token 单文件存储避免集中覆盖
- /api/log 成功响应状态码 204
- sitemap 包含全量多语言主页面 URL（不含 embed）
- ETag 需稳定可复算（不含随机因素）

MUST NOT：

- 不接受无时区日期（如 2025-05-01T12:00:00）
- 不在 /api/log 响应中回显传入 payload
- 不在任何 API 返回 stack trace
- 不在 i18n 文案中嵌入 HTML（保持纯文本，可后续支持富文本）
- 不将 token 持久存储超过 48h（定期清理任务可 Day4 实现）

---

## 15. Definition of Done（Rev2 最终）

满足以下全部判定 Day3 Rev2 交付完成：

1. Phase 1 全部功能上线并通过验收；Phase 2 至少 80%（含 Double Opt-in 初版 & sitemap）。
2. 修订后的验收用例清单全部 PASS（含新增 410/302/304 等场景）。
3. 构建脚本（含 validate-i18n / validate-data）退出码 0。
4. 动态 OG 在 en / zh 下输出一致风格，fallback 逻辑验证。
5. i18n 语言切换无缺失 key 警告（仅允许多余 key 警告）。
6. 并发双提交 Email 测试不丢记录（模拟 2 并发写入 token）。
7. /api/log 在 ENABLE_LOGGING=false 情况下静默 204。
8. 性能预算达成（首页 JS gzip ≤170KB）。
9. 安全：无 email / token 泄漏在日志；API 错误无 stack trace。
10. sitemap 与 hreflang 搜索引擎检测无 error。

---

## 16. 下一步建议（对产品）

| 优先推荐                                          | 理由                      |
| ------------------------------------------------- | ------------------------- |
| 引入 Vercel KV（或 Redis）替换 pending/token/file | 长期稳定 + 消除并发复杂度 |
| 差异数据多语言化方案设计（Day4）                  | 国际化闭环                |
| 事件日志切换至 Axiom / Logtail                    | 分析可视化                |
| OG 多 Variant（主题营销）                         | 提升社交点击率            |
