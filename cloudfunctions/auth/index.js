// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const pk = event.pk
  try {
    var contentType = event.contentType;
    const result = await db.collection('member').doc(pk).update({
      data: {
        au1 :event.au1,
        au2: event.au2,
        au3: event.au3,
        au4: event.au4,
        au5: event.au5,
      }
    });
    return result;

  } catch (err) {
    return err;
  }


}