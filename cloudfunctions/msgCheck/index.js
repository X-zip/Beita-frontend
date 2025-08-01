// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext();
  // console.log(event)
  // console.log(context)


  try {
    var result = await cloud.openapi.security.msgSecCheck(
      {
        content: event.content,
      }
    );
    return result;
  } catch (err) {
    throw err;
  }
}
