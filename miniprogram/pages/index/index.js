// pages/index/index.js
var app = getApp();
var api = require('../../config/api.js');
Page({

  /**
   * Page initial data
   */
  data: {
    notice: [{
      'title': '重要提示：请允许向您推送订阅消息，否则您无法接收评论提醒',
    }],
    noMore: false,
    tasks: [],
    hidden: true,
    addflag: true, //判断是否显示搜索框右侧部分
    addimg: '../../images/search_icon.png',
    closeimg: '../../images/close.png',
    moreimg: '../../images/more.png',
    searchstr: '',
    scrollLeft: 0,
    prevIndex: -1,
    triggered: false,
    menu: {
      imgUrls: [
        '../../images/all.png',
        '../../images/second_hand.png',
        '../../images/find.png',
        '../../images/help.png',
        '../../images/internship.png',        
        '../../images/rent.png',
        '../../images/saylove.png',
      ],
      descs: [
        '全部内容',
        '二手市场',
        '失物寻物',
        '打听求助',
        '兼职发布',       
        '租房信息',
        '情感倾诉',
      ],
      name: [
        'all',
        'second',
        'find',
        'help',
        'parttime',
        'rent',
        'love'
      ]
    },
    sub_menu: {
      descs: [
        '全部校区',
        '中关村',
        '良乡',     
        '珠海',  
      ],
    name:[
      '2',
      '1',
      '0',
      '3', 
    ]},
    currentTab: 0,
    currentSmallTab:0,
    imgUrls: [
      'http://yqtech.ltd/bit_titlesecond_title.jpg',
      'http://yqtech.ltd/bit_titlefind_title.png',
      'http://yqtech.ltd/treehole/treehole.png',
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 3600,
    duration: 500,
    scrollTop:0,
    showBanner:false,
    scrollValue:280,
    top:0,
    navBarHeight: app.globalData.navBarHeight,//导航栏高度
    menuBotton: app.globalData.menuBotton,//导航栏距离顶部距离
    menuHeight: app.globalData.menuHeight, //导航栏高度
    menuRight:app.globalData.menuRight,
    menuWidth:app.globalData.menuWidth,
    bottomEdge:app.globalData.bottomEdge,
    items: [
      { "icon": "../../images/second_hand.png", "name": "二手市场","type":"second" },
      { "icon": "../../images/find.png", "name": "失物寻物","type":"Find" },
      { "icon": "../../images/help.png", "name": "打听求助","type":"Help" },
      { "icon": "../../images/treehole.png", "name": "北理树洞","type":"treehole" },
      { "icon": "../../images/internship.png", "name": "兼职发布","type":"Parttime" },
      { "icon": "../../images/rent.png", "name": "租房信息","type":"rent" },
      { "icon": "../../images/saylove.png", "name": "情感倾诉","type":"talk" },
    ],
    hasUserInfo:false,
    pushStatus:false,
    showQr:false
  },
  click: function (e) {
    var that = this
    var index = e.detail.index
    var items = this.data.items
    var item = items[index]
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
    } else {
    //   wx.navigateTo({
    //     url: '../' + 'add' + item.type + '/' + 'adddetail'
    //   })
    wx.navigateTo({
        url: '../addPost/addPost?option=' + item.type
    })
    }
  },

  getQr() {
    var that = this
    wx.request({
        url: api.GetQRList,
        method:'GET',
        data: {
            campus:"beita"
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success (res) {
          that.setData({
            qrList:res.data.qrList,
            showQr:true
          })
          wx.setStorageSync('shownQr', true)
          console.log(res.data.qrList)
        }
      }) 
  },

  onClose() {
    this.setData({ showQr: false });
  },


  onSwiperTap: function(event) {
    var id = event.target.dataset.id;
    var that = this
    console.log(id)
    if (id == '../second/second' || id == '../find/find' || id == '../qr/qr') {
      wx.navigateTo({
        url: id,
      })
    }else if (id == '../treehole/treehole') {
      wx.switchTab({
        url: id,
      })
    } else if (id.indexOf('pages/detail') != -1) {
        wx.navigateTo({
          url: '/'+id,
        })
    } else if (id.indexOf('http://') != -1) {
      wx.previewImage({
        current: id,
        urls: id.split(),
      })
    } else if (id.indexOf('https://') != -1) {
        wx.navigateTo({
          url: '../webView/webView?id=' + id,
        })
    } else {
        wx.navigateToMiniProgram({
          appId: id,
          path: 'pages/index/index',
          extraData: {
            foo: 'bar'
          },
          envVersion: 'release',
          success(res) {
            // 打开成功
          }
        })
    }
  },
  /**
   * Lifecycle function--Called when page load
   */
  onShareAppMessage: function() {
		wx.showShareMenu({
	      withShareTicket: true,
	      menus: ['shareAppMessage', 'shareTimeline']
	    })
	},
	//用户点击右上角分享朋友圈
	onShareTimeline: function () {
		return {
	      title: '买卖二手，树洞北理，尽在北理贝塔驿站',
	      imageUrl: 'http://yqtech.ltd/treehole/timeline.jpg'
	    }
	},
  onLoad: function(options) {
    wx.showLoading({
        title: '加载中',
        mask: true,
      })
    var that = this
    console.log(options)
    if (options.data) {
      that.setData({
        currentTab:options.data
      })     
    }
    that.setData({
      noMore: false,
      tasks:[],
      height: wx.getSystemInfoSync().windowHeight,
      width: wx.getSystemInfoSync().windowWidth,
    })
    var old_data = that.data.tasks;
    var length = old_data.length
    var bannerList = wx.getStorageSync('bannerList1')
    var bannerListtime = wx.getStorageSync('bannerListtime1')
    var now = Date.parse(new Date());
    if (bannerList.length > 0 && (now - bannerListtime)/1000 < 60*60*24 ) {
        that.setData({
            bannerList:bannerList,
            showBanner:true
        })
    } else {
        wx.request({
            url: api.GetBanner,
            method:'GET',
            data: {
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success (res) {
              if (res.data.bannerList.length > 0) {
                that.setData({
                    bannerList:res.data.bannerList,
                    showBanner:true
                })
                wx.setStorageSync('bannerList1', res.data.bannerList)
                wx.setStorageSync('bannerListtime1', Date.parse(new Date()))
              } else {
                that.setData({
                    showBanner:false
                })
              }

            }
          })  
    }
    var e = that.data.currentTab
    var t = that.data.currentSmallTab
    var kuaishou = wx.getStorageSync('kuaishoutime')
    var now = Date.parse(new Date());
    // if (kuaishou == "" || (now - kuaishou)/1000 > 60*60*12) {
    //     wx.request({
    //         url: 'https://kl.haohuisheng555.cn/?channel=w03-12&callback=myfunc',
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
    //                 }
    //             })    
    //         }
    //     })
    // }
    console.log(e,t)
    this.getTaskInfo(e,t)
    var hotList = wx.getStorageSync('hotList')
    var hotListtime = wx.getStorageSync('hotListtime')
    var now = Date.parse(new Date());
    if (hotList.length > 0 && (now - hotListtime)/1000 < 60*60*4 ) {
        that.setData({
            hotList:hotList
        })
    } else {
        that.getHotList()
    }
    var shownQr = wx.getStorageSync('shownQr')
    // if (shownQr == "") {
    //     that.getQr()
    // } else {
    //     that.setData({
    //         showQr:false
    //     })
    //     var random = wx.getStorageSync('random')
    //     if (random == 1 && !that.data.showQr) {
    //         wx.showModal({
    //         title: '未设置头像与昵称',
    //         content: '请前往个人中心设置头像与昵称',
    //         complete: (res) => {
    //             if (res.confirm) {
    //             wx.navigateTo({
    //                 url: '../uitem/login/login',
    //             })
    //             }
    //         }
    //         })
    //     }
    // }
  },

  imgYu: function(event) {
    var urlList = []
    urlList = urlList.concat(event.currentTarget.dataset.id)
    wx.previewImage({
      urls: urlList,
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {

  },
  

  getHotList() {
    var that = this
    wx.request({
        url: api.GetHotTaskXiaoyuan,
        method:'GET',
        data: {
          length:10,
          campus:"beita",
          region:"beita",
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success (res) {
          console.log(res.data)
          that.setData({
              hotList:res.data.taskList
          })
          wx.setStorageSync('hotList', res.data.taskList)
          wx.setStorageSync('hotListtime', Date.parse(new Date()))
          console.log("hotlist:",that.data.hotList)
        },
      }) 
  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {
    var that = this
    that.selectComponent("#radial-menu").pop()
    var e = that.data.currentTab
    if ((wx.getStorageSync('avatarUrl') && wx.getStorageSync('userName')) || wx.getStorageSync('hasUserInfo')){
      this.setData({
        avatarUrl: wx.getStorageSync('avatarUrl'),
        userName:wx.getStorageSync('userName'),
        hasUserInfo: true
      }) 
    } else {
      this.setData({
        hasUserInfo: false
      })
    } 
    var t = that.data.currentSmallTab
    var tasks = wx.getStorageSync('tasks1')
    var taskstime = wx.getStorageSync('taskstime1')
    var now = Date.parse(new Date());
    console.log("diff:",(now - taskstime)/1000)
    if (tasks.length > 0 && (now - taskstime)/1000 < 60*60 ) {
        that.setData({
            tasks: tasks
        })
        wx.hideLoading()
    } else {
        this.getTaskInfo(e,t)
    }
  },

  getTaskInfo(e,t) {
    console.log(e,t)
    var that = this
    that.setData({
      noMore: false,
    })
    var old_data = that.data.tasks;
    var length = old_data.length
    if (e==0){
      var radio = ['radio1','radio2','radio3','radio5','radio6','radio7','radio10', 'radio11', 'radio12', 'radio13', 'radio14', 'radio15', 'radio16', 'radio17', 'radio18','radio20', 'radio19','radio21','rent','owner']
    } else if (e==1){
      var radio = ['radio10', 'radio11', 'radio12', 'radio13', 'radio14', 'radio15', 'radio16', 'radio17', 'radio18','radio20', 'radio19','radio21']
    } else if (e==2) {
      var radio = ['radio2','radio3']
    } else if (e==3){
      var radio = ['radio7']
    } else if (e==5){
      var radio = ['radio1','rent','owner']
    } else if (e==4){
      var radio = ['radio5']
    } else if (e==6){
      var radio = ['radio6']
    }
    wx.request({
      url: api.GettaskbyType,
      method:'GET',
      data: {
        length:length,
        radioGroup: radio,
        type:parseInt(t)+4
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        wx.hideLoading()
        wx.stopPullDownRefresh(); 
        var data = res.data.taskList
        for (var i in data){
          data[i].img = data[i].img.replace('[','').replace(']','').replace('\"','').replace('\"','').split(',')
        }
        that.setData({
          tasks: old_data.concat(data)
        })
        wx.setStorageSync('tasks1', old_data.concat(data))
        wx.setStorageSync('taskstime1', Date.parse(new Date()))
        if (res.data.taskList.length == 0) {
          that.setData({
            noMore: true
          })
        }
      },
    }) 
   

  },

  goToSection(e) {
    wx.navigateTo({
      url: '../' + e.target.dataset.id + '/' + e.target.dataset.id
    })
  },

  /**
   * 获取首页数据
   */

  goToStoryDetail(e) {
    wx.navigateTo({
      url: '../detail/detail?id=' + e.target.dataset.id
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
    wx.showLoading({
      title: '加载中，请稍后',
      mask: true,
    })
    this.setData({
      tasks: []
    })
    var e = this.data.currentTab
    var t = this.data.currentSmallTab
    console.log(e,t)
    this.getTaskInfo(e,t)
    this.setData({
      triggered: false,
    })
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {
    var that = this
    wx.showLoading({
      title: '加载中，请稍后',
      mask: true,
    })
    var e = that.data.currentTab
    var t = that.data.currentSmallTab
    this.getTaskInfo(e,t)
    if (that.data.noMore) {
      wx.showToast({
        title: '没有更多内容',
        icon: 'none'
      })
    }
  },
  // 搜索框右侧 事件
  addhandle() {
    var search_item = this.data.searchstr
    wx.navigateTo({
      url: '../search/search?search_item=' + search_item
    })
  },

  //搜索框输入时触发
  searchList(ev) {
    let e = ev.detail;
    this.setData({
      searchstr: e.detail.value.toString()
    })
  },

  //搜索回调
  endsearchList(e) {
  },
  // 取消搜索
  cancelsearch() {
    this.setData({
      searchstr: ''
    })
  },
  //清空搜索框
  activity_clear(e) {

    this.setData({
      searchstr: ''
    })
  },

  topNavChange: function(e) {
    var _this = this,nextActiveIndex = e.currentTarget.dataset.current,
      currentIndex = _this.data.currentTab;
    if (currentIndex != nextActiveIndex) {
      _this.setData({
        currentTab: nextActiveIndex,
        prevIndex: currentIndex
      });
      this.scrollTopNav()
    }
  },

  // swiperChange: function(e) {
  //   var prevIndex = this.data.currentTab,
  //     currentIndex = e;
  //   this.setData({
  //     currentTab: currentIndex
  //   });
  //   if (prevIndex != currentIndex) {
  //     this.setData({
  //       prevIndex: prevIndex
  //     });
  //   }
  //   this.scrollTopNav();
  // },

  scrollTopNav: function() {
    var _this =this
    // 当激活的当航小于4个时，不滚动
    if (_this.data.currentTab <= 2 && _this.data.scrollLeft >= 0) {
      _this.setData({
        scrollLeft: 0
      });
    } else {
      //当超过4个时，需要判断是向左还是向右滚动，然后做相应的处理
      var currentTab = _this.data.currentTab > _this.data.prevIndex ? _this.data.currentTab-_this.data.prevIndex : _this.data.prevIndex-_this.data.currentTab
      var plus = (_this.data.currentTab > _this.data.prevIndex ? 70 : -70)* currentTab;
      _this.setData({
        scrollLeft: _this.data.scrollLeft + plus
      });
    }
    _this.setData({
      tasks:[],
    });
    _this.getTaskInfo(_this.data.currentTab,_this.data.currentSmallTab)
  },

  onPageScroll: function (e) {//监听页面滚动
    let that = this;
    that.selectComponent("#radial-menu").pop()
    that.setData({
      top:e.scrollTop
    })
    console.log(that.data.top)
  },

  bottomNavChange: function(e) {
    var _this = this,nextActiveIndex = e.currentTarget.dataset.current,
      currentIndex = _this.data.currentSmallTab;
    if (currentIndex != nextActiveIndex) {
      _this.setData({
        currentSmallTab: nextActiveIndex,
        prevSmallIndex: currentIndex
      });
      console.log(_this.data.currentSmallTab)
      _this.setData({
        tasks:[],
      });
      _this.getTaskInfo(_this.data.currentTab,_this.data.currentSmallTab)
    }
  },



  /**
   * 
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  }
})