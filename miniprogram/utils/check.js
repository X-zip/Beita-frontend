const api = require("../config/api")

async function checkString(content,openid) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: api.MsgCheck,
        method:'GET',
        data: {
          openid,openid,
          content: content,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: (result) => {
          console.log(result)
          resolve(result.data.result.result.suggest == 'pass');
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