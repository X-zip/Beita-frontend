const cloud = require('wx-server-sdk')
cloud.init({
  env: 'beita-2gx9qzlya1a8f894',
  traceUser: true,
})
exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      "touser": event.openid,
      "page": event.page,
      "lang": 'zh_CN',
      "data": {
        "thing1": {
          "value": event.title
        },
        "thing2": {
          "value": event.comment
        },s
        "date3": {
          "value": event.time
        },
      },
      "templateId": '1',
    })
    return result.result.errCode
  } catch (err) {
    return err
  }
}