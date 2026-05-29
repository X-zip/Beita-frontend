# 微信小程序兼容改造方案

本文记录三项可以先在小程序端落地、且不影响当前线上后端功能的兼容方案：

- 登录 session 兼容 header
- 后端防刷失败 toast 映射
- 七牛后端签发上传 token 双路径兼容

这三项的共同原则是：先让新版小程序具备兼容能力，旧后端会忽略新增 header 或新增接口失败后自动回退；等小程序版本覆盖完成后，再由后端上线对应的严格校验逻辑。

## 2026-05-29 小程序端落地记录

已在小程序端完成兼容实现：

- 新增 `miniprogram/utils/session.js`，统一保存 `/wxLogin` 返回的后端 session，并为用户态/写接口附加 `X-Login-Session`、`X-Client-Type`、`X-Client-Version`。
- 新增 `miniprogram/utils/apiCompat.js`，统一识别 `401/403/409/429/100`，避免发帖、评论、删除、认证等接口把防刷失败误当成功。
- 新增 `miniprogram/utils/uploadCredential.js`，七牛上传优先请求 `POST /qiniu/uploadToken`，失败后自动回退本地 `qntoken.js`，当前线上后端未更新时不影响上传。
- `/wxLogin` 成功后继续保存原有 `openid`，如果返回 `unionid` 和 session 字段也会一并保存；已有 `openid` 但本地无 session 时，会静默调用 `/wxLogin` 尝试刷新 session。
- 已覆盖发帖、评论、点赞、删除、认证、邮箱、举报、游戏排名、个人中心、我的发布/评论/回复/喜欢、`msgCheck`、`imgCheck` 等当前小程序真实使用接口。
- 已让七牛 uploader 尊重 `uploadURL` 和 `key` 参数；后端未返回时仍按原 region 和本地 token 逻辑上传。

仍需要后端后续配合：

- `/wxLogin` 生成并返回短期后端 session，例如 `sessionToken`。
- 高风险接口在小程序新版本覆盖后严格校验 `X-Login-Session` 与请求 `openid` 的绑定关系。
- 新增 `POST /qiniu/uploadToken`，由后端签发短期七牛上传 token，并逐步移除小程序包内 AK/SK。
- 统一后端失败返回格式，继续保持 `401/403/409/429/100 + msg`，便于小程序 toast 映射。

## 1. 登录 Session 兼容 Header

### 当前目标

先让小程序所有需要登录态的请求都带上后端 session header，但在后端还没有返回 session 时继续保持旧逻辑，不影响现有用户使用。

### 小程序端先行改法

1. 在 `/wxLogin` 成功后继续保存原有 `openid`。
2. 如果后端返回 `sessionToken`、`sessionId` 或同类字段，则保存到本地，例如：

```js
wx.setStorageSync('loginSession', result.sessionToken || '')
```

3. 如果后端当前没有返回 session，则保存空字符串：

```js
wx.setStorageSync('loginSession', '')
```

4. 所有需要登录态的请求统一附加 header：

```js
{
  'X-Login-Session': wx.getStorageSync('loginSession') || '',
  'X-Client-Type': 'miniprogram',
  'X-Client-Version': '当前小程序版本号'
}
```

5. 保留原有 `openid` 入参，不改接口名称、不改原有业务参数。

### 小程序需要覆盖的接口

当前小程序真正使用、后续需要 session 认证的接口包括：

- `/getMember`
- `/checkVerifyUserQuanzi`
- `/checkBlackList`
- `/getlikeByOpenid`
- `/gettaskbyOpenId`
- `/getCommentByOpenid`
- `/getCommentByApplyto`
- `/addtaskVerify`
- `/deleteTaskVerify`
- `/addcommentVerify`
- `/deleteCommentVerify`
- `/addlike`
- `/deleteLike`
- `/incCommentLike`
- `/decCommentLike`
- `/addVerifyUserQuanzi`
- `/sendEmailBeita`
- `/checkEmailQuanzi`
- `/msgCheck`
- `/imgCheck`
- `/sendComment`
- `/suggestion`
- `/addRank`

### 对当前线上后端的影响

无影响。旧后端不会读取这些新增 header，请求仍按原有 `openid` 参数处理。

### 后端后续必须配合

后端需要新增登录 session 能力：

1. `/wxLogin` 成功后生成短期后端 session。
2. 返回结构中增加 session 字段，例如：

```json
{
  "result": {
    "openid": "...",
    "unionid": "...",
    "sessionToken": "..."
  }
}
```

3. 后端保存 session 与 `openid`、客户端类型、过期时间的绑定关系。
4. 小程序版本覆盖后，后端对高风险接口严格校验：
   - `X-Login-Session` 必须存在
   - session 未过期
   - session 绑定的 openid 与请求参数 openid 一致
   - session 绑定的客户端类型为 `miniprogram`

## 2. 后端防刷失败 Toast 映射

### 当前目标

先在小程序端增加统一的接口失败码映射。当前后端已经有 Redis 限频、重复内容拦截、短期封禁、本地敏感词兜底，但部分页面没有正确把失败原因展示给用户，甚至会把部分非成功 code 当作成功。

### 小程序端先行改法

新增统一方法，例如：

```js
function showApiErrorToast(res, fallback = '操作失败，请稍后再试') {
  const code = Number(res?.data?.code)
   const msg = res?.data?.msg || (typeof res?.data?.code === 'string' ? res.data.code : '')
  const map = {
    401: '登录已过期，请重新进入小程序',
    403: '暂无权限或内容不合规',
    409: '请不要重复发送相同内容',
    429: '操作太频繁，请稍后再试',
    100: '操作失败，请稍后再试'
  }
  wx.showToast({
    title: msg || map[code] || fallback,
    icon: 'none'
  })
}
```

对写接口的成功分支增加判断：

```js
if (res.data.code && Number(res.data.code) !== 200) {
  showApiErrorToast(res)
  return
}
```

需要保留现有特殊业务码：

- `1`、`3`、`7`：禁言天数提示
- 现有发布、评论、认证成功逻辑不变

### 当前应优先修的页面

- `pages/addPost/addPost.js`
  - `/addtaskVerify` 当前未识别 `403/409/429`，可能误走发布成功。
- `pages/detail/detail.js`
  - `/addcommentVerify` 当前未识别 `403/409/429`，可能误走发送成功。
  - `/addlike`、`/deleteLike`、`/incCommentLike`、`/decCommentLike` 当前多为乐观更新，失败无提示。
- `pages/uitem/my_task/my_task.js`
  - `/deleteTaskVerify` 需要处理 `401/403/429`。
- `pages/uitem/myComment/myComment.js`
  - `/deleteCommentVerify` 需要处理 `401/403/429`。
- `pages/application/application.js`
  - 认证、邮箱、图片审核接口需要统一处理 `401/403/429`。
  - 兼容历史 `sendEmailBeita` 把 `code` 写成字符串的返回，例如 `发送成功`、`请检查邮箱地址`、`请稍后重试`。

### 对当前线上后端的影响

无影响。旧后端仍返回原有 code 时，小程序按旧逻辑处理；只有遇到明确失败码时才展示 toast 并停止成功流程。

### 后端后续必须配合

后端需要统一高风险接口的失败返回格式：

```json
{
  "code": 429,
  "msg": "operation too frequent"
}
```

建议固定语义：

- `401`：未登录或 session 过期
- `403`：无权限、未认证、内容不合规
- `409`：重复内容
- `429`：操作太频繁或短期限制
- `100`：通用业务失败
- `200`：成功

后端现有 `ContentGuardService` 已经返回 `401/403/409/429`，后续应把 session 校验也统一为同一返回格式。

## 3. 七牛后端签发上传 Token 双路径兼容

### 当前目标

先让小程序支持“优先使用后端签发短期七牛上传 token，失败后回退到当前本地生成 token”的双路径。这样后端还没上线新接口时，现有上传功能不受影响。

### 小程序端先行改法

新增统一方法，例如：

```js
async function getUploadCredential(scene, filePath) {
  try {
    const backendCredential = await requestBackendQiniuToken(scene, filePath)
    if (backendCredential && backendCredential.uptoken) {
      return {
        source: 'backend',
        uptoken: backendCredential.uptoken,
        key: backendCredential.key,
        uploadURL: backendCredential.uploadURL || 'https://upload-z1.qiniup.com',
        domain: backendCredential.domain || 'imgbf.yqtech.ltd'
      }
    }
  } catch (e) {
    // 后端未上线或请求失败时回退旧逻辑
  }

  return {
    source: 'legacy',
    uptoken: legacyLocalQiniuToken(),
    uploadURL: 'https://upload-z1.qiniup.com',
    domain: 'imgbf.yqtech.ltd'
  }
}
```

上传时：

1. 图片先走现有 `imgCheck`。
2. 审核通过后调用 `getUploadCredential(scene, filePath)`。
3. 如果后端 token 成功，使用后端返回的 token/key 上传。
4. 如果后端 token 失败，继续用当前 `qntoken.js` 本地生成 token 上传。
5. 上传成功后，继续把图片 URL 传给原有发帖、评论、认证接口，原业务接口入参不变。

### 需要覆盖的上传场景

- `pages/addPost/addPost.js`
  - 发帖图片上传，scene 建议为 `task`，与后端现有 `getUploadToken` 和 iOS 侧保持一致
- `pages/detail/detail.js`
  - 评论图片上传，scene 建议为 `comment`
- `pages/application/application.js`
  - 校园认证图片上传，scene 建议为 `verify`
- `pages/uitem/login/login.js`
  - 头像上传，scene 建议为 `avatar`

### 对当前线上后端的影响

无影响。新增的后端 token 接口如果不存在、超时或返回失败，小程序会自动回退到旧的本地七牛 token 生成逻辑。

注意：不能把空 token 传给七牛。七牛直传必须有有效 token，所以 fallback 应该是“旧本地 token”，不是空 token。

### 后端后续必须配合

后端需要新增接口，例如：

```http
POST /qiniu/uploadToken
```

请求示例：

```json
{
  "openid": "...",
  "unionid": "...",
  "scene": "task",
  "fileName": "xxx.png",
  "mimeType": "image/png",
  "contentType": "image/png"
}
```

返回示例：

```json
{
  "code": 200,
  "msg": "ok",
  "uptoken": "...",
  "key": "beita/task/20260529/xxx.png",
  "uploadURL": "https://upload-z1.qiniup.com",
  "domain": "imgbf.yqtech.ltd",
  "url": "https://imgbf.yqtech.ltd/beita/task/20260529/xxx.png",
  "expiresIn": 300
}
```

后端实现要求：

1. 七牛 AK/SK 只保存在后端，不再暴露给小程序。
2. token 有效期建议 300 秒。
3. key 由后端生成，不允许前端自定义完整 key。
4. 按 scene 分目录：`task`、`comment`、`verify`、`avatar`。
5. 限制文件大小和 MIME 类型。
6. 小程序版本覆盖完成后，再移除前端 `QINIU_CONFIG.ak/sk` 和 `qntoken.js`。

## 推荐上线顺序

1. 小程序先上线兼容层：
   - 带 `X-Login-Session`，无 session 时为空
   - 增加防刷失败 toast 映射
   - 七牛上传优先后端 token，失败回退旧 token
2. 等小程序新版本覆盖完成。
3. 后端上线：
   - `/wxLogin` 返回后端 session
   - 高风险接口严格校验 session
   - 新增 `/qiniu/uploadToken`
   - 统一返回 `401/403/409/429`
4. 再发一版小程序：
   - 移除本地七牛 AK/SK
   - 移除 `qntoken.js`
   - 七牛上传只走后端签发 token

## 验收标准

小程序先行版本上线时：

- 后端未更新时，登录、发帖、评论、点赞、认证、图片上传均保持可用。
- 后端未返回 session 时，请求 header 中 `X-Login-Session` 为空但不阻断。
- 后端 token 接口不存在时，七牛上传自动回退旧逻辑。
- 后端返回 `401/403/409/429` 时，小程序不再误提示成功，而是 toast 显示失败原因。

后端完成配合后：

- 只伪造 openid 不能再调用高风险写接口。
- 高频发帖/评论会收到明确 toast。
- 重复内容会收到明确 toast。
- 七牛 AK/SK 不再出现在小程序包内。
