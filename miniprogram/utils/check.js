
const session = require('./session.js')
const apiCompat = require('./apiCompat.js')
const api = require('../config/api.js')

function getSuggest(data) {
  return data && data.result && data.result.result && data.result.result.suggest
}

function requestCheck(content, openid, retried) {
  return new Promise((resolve, reject) => {
      wx.request({
        url: api.MsgCheck,
        method:'GET',
        data: {
          openid: openid || wx.getStorageSync('openid'),
          content: content,
        },
        header: session.authHeader({ 'content-type': 'application/json' }),
        success: (result) => {
          const code = apiCompat.getApiCode(result);
          if (code === 401 && !retried) {
            session.clearLoginSession();
            session.ensureLoginSession(true)
              .then(() => requestCheck(content, wx.getStorageSync('openid'), true).then(resolve).catch(reject))
              .catch(reject);
            return;
          }
          if (apiCompat.shouldStopForApiError(result)) {
            resolve(null);
            return;
          }
          const suggest = getSuggest(result.data);
          if (!suggest) {
            reject(new Error('msgCheck response missing suggest'));
            return;
          }
          resolve(suggest == 'pass');
        },
        fail: (err) => {
            reject(err);
        }
      })
    })
}

async function checkString(content,openid) {
  return session.ensureLoginSession()
    .then(() => requestCheck(content, openid || wx.getStorageSync('openid'), false));
}

module.exports = {
  checkString: checkString
}
