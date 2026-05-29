const api = require('../config/api.js');
const session = require('./session.js');

async function checkString(mediaUrl) {
  return new Promise((resolve) => {
    if (!mediaUrl) {
      resolve(false);
      return;
    }

    wx.uploadFile({
      url: api.ImgCheck,
      filePath: mediaUrl,
      name: 'file',
      header: session.authHeader({ 'content-type': 'multipart/form-data' }),
      success: function(res) {
        try {
          const data = JSON.parse(res.data);
          resolve(data.errmsg === 'ok');
        } catch (err) {
          resolve(false);
        }
      },
      fail: function() {
        resolve(false);
      }
    });
  });
}

module.exports = {
  checkString: checkString
};
