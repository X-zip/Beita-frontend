// const ApiRootUrl = 'https://localhost:8802/';
const {
    API_ROOT_URL,
} = require('../utils/constants_private.js');
const ApiRootUrl = API_ROOT_URL
// const ApiRootUrl = 'https://192.168.1.94:8802/';

module.exports = {
  GettaskbyType: ApiRootUrl + 'gettaskbyType', //获取首页帖子
  GetBanner: ApiRootUrl + 'getBanner', //获取首页banner
  GetBanner2: ApiRootUrl + 'getBanner2', //获取首页banner
//   AddTask: ApiRootUrl + 'addtask', // 发布帖子
  AddTask: ApiRootUrl + 'addtaskXiaoyuan',
  AddRank: ApiRootUrl + 'addRank', // 合成北理工 提交成绩
  GetRank: ApiRootUrl + 'getRankList', // 合成北理工 排名
  Login: ApiRootUrl + 'wxLogin',
  MsgCheck:ApiRootUrl + 'msgCheck',
  ImgCheck:ApiRootUrl + 'imgCheck',
  SendComment:ApiRootUrl + 'sendComment',
  GetQRList:ApiRootUrl + 'getQRList',
  DeleteTask:ApiRootUrl + 'deleteTask',
  AddVerifyUserQuanzi:ApiRootUrl + 'addVerifyUserQuanzi',
  SendEmailBeita:ApiRootUrl + 'sendEmailBeita',
  CheckVerifyUserQuanzi:ApiRootUrl + 'checkVerifyUserQuanzi',
  CheckEmailQuanzi:ApiRootUrl + 'checkEmailQuanzi',
  GetHotTaskXiaoyuan:ApiRootUrl + 'getHotTaskXiaoyuan',
  AddLike:ApiRootUrl + 'addlike',
  GetlikeByPk:ApiRootUrl + 'getlikeByPk',
  DeleteLike:ApiRootUrl + 'deleteLike',
  Addcomment:ApiRootUrl + 'addcomment',
  DeleteComment:ApiRootUrl + 'deleteComment',
  CheckBlackList:ApiRootUrl + 'checkBlackList',
  GettaskbyId:ApiRootUrl + 'gettaskbyId',
  GetSecondLevel:ApiRootUrl + 'getSecondLevel',
  GetCommentByType:ApiRootUrl + 'getCommentByType',
  IncCommentLike:ApiRootUrl + 'incCommentLike',
  DecCommentLike:ApiRootUrl + 'decCommentLike',
  GettaskbySearch:ApiRootUrl + 'gettaskbySearch',
  GetMember:ApiRootUrl + 'getMember',
  GetlikeByOpenid:ApiRootUrl + 'getlikeByOpenid',
  GettaskbyOpenId:ApiRootUrl + 'gettaskbyOpenId',
  GetCommentByOpenid:ApiRootUrl + 'getCommentByOpenid',
  GetCommentByApplyto:ApiRootUrl + 'getCommentByApplyto',
  Suggestion:ApiRootUrl + 'suggestion',
};