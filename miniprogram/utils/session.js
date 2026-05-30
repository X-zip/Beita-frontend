const SESSION_KEY = 'loginSession'
let loginPromise = null

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
  const token = extractLoginSession(result)
  wx.setStorageSync(SESSION_KEY, token)
  return token
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

function saveLoginIdentity(result) {
  if (!result) return
  if (result.openid) {
    wx.setStorageSync('openid', result.openid)
    try {
      const app = getApp()
      if (app && app.globalData) {
        app.globalData.openid = result.openid
      }
    } catch (e) {}
  }
  if (result.unionid) {
    wx.setStorageSync('unionid', result.unionid)
  }
}

function requestLoginSession() {
  return new Promise((resolve, reject) => {
    const api = require('../config/api.js')
    wx.login({
      success(loginRes) {
        if (!loginRes.code) {
          reject(new Error('wx.login missing code'))
          return
        }
        wx.request({
          url: api.Login,
          method: 'GET',
          data: {
            code: loginRes.code
          },
          header: {
            'content-type': 'application/json'
          },
          success(res) {
            const result = res.data && res.data.result
            const token = saveLoginSession(result)
            if (!token) {
              reject(new Error('login response missing session token'))
              return
            }
            saveLoginIdentity(result)
            resolve(result)
          },
          fail: reject
        })
      },
      fail: reject
    })
  })
}

function ensureLoginSession(force) {
  if (!force && getLoginSession()) {
    return Promise.resolve(getLoginSession())
  }
  if (loginPromise) {
    return loginPromise
  }
  loginPromise = requestLoginSession()
    .then(result => extractLoginSession(result))
    .then(token => {
      loginPromise = null
      return token
    })
    .catch(err => {
      loginPromise = null
      throw err
    })
  return loginPromise
}

function clearLoginSession() {
  wx.removeStorageSync(SESSION_KEY)
}

module.exports = {
  saveLoginSession,
  getLoginSession,
  ensureLoginSession,
  clearLoginSession,
  authHeader
}
