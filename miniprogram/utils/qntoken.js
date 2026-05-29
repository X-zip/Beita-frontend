const Buffer = require('./buffer/buffer.js');
const CryptoJS = require('./copyto/hmac-sha1.js');
const base64 = require('./copyto/enc-base64.js');



function base64ToUrlSafe(v) {
  return v.replace(/\//g, '_').replace(/\+/g, '-');
};

function token(opt) {
  var  accessKey = opt.ak;
  var secretkey = opt.sk;
  var bucket=opt.bkt;
  var  strdata={
    "scope": bucket,//空间域名
    "deadline": Date.parse(new Date()) //当前时间截
  }
  wx.setStorageSync('tokentime', strdata.deadline)
  var str = JSON.stringify(strdata);
  var encoded = Buffer.from(str).toString('base64');
  var encodedStr = base64ToUrlSafe(encoded);
//HmacSHA1加密

  var sign = CryptoJS.HmacSHA1(encodedStr, secretkey);
  var cod = base64.stringify(sign)
  var encodedSign = base64ToUrlSafe(cod);
  var token = accessKey + ':' + encodedSign + ':' + encodedStr;
  return token;
};


exports.hmacSha1 = function (encodedFlags, secretKey) {
  /*
 *return value already encoded with base64
 * */
  var hmac = crypto.createHmac('sha1', secretKey);
  hmac.update(encodedFlags);
  return hmac.digest('base64');
};

module.exports = {
  token:token
}