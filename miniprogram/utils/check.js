
const session = require('./session.js')
const apiCompat = require('./apiCompat.js')

async function checkString(content,openid) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: "https://www.yqtech.ltd:8802/msgCheck",
        method:'GET',
        data: {
          openid: openid,
          content: content,
        },
        header: session.authHeader({ 'content-type': 'application/json' }),
        success: (result) => {
          if (apiCompat.shouldStopForApiError(result)) {
            resolve(null);
            return;
          }
          resolve(result.data && result.data.result && result.data.result.result && result.data.result.result.suggest == 'pass');
        },
        fail: (err) => {
            reject(err);
        }
      })
    })
}
module.exports = {
  checkString: checkString
}
