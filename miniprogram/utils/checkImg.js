async function checkString(mediaUrl,openid) {
    try {
      var res = await wx.cloud.callFunction({
        name: 'imgCheck',
        data: {
          openid,openid,
          mediaUrl: 'http://yqtech.ltd/tmp/6U1taThZ2qkk13f9fbad173e0c0beb5953bbfcf2be81.png',
        }
      });
      console.log(res);
      if (res.result.result == 'pass')
        return true;
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  module.exports = {
    checkString: checkString
  }