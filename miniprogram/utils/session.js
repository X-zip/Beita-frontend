const SESSION_KEY = 'loginSession'
const SESSION_SUPPORTED_KEY = 'loginSessionSupported'
const UNIONID_BACKFILL_FAILED_AT_KEY = 'unionidBackfillFailedAt'
const UNIONID_BACKFILL_RETRY_INTERVAL = 24 * 60 * 60 * 1000
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
  wx.setStorageSync(SESSION_SUPPORTED_KEY, !!token)
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

function requestLoginSession(preserveExistingSession) {
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
            saveLoginIdentity(result)
            if (preserveExistingSession && getLoginSession() && !extractLoginSession(result)) {
              resolve(result)
              return
            }
            saveLoginSession(result)
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
  if (!force && wx.getStorageSync(SESSION_SUPPORTED_KEY) === false) {
    return Promise.resolve('')
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

function ensureUnionidBackfill() {
  if (wx.getStorageSync('unionid')) {
    return Promise.resolve(wx.getStorageSync('unionid'))
  }
  const failedAt = Number(wx.getStorageSync(UNIONID_BACKFILL_FAILED_AT_KEY) || 0)
  if (failedAt && Date.now() - failedAt < UNIONID_BACKFILL_RETRY_INTERVAL) {
    return Promise.resolve('')
  }
  return requestLoginSession(true)
    .then(result => {
      const unionid = result && result.unionid ? result.unionid : ''
      if (unionid) {
        wx.removeStorageSync(UNIONID_BACKFILL_FAILED_AT_KEY)
        return unionid
      }
      wx.setStorageSync(UNIONID_BACKFILL_FAILED_AT_KEY, Date.now())
      return ''
    })
    .catch(err => {
      wx.setStorageSync(UNIONID_BACKFILL_FAILED_AT_KEY, Date.now())
      throw err
    })
}

function clearLoginSession() {
  wx.removeStorageSync(SESSION_KEY)
  wx.removeStorageSync(SESSION_SUPPORTED_KEY)
}

module.exports = {
  saveLoginSession,
  getLoginSession,
  ensureLoginSession,
  ensureUnionidBackfill,
  clearLoginSession,
  authHeader
}
