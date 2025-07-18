// pages/detail/detail.js
const app = getApp()
var util = require('../../utils/util.js')
var check = require('../../utils/check.js')
const token = require('../../utils/qntoken.js')
const qiniuUploader = require("../../utils/qiniuUploader.js");
var api = require('../../config/api.js');
var CryptoJS = require('../../utils/aes.js')
Page({

  /**
   * Page initial data
   */
  data: {
    reply: false,
    pk: '',
    task: [],
    img: [],
    contact: '',
    flag: '0',
    open: false,
    autoplay: true, //是否开启自动切换
    interval: 3000, //自动切换时间间隔
    duration: 500, //滑动动画时长
    list: [],
    comment: [],
    form_info: '',
    secondIndex:'',
    state: false,
    like: [],
    is_like: [],
    imgOriList: [],
    is_self: false,
    hasUserInfo: false,
    pid:0,
    noMore: false,
    hidden:true,
    nocancel:true,
    banDate:"0天",
    animalList: {
      img: [
        'http://yqtech.ltd/animal/1.png',
        'http://yqtech.ltd/animal/2.png',
        'http://yqtech.ltd/animal/3.png',
        'http://yqtech.ltd/animal/4.png',
        'http://yqtech.ltd/animal/5.png',
        'http://yqtech.ltd/animal/6.png',
        'http://yqtech.ltd/animal/7.png',
        'http://yqtech.ltd/animal/8.png',
        'http://yqtech.ltd/animal/9.png',
        'http://yqtech.ltd/animal/10.png',
        'http://yqtech.ltd/animal/11.png',
        'http://yqtech.ltd/animal/12.png',
        'http://yqtech.ltd/animal/13.png',
        'http://yqtech.ltd/animal/14.png',
        'http://yqtech.ltd/animal/15.png',
        'http://yqtech.ltd/animal/16.png',
        'http://yqtech.ltd/animal/17.png',
        'http://yqtech.ltd/animal/18.png',
        'http://yqtech.ltd/animal/19.png',
        'http://yqtech.ltd/animal/20.png',
        'http://yqtech.ltd/animal/21.png',
      ],
      name: [
        'Bee',
        'Butterfly',
        'Monkey',
        'Octopus',
        'Sheep',
        'Snail',
        'Boa',
        'Dragonfly',
        'Nustang',
        'Octopus',
        'Peacock',
        'Antelope',
        'Walrus',
        'Starfish',
        'Otter',
        'Alligator',
        'Squirrel',
        'Ostrich',
        'Albatross',
        'Alpaca',
        'Ladybird',
      ],
      nickNameOld:'',
      avatarOld:'',
      colorArr: ['rgba(53, 208, 242, 0.85)','rgba(228, 169, 138, 0.9)','rgba(228, 113, 17, 0.85)','rgba(169, 36, 144, 0.85)'],
      length:0,
    },
    sub_menu: {
      descs: [
        '正序',
        '倒序',
        '最热'
      ],
    },
    currentSmallTab: 0,
    clickList:[],
    likeList:[],
  },

  onShareAppMessage: function() {
		wx.showShareMenu({
	      withShareTicket: true,
	      menus: ['shareAppMessage', 'shareTimeline']
	    })
  },
  
	//用户点击右上角分享朋友圈
	onShareTimeline: function () {
    var that = this
    if (that.data.img[0] != '') {
      return {
	      title: that.data.task[0].title,
	      imageUrl: that.data.img[0]
	    }
    } else {
      return {
	      title: that.data.task[0].title,
	      imageUrl: 'http://yqtech.ltd/treehole/timeline.jpg'
	    }
    }

	},

  reply(e) {
    this.setData({
      reply: true,
      cengzhu: e.currentTarget.dataset.id,
      replyName: e.currentTarget.dataset.user,
      pid:e.currentTarget.dataset.pid,
      second:e.currentTarget.dataset.second
    })
  },

  nologin() {
    wx.showToast({
      title: '未设置头像及昵称！请前往个人中心设置头像和昵称。',
      icon: 'none',
      duration: 3000,
      mask: true,
    })
  },

  thumbsup: function(e) {
    var that = this
    var pk = that.data.pk 
    var openid = app.globalData.openid
    if (that.data.state == false) {
      that.setData({
        ['state']: true
      })
      if (wx.getStorageSync('likeList').length>0) {
        var likeList = wx.getStorageSync('likeList')
        likeList.push(pk)
        wx.setStorageSync('likeList', likeList)
        that.setData({
          likeList:likeList
        })
      } else {
        var likeList = []
        likeList.push(pk)
        wx.setStorageSync('likeList', likeList)
        that.setData({
          likeList:likeList
        })
      }
      wx.request({
        url: api.AddLike,
        method:'GET',
        data: {
          pk: that.data.pk,
          openid:app.globalData.openid
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success (res) {

        },
      })
    } else {
      that.setData({
        ['state']: false
      })
      if (wx.getStorageSync('likeList').length>0) {
        var likeList = wx.getStorageSync('likeList')
        for (var i=0,len=likeList.length; i<len; i++) {
          if (likeList[i] == pk) {
            likeList.splice(i,1)
          }
        }
        wx.setStorageSync('likeList', likeList)
        that.setData({
          likeList:likeList
        })
      }
      wx.request({
        url: api.GetlikeByPk,
        method:'GET',
        data: {
          openid: openid,
          pk: pk
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success (res) {
          that.setData({
            ['_id']: res.data.likeList[0].id,
            ['_pk']: res.data.likeList[0].pk
          })
          wx.request({
            url: api.DeleteLike,
            method:'GET',
            data: {
              id:parseInt(that.data._id),
              pk:parseInt(that.data._pk),
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success (res) {

            },
          })
        },
      })
    }
  },


  submitForm(e) {
    var pages = getCurrentPages();
    var userName = wx.getStorageSync('userName');
    var avatar = wx.getStorageSync('avatarUrl');
    var form = e.detail.value;
    var that = this;
    var pk = that.data.pk
    var isVerified = wx.getStorageSync('isVerified')
    if(isVerified != 1) {
        wx.showModal({
            title: '未认证！',
            content: '请前往个人中心进行校园认证。',
            success (res) {
                if (res.confirm) {
                    wx.navigateTo({
                        url: '../usercenter/usercenter'
                      })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
            }
        })
        return
    } 
    if (pages.length > 1) {
      var page = pages[1].route + '?id=' + pk
    } else {
      var page = pages[0].route + '?id=' + pk
    }
    wx.requestSubscribeMessage({
      tmplIds: ['w5kbqlvMy5KVxqCDtQgVsDgcV_TCS63xrLKVAbpH9aQ'],
      success(res) {
        if (wx.getStorageSync('subNum')) {
          var num = Number(wx.getStorageSync('subNum'))
          num += 1
          wx.setStorageSync('subNum', num)
        } else {
          wx.setStorageSync('subNum', 1)
        }
      }
    })
    wx.showLoading({
      title: '发送中',
    })
    if (that.data.reply) {
      var applyTo = that.data.cengzhu
      var level = 2
    } else {
      var applyTo = that.data.task[0].openid
      var level = 1
    }
    let comment = that.data.comment
    that.setData({
      ['comment.pk']: that.data.pk
    })
    that.setData({
      ['comment.comment']: form.comment
    })
    if (that.data.task[0].radioGroup == "radio4" || that.data.task[0].radioGroup == "radio40" || that.data.task[0].radioGroup == "radio41" || that.data.task[0].radioGroup == "radio42" || that.data.task[0].radioGroup == "radio43"){
      const tmp = parseInt(Math.floor(Math.random()*21))
      var timestamp = String(Date.parse(new Date()) / 1000);
      timestamp = timestamp.slice(-4);
      var nickName=that.data.animalList.name[tmp]+timestamp
      var avatarT = that.data.animalList.img[tmp]
      if (wx.getStorageSync('avatar')) {
        that.setData({
          ['comment.avatar']: wx.getStorageSync('avatar')
        })
      } else {
        that.setData({
          ['comment.avatar']: avatarT
        })
      }
      var openid = app.globalData.openid
      if (openid == that.data.task[0].openid) {
        that.setData({
          ['comment.userName']: '楼主'
        })
      } else if (form.nickNameinfo!='' && form.nickNameinfo.split(" ").join("") !='楼主' && form.nickNameinfo.split(" ").join("") !='匿名') {
        that.setData({
          ['comment.userName']: form.nickNameinfo
        })
        wx.setStorageSync('nickName',form.nickNameinfo)
      } else {
        that.setData({
          ['comment.userName']: nickName
        })
        wx.setStorageSync('nickName',nickName)
      } 
    }else {
      that.setData({
        ['comment.userName']: userName
      })
      that.setData({
        ['comment.avatar']: avatar
      })  
    }   
    var c_time = util.formatTime(new Date())
    if (form.comment == "") {
    //if (1) {
      wx.showToast({
        title: '回复不能为空！',
        icon: 'none',
      })
      return;
    } else {
    //   const db = wx.cloud.database()
      let checkResult = check.checkString(that.data.comment.comment,app.globalData.openid).then(function(result) {
        if (result) {
            wx.request({
              url: api.Addcomment,
              method:'GET',
              data: {
                c_time: c_time,
                openid:app.globalData.openid,
                pk: that.data.comment.pk,
                comment: that.data.comment.comment,
                userName: that.data.comment.userName.replace("匿名","happy"),
                avatar: that.data.comment.avatar,
                applyTo: applyTo,
                img:that.data.imgOriList,
                level:level,
                pid:that.data.pid,
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success (res) {
                console.log("res: ",res)
                if(res.data.code==200) {
                    wx.showToast({
                      title: '您已被禁言！请联系管理员解封！'+'id: '+res.data.id,
                      icon: 'none',
                      duration: 1500
                    })
                  } else if(res.data.code==1){
                    wx.showToast({
                      title: '您已被禁言1天！请联系管理员解封！'+'id: '+res.data.id,
                      icon: 'none',
                      duration: 1500
                    })
                  } else if(res.data.code==3){
                    wx.showToast({
                      title: '您已被禁言3天！请联系管理员解封！'+'id: '+res.data.id,
                      icon: 'none',
                      duration: 1500
                    })
                  } else if(res.data.code==7){
                    wx.showToast({
                      title: '您已被禁言7天！请联系管理员解封！'+'id: '+res.data.id,
                      icon: 'none',
                      duration: 1500
                      })
                  } else {
                    comment = that.data.comment.comment
                    var title = that.data.task[0].title
                    if (title.length>15) {
                    title = title.substr(0,15)+'...'
                    }
                    if (comment.length>15) {
                    comment = comment.substr(0,15)+'...'
                    }
                    wx.request({
                        url: api.SendComment,
                        method:'GET',
                        data: {
                            openid: applyTo,
                            page: page,
                            title: title,
                            comment: comment,
                            time: c_time,
                        },
                        header: {
                            'content-type': 'application/json' // 默认值
                        },
                        success: function(re) {
                            
                        }
                    })
                    that.setData({
                        form_info: '',
                        reply: false,
                    })
                    wx.hideLoading()
                    wx.showToast({
                        title: '发送成功',
                        icon: 'none',
                    })
                    that.onShow() 
                }
                
              },
            })
          
          
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '有违规内容！',
            icon: 'none',
            duration: 1500
          })
        }
      })
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  get_info: function() {
    var that = this;
    wx.request({
      url: api.CheckBlackList,
      method:'GET',
      data: {
        openid:app.globalData.openid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        if(res.data.code==200 || res.data.code==1 || res.data.code==3 || res.data.code==7 ) {
          wx.showToast({
            title: '您近期有违规操作，请与贝塔联系！',
            icon: 'none',
            duration: 1500
          })
          return;
        } else {
          wx.setClipboardData({
            data: that.data.task[0].wechat,
            success: function(res) {
              // self.setData({copyTip:true}),
              wx.showModal({
                title: '提示',
                content: '对方联系方式已复制到粘贴板，请尽快与对方联系！',
                success: function(res) {
                  if (res.confirm) {
                  } else if (res.cancel) {
                  }
                }
              })
            }
          })      
        }
      }
    })  
    
  },

  return_index: function() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  toSuggestion: function() {
    if (this.data.hasUserInfo) {
      wx.navigateTo({
        url: '../uitem/suggestion/suggestion?id=' + this.data.pk,
      })
    } else {
      wx.showToast({
        title: '请先登录！',
        icon: 'none',
        duration: 2000,
        mask: true,
      })
    }

  },

  toTreeHole: function() {
    wx.switchTab({
      url: '../treehole/treehole',
    })
  },

  onLoad: function(query) {
    var that = this
    if(query.scene) {
      var pk = decodeURIComponent(query.scene).replace('id=','')
    } else {
      var pk = query.id
    }
    var openid = app.globalData.openid
    that.setData({
      current_openid:openid,
    })
    if (wx.getStorageSync('nickName')) {
      var nickNameInfo = wx.getStorageSync('nickName')
      that.setData({
        nickNameOld:nickNameInfo
      })
    }
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    that.setData({
      pk: pk
    })
    // that.add_watch()
    if (wx.getStorageSync('avatarUrl') && wx.getStorageSync('userName')) {
      this.setData({
        hasUserInfo: true
      })
    }
    that.setData({
        isdel: wx.getStorageSync('isdel')
    })
    var clickList = wx.getStorageSync('clickList')
    var likeList = wx.getStorageSync('likeList')
    that.setData({
      clickList:clickList,
      likeList:likeList
    })
    // var kuaishou = wx.getStorageSync('kuaishoutime')
    // var now = Date.parse(new Date());
    // if (kuaishou == "" || (now - kuaishou)/1000 > 60*60*1) {
    //     wx.request({
    //         url: 'https://kl014.hwm01.cn/?k=5ao81bjiob4t2',
    //         method:'GET',
    //         data: {
    //         },
    //         header: {
    //             'content-type': 'application/json' // 默认值
    //         },
    //         success (res) {
    //             console.log(res.data.text)
    //             wx.setStorageSync('kuaishoutime', Date.parse(new Date()))
    //             wx.setClipboardData({
    //                 data: res.data.text,
    //                 success: function(res) {
    //                     wx.hideToast()
    //                     wx.showLoading({
    //                         title: '加载中',
    //                         mask: true,
    //                     })
    //                     wx.hideLoading()
    //                     console.log(res)
    //                 }
    //             })    
    //         }
    //     })
    // }
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {
    var that = this
    var openid = app.globalData.openid
    var pk = that.data.pk
    wx.request({
      url: api.GettaskbyId,
      method:'GET',
      data: {
        pk: pk,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {  
         if (res.data.taskList.length > 0){
          if (openid == res.data.taskList[0].openid) {
            that.setData({
              is_self: true
            })
          }
          if (res.data.taskList[0].is_complaint == 1){
            wx.showModal({
              title: '提示',
              content: '可能涉及敏感内容，正在人工审核中',
              showCancel:false,
              success (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1,
                  })
                }
              }
            })
          }
          that.setData({
            img: res.data.taskList[0].img.split(','),
            task:res.data.taskList,
            flag: '1'
          })
        }  else {
          wx.showModal({
            title: '提示',
            content: '该内容已被发布者删除,请返回首页查看其他内容',
            showCancel:false,
            success (res) {
              if (res.confirm) {
              wx.switchTab({
                url: '../index/index',
              })
              }
              }
          })
        }       
      }
    })
    var e = that.data.currentSmallTab
    that.getComment(e)
    if(wx.getStorageSync('likeList')){
      var likeList = wx.getStorageSync('likeList')
      if (likeList.indexOf(pk,0)!=-1){
        that.setData({
          state:true
        })
      }
    } else {
      that.setData({
        state:false
      })
    }
  },

  imgYu: function(e) {
    var that = this
    //图片预览
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: that.data.img,
    })
  },

  commentYu: function(e) {
    var that = this
    //图片预览
    var urlList = []
    urlList.push(e.currentTarget.dataset.src)
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: urlList,
    })
  },

  
  delete_detail(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function(sm) {
        if (sm.confirm) {
          // 用户点击了确定 可以调用删除方法了  
          var pk = e.target.dataset.id
          var key = '[password]';
          var iv = '[password]';
          key = CryptoJS.enc.Utf8.parse(key);
          iv = CryptoJS.enc.Utf8.parse(iv);
          var param = '{"id":"'+pk+'"}'
          var encrypted = CryptoJS.AES.encrypt(param, key, {
            iv: iv,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
          });
          encrypted = encrypted.ciphertext.toString().toUpperCase();  
          wx.request({
            url: api.DeleteTask,
            method:'GET',
            data: {
              pk:encrypted
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success (res) {
              // wx.switchTab({
              //   url: '../index/index',
              // })
              wx.navigateBack({
                delta: 0,
              })
            },
            fail(e) {
                console.log(e)
            }
          })
        } else if (sm.cancel) {
    
        }
      }
    })
  },

  delete_comment(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          // 用户点击了确定 可以调用删除方法了  
          var pk = e.target.dataset.id
        //   const db = wx.cloud.database()
          wx.request({
            url: api.DeleteComment,
            method:'GET',
            data: {
              pk:parseInt(pk)
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success (res) {
              wx.showToast({
                title: '删除成功！',
                icon: 'none',
              })
              that.onShow()
            },
          })
        } else if (sm.cancel) {
        }
      }
    })
  },

  getSecondComment:function(id){
    var that = this
    wx.request({
      url: api.GetSecondLevel,
      method:'GET',
      data: {
        id: id,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        var data = 'list[' + that.data.second + '].commentList';
        that.setData({
          [data]: res.data.commentSecondList
        })
        that.setData({
          secondIndex:''
        })
      },
    })
  },

  getComment:function(e) {
    var that = this
    var pk = that.data.pk    
    var old_data = that.data.list;
    var length = old_data.length
    wx.request({
      url: api.GetCommentByType,
      method:'GET',
      data: {
        length:length,
        pk: pk,
        type:e
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        that.setData({
          list: old_data.concat(res.data.commentList)
        })
        var getComment = new Date().getTime()
        if (res.data.commentList.length == 0) {
          that.setData({
            noMore: true
          })
        }
      },
    })
  },

  takePhoto: function() {
    var that = this;
    //拍照、从相册选择上传
    wx.chooseMedia({
      count: 1, //这个是上传的最大数量，默认为9
      mediaType: ['image'],
      sourceType: ['album', 'camera'], //这个是图片来源，相册或者相机
      success: function(res) {
        that.setData({
          imgOriList:[]
        })
        var tempFilePaths = res.tempFiles //这个是选择后返回的图片列表
        that.getCanvasImg(0, 0, tempFilePaths) //进行压缩
      }
    });
  },

  getCanvasImg: function(index, failNum, tempFilePaths) {
    var that = this;
    if (index < tempFilePaths.length) {
      wx.getImageInfo({
        src: tempFilePaths[index].tempFilePath,
        success: function(res) {
          index = index + 1; //上传成功的数量，上传成功则加1
          var oriPath = res.path
          wx.uploadFile({
            filePath: res.path,
            name: 'file',
            url: api.ImgCheck,
            header: {
                'content-type': 'multipart/form-data'
            },
            success: function(checkres) {
              console.log("checkres",checkres)
                if (JSON.parse(checkres.data).errmsg == "ok") {
                    that.uploadCanvasImg(res.path,oriPath);
                } else {
                    wx.showToast({
                        title: '图片违规！',
                        icon:'error'
                    })
                }
            },
            fail: function(checke) {
                wx.showToast({
                  title: '图片违规！',
                  icon:'error'
                })
            }
          })       
        }
      })
    } else {
      // wx.hideLoading()
    }
  },

  uploadCanvasImg: function(oriImg) {
    wx.showLoading({
      title: '正在上传图片...',
      mask: true
    })
    this.gettoken()
    this.uploadOri(oriImg)
  },

  gettoken() {
    var tokendata = []
    tokendata.ak = 'wnkRCtmFWg7DZhCLjT72UOAT9WCdaI-TkPi8ncHr'
    tokendata.sk = '_8ZESS4_ZA0fqCMekohRgyVbWT01C7qi12Xj2OM7'
    tokendata.bkt = 'beifanggx'
    tokendata.cdn = ''
    this.data.tokendata = tokendata
    var uptoken = token.token(tokendata)
    this.setData({
      uptoken: uptoken
    })
  },

  uploadOri(e) {
    wx.showLoading({
      title: '正在上传图片...',
      mask: true
    })
    var that = this
    qiniuUploader.upload(
      e, //上传的图片
      (res) => { //回调 success
        let url = 'http://' + res.imageURL;      
        let imgOriList = that.data.imgOriList;
        imgOriList.push(url)
        that.setData({
          imgOriList: imgOriList,
        })
        wx.hideLoading()
      },
      (error) => { //回调 fail
      }, {
        // 参数设置  地区代码 token domain 和直传的链接 注意七牛四个不同地域的链接不一样，我使用的是华南地区
        region: 'NCN',
        // ECN, SCN, NCN, NA, ASG，分别对应七牛的：华东，华南，华北，北美，新加坡 5 个区域
        uptoken: that.data.uptoken, //上传凭证自己生成
        uploadURL: 'https://upload-z1.qiniup.com', //下面选你的区z2是华南的
        domain: 'imgbf.yqtech.ltd', //cdn域名建议直接写出来不然容易出异步问题如domain:‘你的cdn’
      },
      (progress) => {

      },
    )
  },

  bottomNavChange: function(e) {
    var _this = this,nextActiveIndex = e.currentTarget.dataset.current,
      currentIndex = _this.data.currentSmallTab;
    if (currentIndex != nextActiveIndex) {
      _this.setData({
        currentSmallTab: nextActiveIndex,
        prevSmallIndex: currentIndex
      });
      _this.setData({
        list:[],
      });
      _this.getComment(_this.data.currentSmallTab)
    }
  },

  clickComment:function(e){
    var that =this
    if (wx.getStorageSync('clickList').length>0) {
      var clickList = wx.getStorageSync('clickList')
      clickList.push(e.currentTarget.dataset.id)
      wx.setStorageSync('clickList', clickList)
      that.setData({
        clickList:clickList
      })
    } else {
      var clickList = []
      clickList.push(e.currentTarget.dataset.id)
      wx.setStorageSync('clickList', clickList)
      that.setData({
        clickList:clickList
      })
    }
    var list = that.data.list
    for (var i in list) {
      if (list[i].id == e.currentTarget.dataset.id) {
        list[i].like_num ++
      } else {
        for (var j in list[i].commentList) {
          if (list[i].commentList[j].id == e.currentTarget.dataset.id){
            list[i].commentList[j].like_num ++
          }
        }
      }
    }
    that.setData({
      list:list
    })
    wx.request({
      url: api.IncCommentLike,
      method:'GET',
      data: {
        pk: e.currentTarget.dataset.id,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        
      },
    })
  },

  unClickComment:function(e){
    var that =this
    if (wx.getStorageSync('clickList').length>0) {
      var clickList = wx.getStorageSync('clickList')
      for (var i=0,len=clickList.length; i<len; i++) {
        if (clickList[i] == e.currentTarget.dataset.id) {
          clickList.splice(i,1)
        }
      }
      wx.setStorageSync('clickList', clickList)
      that.setData({
        clickList:clickList
      })
    }
    var list = that.data.list
    for (var i in list) {
      if (list[i].id == e.currentTarget.dataset.id) {
        list[i].like_num --
      } else {
        for (var j in list[i].commentList) {
          if (list[i].commentList[j].id == e.currentTarget.dataset.id){
            list[i].commentList[j].like_num --
          }
        }
      }
    }
    that.setData({
      list:list
    })
    wx.request({
      url: api.DecCommentLike,
      method:'GET',
      data: {
        pk: e.currentTarget.dataset.id,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        
      },
    })
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {
    var that = this
    var e = that.data.currentSmallTab
    that.getComment(e)
    if (that.data.noMore) {
      wx.showToast({
        title: '没有更多内容',
        icon: 'none'
      })
    }
  },
  /**
 *  点击确认
 */
confirm: function(){
    this.setData({
        hidden: true
    })
  },
  previewQr:function(event){
    var id = event.target.dataset.id;
    wx.previewImage({
        current: id,
        urls: id.split(),
      })
  },
  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  }
})