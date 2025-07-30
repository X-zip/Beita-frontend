var app = getApp();
var api = require('../../config/api.js');
Page({

  /**
   * Page initial data
   */
  data: {
    tasks: [],
    lastId: 9999999,
    hidden: true,
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1200,
    showBanner:true,
    addflag: true, //判断是否显示搜索框右侧部分
    addimg: '../../images/search_icon.png',
    closeimg: '../../images/close.png',
    menu: {
      descs: [
        '全部',
        '吐槽',
        '倾诉',
        '心愿',
        '知乎',
      ],
    name:[
      'all',
      'talk',
      'love',
      'hope',
      'ask'
    ]},
    sub_menu: {
      descs: [
        '新发',
        '新回',
        '最热',
        '精选',
      ],
    name:[
      'send',
      'comment',
      'choose',
      'hot',
    ]},
    top:0,
    currentTab: 0,
    currentSmallTab: 0,
    colorArr: ['rgba(53, 208, 242, 0.85)','rgba(228, 169, 138, 0.9)','rgba(228, 113, 17, 0.85)','rgba(169, 36, 144, 0.85)'],
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
    hasUserInfo:false
  },

  /**
   * Lifecycle function--Called when page load
   */

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

  onLoad: function (options) {
    wx.showLoading({
        title: '加载中',
        mask: true,
      })
    var that = this
    that.setData({
      noMore: false,
      tasks:[],
      lastId:9999999,
      height: wx.getSystemInfoSync().windowHeight,
      width: wx.getSystemInfoSync().windowWidth
    })
    var bannerList = wx.getStorageSync('bannerList1')
    var bannerListtime = wx.getStorageSync('bannerListtime1')
    var now = Date.parse(new Date());
    if (bannerList.length > 0 && (now - bannerListtime)/1000 < 60*60*24 ) {
        that.setData({
            bannerList:bannerList
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
              that.setData({
                bannerList:res.data.bannerList
              })
              wx.setStorageSync('bannerList1', res.data.bannerList)
              wx.setStorageSync('bannerListtime1', Date.parse(new Date()))
            }
        })  
    }
    var e = that.data.currentTab
    var t = that.data.currentSmallTab
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
  },

  goHotList(){
    wx.navigateTo({
      url: '../hotList/hotList',
    })
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

  getTaskInfo(e,t) {
    var that = this
    var old_data = that.data.tasks;
    console.log(e,t)
    var that = this
    that.setData({
      noMore: false,
    })
    var radio = ['radio4','radio40','radio41','radio42','radio43']
    if (e==1){
      radio = ['radio4','radio40']
    } else if (e==2) {
      radio = ['radio41']
    } else if (e==3) {
      radio = ['radio42']
    } else if (e==4) {
      radio = ['radio43']
    } 
    // var length = old_data.length
    var cursor = that.data.lastId;
    console.log("type",parseInt(t))
    console.log("radio",radio)
    wx.request({
      url: api.GettaskbyType,
      method:'GET',
      data: {
        length:cursor,
        radioGroup: radio,
        type:parseInt(t)
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        wx.stopPullDownRefresh(); 
        var data = res.data.taskList
        for (var i in data){
          data[i].img = data[i].img.replace('[','').replace(']','').replace('\"','').replace('\"','').split(',')
        }
        console.log("lastId:", data[data.length - 1].id)
        if (data.length > 0) {
          that.setData({ lastId: data[data.length - 1].id });
        } else {
          // 没有新数据，标记为无更多
          that.setData({ noMore: true });
        }
        console.log(data)
        wx.hideLoading()
        that.setData({
          tasks: old_data.concat(data)
        })
        wx.setStorageSync('tasks2', old_data.concat(data))
        wx.setStorageSync('taskstime2', Date.parse(new Date()))
        if (res.data.taskList.length == 0) {
          that.setData({
            noMore: true
          })
        }
      },
    })
  },


  goToStoryDetail(e) {
    console.log("e.target.dataset" + JSON.stringify(e.target.dataset))
    wx.navigateTo({
      url: '../detail/detail?id=' + e.target.dataset.id
    })
  },


  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
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
    var tasks = wx.getStorageSync('tasks2')
    var taskstime = wx.getStorageSync('taskstime2')
    console.log("tasks2:",tasks.length)
    console.log("taskstime:",taskstime)
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

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

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
        lastId:9999999,
      });
      _this.getTaskInfo(_this.data.currentTab,_this.data.currentSmallTab)
    }
  },

  
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
      lastId:9999999
    });
    _this.getTaskInfo(_this.data.currentTab,_this.data.currentSmallTab)
  },

  onPageScroll: function (e) {//监听页面滚动
    let that = this;
    that.selectComponent("#radial-menu").pop()
    that.setData({
      top:e.scrollTop
    })
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
      tasks: [],
      lastId:9999999
    })
    var e = this.data.currentTab
    var t = this.data.currentSmallTab
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
  goToSection(e) {
    console.log("e.target.dataset" + JSON.stringify(e.target.dataset))
    wx.navigateTo({
      url: '../addtreehole/adddetail'
    })
  },

  nologin() {
    wx.showModal({
      title: '未登录！',
      content: '未登录时只能浏览内容而无法发布，请前往个人中心点击登录按钮进行授权登录。',
      confirmText: '知道了',
    })
  },

  // 搜索框右侧 事件
  addhandle() {
    console.log('触发搜索框右侧事件')
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
    console.log('查询数据')
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

  onSwiperTap: function(event) {
    var id = event.target.dataset.id;
    console.log(id)
    if (id == '../second/second' || id == '../find/find' || id == '../qr/qr') {
      wx.navigateTo({
        url: id,
      })
    }else if (id == '../treehole/treehole') {
      wx.switchTab({
        url: id,
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
   * Called when user click on the top right corner to share
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
})