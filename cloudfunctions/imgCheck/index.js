const cloud = require('wx-server-sdk')

cloud.init()

exports.main = async (event, context) => {

  try {
    var result = await cloud.openapi.security.mediaCheckAsync(
      {
        mediaUrl:event.mediaUrl,
        mediaType:2,
        version:2,
        openid:event.openid,
        scene:3,
      }
    );
    return result;
  } catch (err) {
    throw err;
  }
}