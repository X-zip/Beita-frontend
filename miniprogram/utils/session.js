const SESSION_KEY = 'loginSession'

function getClientVersion() {
  try {
    const accountInfo = wx.getAccountInfoSync && wx.getAccountInfoSync()
    return (accountInfo && accountInfo.miniProgram && accountInfo.miniProgram.version) || ''
  } catch (e) {
    return ''
  }
}

function extractLoginSession(result) {
  if (!result) return ''
  return result.sessionToken || result.sessionId || result.loginSession || result.token || result.session || ''
}

function saveLoginSession(result) {
  wx.setStorageSync(SESSION_KEY, extractLoginSession(result))
}

function getLoginSession() {
  return wx.getStorageSync(SESSION_KEY) || ''
}

function authHeader(base) {
  return Object.assign({}, base || {}, {
    'X-Login-Session': getLoginSession(),
    'X-Client-Type': 'miniprogram',
    'X-Client-Version': getClientVersion()
  })
}

module.exports = {
  saveLoginSession,
  getLoginSession,
  authHeader
}
