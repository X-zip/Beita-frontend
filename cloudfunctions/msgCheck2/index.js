// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'beita-2gx9qzlya1a8f894',
  traceUser: true,
})

// 云函数入口函数
exports.main = async (event, context) => {

  try {
    var result = await cloud.openapi.security.msgSecCheck(
      {
        version:2,
        openid:event.openid,
        scene:3,
        content: event.content,
      }
    );
    return result;
  } catch (err) {
    throw err;
  }
}
