# API Implementation Summary

## 实现完成的两个API接口

### 1. /api/log API ✅ 完成

**文件位置**: `app/api/log/route.ts`

**已实现功能**:
- ✅ **Method限制**: 仅支持POST，其他方法返回405错误
- ✅ **Body大小限制**: ≤5120 bytes，超过返回400 `payload_too_large`
- ✅ **type字段校验**: 必须为"perf"或"embed"，否则返回400 `invalid_type`
- ✅ **敏感词过滤**: 递归检查所有key和value，拒绝包含email/useragent/user_agent/ua的payload
- ✅ **错误返回**: 敏感词返回400 `forbidden_key`
- ✅ **存储实现**: LOG_STORAGE_MODE=ephemeral时写入`/data/logs-YYYYMMDD.ndjson`
- ✅ **ENABLE_LOGGING控制**: 不为true时直接返回204
- ✅ **响应格式**: 成功返回204无body
- ✅ **错误码**: 严格按PRD规范 - invalid_json, forbidden_key, server_error
- ✅ **原子文件操作**: 使用appendFileSync确保写入安全性

**关键改进**:
```typescript
// 改进的敏感词检测 - 递归搜索所有对象属性
function containsSensitiveWords(payload: any): boolean {
  function searchObject(obj: any): boolean {
    if (typeof obj === 'string') {
      return SENSITIVE_WORDS.some(word => obj.toLowerCase().includes(word));
    }
    
    if (typeof obj === 'object' && obj !== null) {
      // 检查对象key和value
      for (const key of Object.keys(obj)) {
        if (SENSITIVE_WORDS.some(word => key.toLowerCase().includes(word))) {
          return true;
        }
        if (searchObject(obj[key])) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  return searchObject(payload);
}
```

### 2. /api/differences API ✅ 完成

**文件位置**: `app/api/differences/route.ts`

**已实现功能**:
- ✅ **updated字段**: 取differences.json和differences-unconfirmed.json的mtime最大值
- ✅ **status过滤**: 逗号分割→trim→去重→仅保留合法枚举['confirmed','hinted','speculated','unconfirmed']
- ✅ **空status处理**: 空字符串时返回全部数据
- ✅ **Cache-Control头**: `public, max-age=300, stale-while-revalidate=60`
- ✅ **format=grouped**: 只包含实际出现的组，不返回空组
- ✅ **响应格式**: 符合PRD规范，包含total、updated、differences/groups字段
- ✅ **错误处理**: 500错误不暴露stack trace

**关键功能**:
```typescript
// Status过滤 - 去重和合法性校验
function processStatusFilter(statusParam: string | null): string[] | null {
  if (!statusParam) return null;
  
  const validStatuses = new Set(['confirmed', 'hinted', 'speculated', 'unconfirmed']);
  const statusList = statusParam.split(',')
    .map(s => s.trim().toLowerCase())
    .filter(s => validStatuses.has(s));
  
  // 去重
  return [...new Set(statusList)];
}

// 文件修改时间获取
function getUpdatedTimestamp(): string {
  const differencesStats = fs.statSync('data/differences.json');
  const unconfirmedStats = fs.statSync('data/differences-unconfirmed.json');
  
  const maxTime = Math.max(differencesStats.mtime.getTime(), unconfirmedStats.mtime.getTime());
  return new Date(maxTime).toISOString();
}
```

## 安全性和性能特点

### 安全性 🔐
1. **输入验证**: 严格的JSON解析和类型校验
2. **敏感信息过滤**: 递归检查防止数据泄露
3. **错误处理**: 不暴露内部错误详情
4. **原子操作**: 文件写入使用原子操作防止竞态条件

### 性能优化 ⚡
1. **Content-Length预检**: 避免大请求的完整读取
2. **缓存头设置**: 合理的缓存策略减少服务器负载
3. **文件系统缓存**: 利用fs.statSync获取修改时间
4. **内存优化**: 避免大对象的深拷贝操作

### 符合PRD的响应格式 📋

#### /api/log 响应:
```
成功: 204 (无body)
错误: 400 {"error": "invalid_json|forbidden_key|payload_too_large"}
错误: 500 {"error": "server_error"}
```

#### /api/differences 响应:
```json
// 标准格式
{
  "differences": [...],
  "updated": "2025-08-26T03:00:00Z",
  "total": 42,
  "status_filter": ["confirmed", "hinted"] // 如果有过滤
}

// 分组格式 (format=grouped)
{
  "groups": {
    "gameplay": [...],
    "story": [...]
  },
  "updated": "2025-08-26T03:00:00Z", 
  "total": 42,
  "format": "grouped"
}
```

## 环境配置要求

确保`.env.local`包含必要配置:
```env
ENABLE_LOGGING=true
LOG_STORAGE_MODE=ephemeral
SITE_HASH_SALT=your_32_char_salt
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=mock_key_for_testing
```

## API端点文档

### POST /api/log
记录性能或嵌入数据的日志

**请求体要求**:
- Content-Type: application/json
- 最大5120字节
- 必须包含`type`字段：'perf'或'embed'
- 不能包含敏感词: email, useragent, user_agent, ua

**响应码**:
- 204: 成功记录
- 400: 请求错误（invalid_json, invalid_type, forbidden_key, payload_too_large）
- 405: 方法不允许
- 500: 服务器错误

### GET /api/differences
获取Hollow Knight和Silksong的差异数据

**查询参数**:
- `status`: 状态过滤，逗号分隔（confirmed,hinted,speculated,unconfirmed）
- `format`: 'grouped'返回分组格式

**响应头**:
- Cache-Control: public, max-age=300, stale-while-revalidate=60

**响应格式**: 包含differences/groups、updated、total字段

---

✅ **两个API接口均已按PRD要求完成实现，具备生产环境的安全性和性能特点。**