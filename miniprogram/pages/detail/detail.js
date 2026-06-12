// pages/detail/detail.js
const app = getApp()
var util = require('../../utils/util.js')
var check = require('../../utils/check.js')
var api = require('../../config/api.js');
var CryptoJS = require('../../utils/aes.js')
const session = require('../../utils/session.js')
const apiCompat = require('../../utils/apiCompat.js')
const tabSwipe = require('../../utils/tabSwipe.js')
const COMMENT_SWIPE_OPTIONS = {
  classField: 'commentSwipeClass',
  styleField: 'commentSwipeStyle',
  indexField: 'currentSmallTab'
}
const {
    AES_KEY,
    AES_IV,
    SUBSCRIBE_TEMPLATE_IDS,
} = require('../../utils/constants_private.js');

function encryptContent(contentObj) {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(contentObj), AES_KEY, {
      iv: AES_IV,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.ciphertext.toString().toUpperCase()
}

// 生成随机头像与名字（保持同一索引对应）
function pickRandomAvatar(avatarList, timestamp = '') {
    const imgs = avatarList?.img || [];
    const names = avatarList?.name || [];
    const n = Math.min(imgs.length, names.length); // 以较短的为准
    if (n === 0) {
      return { userName: 'Guest' + timestamp, avatar: '' }; // 可换成你的默认头像
    }

    const idx = Math.floor(Math.random() * n); // 0 ~ n-1
    return {
      userName: names[idx] + timestamp,
      avatar: imgs[idx],
      idx,
    };
}

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
    detailLoading: true,
    commentLoading: true,
    commentLoadingMore: false,
    submittingComment: false,
    pageReady: false,
    commentSwipeClass: '',
    commentSwipeStyle: '',
    width: 375,
    skeletonRows: [1, 2, 3],
    commentSkeletonRows: [1]
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
	      imageUrl: 'https://yqtech.ltd/treehole/timeline.jpg'
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
        header: session.authHeader({ 'content-type': 'application/json' }),
        success (res) {
          apiCompat.shouldStopForApiError(res)
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
        header: session.authHeader({ 'content-type': 'application/json' }),
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
            header: session.authHeader({ 'content-type': 'application/json' }),
            success (res) {
              apiCompat.shouldStopForApiError(res)
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
    if (that.data.submittingComment) {
      return
    }
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
      tmplIds: [SUBSCRIBE_TEMPLATE_IDS],
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
    that.setData({ submittingComment: true })
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
      const timestamp = Math.floor(Date.now() / 1000).toString().slice(-4);
      const picked = pickRandomAvatar(app.globalData.avatarList, timestamp);
      var nickName = picked.userName;
      var avatarT   = picked.avatar;
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
      wx.hideLoading()
      that.setData({ submittingComment: false })
      wx.showToast({
        title: '回复不能为空！',
        icon: 'none',
      })
      return;
    } else {
      let checkResult = check.checkString(that.data.comment.comment,app.globalData.openid).then(function(result) {
        if (result === null) {
          wx.hideLoading()
          that.setData({ submittingComment: false })
          return
        }
        if (result) {
            wx.request({
              url: api.Addcomment,
              method:'POST',
              data: {
                c_time: c_time,
                openid:app.globalData.openid,
                pk: that.data.comment.pk,
                comment: that.data.comment.comment,
                userName: that.data.comment.userName.replace("匿名","happy"),
                avatar: that.data.comment.avatar,
                applyTo: applyTo,
                img: JSON.stringify(that.data.imgOriList || []),
                level:level,
                pid:that.data.pid,
              },
              header: session.authHeader({ 'content-type': 'application/x-www-form-urlencoded' }),
              success (res) {
                if (apiCompat.shouldStopForApiError(res)) {
                  wx.hideLoading()
                  that.setData({ submittingComment: false })
                  return
                }
                if(res.data.code==200) {
                    wx.hideLoading()
                    that.setData({ submittingComment: false })
                    wx.showToast({
                      title: '您已被禁言！请联系管理员解封！'+'id: '+res.data.id,
                      icon: 'none',
                      duration: 1500
                    })
                  } else if(res.data.code==1){
                    wx.hideLoading()
                    that.setData({ submittingComment: false })
                    wx.showToast({
                      title: '您已被禁言1天！请联系管理员解封！'+'id: '+res.data.id,
                      icon: 'none',
                      duration: 1500
                    })
                  } else if(res.data.code==3){
                    wx.hideLoading()
                    that.setData({ submittingComment: false })
                    wx.showToast({
                      title: '您已被禁言3天！请联系管理员解封！'+'id: '+res.data.id,
                      icon: 'none',
                      duration: 1500
                    })
                  } else if(res.data.code==7){
                    wx.hideLoading()
                    that.setData({ submittingComment: false })
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
                        header: session.authHeader({ 'content-type': 'application/json' }),
                        success: function(res) {
                        }
                    })
                    that.setData({
                        form_info: '',
                        reply: false,
                        submittingComment: false
                    })
                    wx.hideLoading()
                    wx.showToast({
                        title: '发送成功',
                        icon: 'none',
                    })
                    that.onShow()
                }

              },
              fail () {
                wx.hideLoading()
                that.setData({ submittingComment: false })
                wx.showToast({
                  title: '发送失败，请稍后再试',
                  icon: 'none',
                  duration: 1500
                })
              }
            })


        } else {
          wx.hideLoading()
          that.setData({ submittingComment: false })
          wx.showToast({
            title: '有违规内容！',
            icon: 'none',
            duration: 1500
          })
        }
      }).catch(function() {
        wx.hideLoading()
        that.setData({ submittingComment: false })
        wx.showToast({
          title: '\u5185\u5bb9\u5ba1\u6838\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5',
          icon: 'none',
          duration: 1500
        })
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
      header: session.authHeader({ 'content-type': 'application/json' }),
      success (res) {
        const code = apiCompat.getApiCode(res)
        if (code === 401 || code === 403 || code === 409 || code === 429) {
          apiCompat.showApiErrorToast(res)
          return
        }
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
    var UV = app.globalData.UV
    that.setData({
      current_openid:openid,
      UV,
      width: wx.getSystemInfoSync().windowWidth
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
    that.setData({
      detailLoading: that.data.task.length == 0,
      commentLoading: that.data.list.length == 0,
      commentLoadingMore: false
    })
    const dataToEncrypt = { verify: 'zzyq', c_time: new Date() }
    const encrypted = encryptContent(dataToEncrypt)
    wx.request({
      url: api.GettaskbyId,
      method:'GET',
      data: {
        pk: pk,
        encrypted,
        c_time: new Date(),
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
            flag: '1',
            detailLoading: false,
            pageReady: true
          })
        }  else {
          that.setData({
            detailLoading: false,
            pageReady: true
          })
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
      },
      fail () {
        that.setData({
          detailLoading: false,
          pageReady: true
        })
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
          var key = AES_KEY;
          var iv = AES_IV;
          key = CryptoJS.enc.Utf8.parse(key);
          iv = CryptoJS.enc.Utf8.parse(iv);
          const dataToEncrypt = { id: pk}
          const encrypted = encryptContent(dataToEncrypt)
          wx.request({
            url: api.DeleteTask,
            method:'POST',
            data: {
              openid:app.globalData.openid,
              pk:encrypted
            },
            header: session.authHeader({ "Content-Type": "application/json" }),
            success (res) {
              if (apiCompat.shouldStopForApiError(res)) {
                return
              }
              // wx.switchTab({
              //   url: '../index/index',
              // })
              wx.navigateBack({
                delta: 0,
              })
            },
            fail(e) {
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
          wx.request({
            url: api.DeleteComment,
            method:'POST',
            data: {
              openid:app.globalData.openid,
              pk:parseInt(pk)
            },
            header: session.authHeader({ "Content-Type": "application/json" }),
            success (res) {
              if (apiCompat.shouldStopForApiError(res)) {
                return
              }
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
    const dataToEncrypt = { verify: 'zzyq', c_time: new Date() }
    const encrypted = encryptContent(dataToEncrypt)
    wx.request({
      url: api.GetCommentByType,
      method:'GET',
      data: {
        length:length,
        pk: pk,
        type:e,
        encrypted,
        c_time: new Date(),
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        that.setData({
          list: old_data.concat(res.data.commentList),
          commentLoading: false,
          commentLoadingMore: false
        })
        var getComment = new Date().getTime()
        if (res.data.commentList.length == 0) {
          that.setData({
            noMore: true
          })
        }
      },
      fail () {
        that.setData({
          commentLoading: false,
          commentLoadingMore: false
        })
      }
    })
  },

  onCommentImageChange(e) {
    this.setData({
      imgOriList: e.detail.urls || []
    })
  },

  bottomNavChange: function(e) {
    this.switchCommentTab(e.currentTarget.dataset.current)
  },

  switchCommentTab: function(nextActiveIndex) {
    var _this = this
    nextActiveIndex = Number(nextActiveIndex)
    var currentIndex = Number(_this.data.currentSmallTab) || 0
    if (isNaN(nextActiveIndex)) {
      return false
    }
    if (currentIndex != nextActiveIndex) {
      _this.setData({
        currentSmallTab: nextActiveIndex,
        prevSmallIndex: currentIndex
      });
      _this.setData({
        list:[],
        noMore: false,
        commentLoading: true,
        commentLoadingMore: false
      });
      _this.getComment(_this.data.currentSmallTab)
      return true
    }
    return false
  },

  onCommentSwipeTouchStart: function(e) {
    if (this.data.commentLoading || this.data.commentLoadingMore || this.data.submittingComment) {
      return
    }
    tabSwipe.touchStart(this, e, COMMENT_SWIPE_OPTIONS)
  },

  onCommentSwipeTouchMove: function(e) {
    tabSwipe.touchMove(this, e, COMMENT_SWIPE_OPTIONS)
  },

  onCommentSwipeTouchCancel: function() {
    tabSwipe.touchCancel(this, COMMENT_SWIPE_OPTIONS)
  },

  onCommentSwipeTouchEnd: function(e) {
    var direction = tabSwipe.getDirection(this, e, COMMENT_SWIPE_OPTIONS)
    if (!direction || this.data.commentLoading || this.data.commentLoadingMore) {
      tabSwipe.reset(this, COMMENT_SWIPE_OPTIONS)
      return
    }
    var currentIndex = Number(this.data.currentSmallTab) || 0
    var maxIndex = this.data.sub_menu.descs.length - 1
    var nextIndex = currentIndex + direction
    if (nextIndex < 0 || nextIndex > maxIndex) {
      tabSwipe.reset(this, COMMENT_SWIPE_OPTIONS)
      return
    }
    tabSwipe.playTransition(this, direction, 'commentSwipeClass', 'commentSwipeStyle')
    this.switchCommentTab(nextIndex)
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
      header: session.authHeader({ 'content-type': 'application/json' }),
      success (res) {
        apiCompat.shouldStopForApiError(res)
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
      header: session.authHeader({ 'content-type': 'application/json' }),
      success (res) {
        apiCompat.shouldStopForApiError(res)
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
    if (that.data.noMore) {
      wx.showToast({
        title: '没有更多内容',
        icon: 'none'
      })
      return
    }
    if (that.data.commentLoadingMore || that.data.commentLoading) {
      return
    }
    that.setData({ commentLoadingMore: true })
    that.getComment(e)
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
