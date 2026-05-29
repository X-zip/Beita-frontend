const ERROR_MESSAGES = {
  401: '登录已过期，请重新进入小程序',
  403: '暂无权限或内容不合规',
  409: '请不要重复发送相同内容',
  429: '操作太频繁，请稍后再试',
  100: '操作失败，请稍后再试'
}

function getApiCode(res) {
  if (!res || !res.data || res.data.code === undefined || res.data.code === null || res.data.code === '') {
    return null
  }
  return Number(res.data.code)
}

function getApiMessage(res) {
  if (!res || !res.data) return ''
  if (res.data.msg) return res.data.msg
  if (typeof res.data.code === 'string' && Number.isNaN(Number(res.data.code))) {
    return res.data.code
  }
  return ''
}

function isGuardError(res) {
  const code = getApiCode(res)
  if (code === 401 || code === 403 || code === 409 || code === 429 || code === 100) return true
  const msg = getApiMessage(res)
  return msg === '请检查邮箱地址' || msg === '请稍后重试' || msg.indexOf('失败') >= 0
}

function showApiErrorToast(res, fallback) {
  const code = getApiCode(res)
  const msg = getApiMessage(res)
  wx.showToast({
    title: msg || ERROR_MESSAGES[code] || fallback || '操作失败，请稍后再试',
    icon: 'none',
    duration: 2000
  })
}

function shouldStopForApiError(res, fallback) {
  if (!isGuardError(res)) return false
  showApiErrorToast(res, fallback)
  return true
}

module.exports = {
  getApiCode,
  getApiMessage,
  isGuardError,
  showApiErrorToast,
  shouldStopForApiError
}
