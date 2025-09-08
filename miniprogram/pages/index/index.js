// pages/index/index.js
var app = getApp();
var api = require('../../config/api.js');

Page({
  data: {
    notice: [
      { title: '重要提示：请允许向您推送订阅消息，否则您无法接收评论提醒' },
    ],
    noMore: false,
    tasks: [],
    hidden: true,

    // 搜索框相关
    addflag: true,
    addimg: '../../images/search_icon.png',
    closeimg: '../../images/close.png',
    moreimg: '../../images/more.png',
    searchstr: '',

    // 滚动、导航
    scrollLeft: 0,
    prevIndex: -1,
    triggered: false,

    // 公告弹窗
    unreadAnnouncements: [],
    currentAnnouncementIndex: 0,
    showAnnouncementModal: false,

    // 菜单
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
      descs: ['全部内容', '二手市场', '失物寻物', '打听求助', '兼职发布', '租房信息', '情感倾诉'],
      name: ['all', 'second', 'find', 'help', 'parttime', 'rent', 'love'],
    },
    sub_menu: { descs: ['全部校区', '中关村', '良乡', '珠海'], name: ['2', '1', '0', '3'] },

    currentTab: 0,
    currentSmallTab: 0,

    // 轮播图
    imgUrls: [
      'http://yqtech.ltd/bit_titlesecond_title.jpg',
      'http://yqtech.ltd/bit_titlefind_title.png',
      'http://yqtech.ltd/treehole/treehole.png',
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 3600,
    duration: 500,

    scrollTop: 0,
    showBanner: false,
    scrollValue: 280,
    top: 0,

    // 全局导航参数
    navBarHeight: app.globalData.navBarHeight,
    menuBotton: app.globalData.menuBotton,
    menuHeight: app.globalData.menuHeight,
    menuRight: app.globalData.menuRight,
    menuWidth: app.globalData.menuWidth,
    bottomEdge: app.globalData.bottomEdge,

    // 功能入口 items
    items: [
      { icon: '../../images/second_hand.png', name: '二手市场', type: 'second' },
      { icon: '../../images/find.png', name: '失物寻物', type: 'Find' },
      { icon: '../../images/help.png', name: '打听求助', type: 'Help' },
      { icon: '../../images/treehole.png', name: '北理树洞', type: 'treehole' },
      { icon: '../../images/internship.png', name: '兼职发布', type: 'Parttime' },
      { icon: '../../images/rent.png', name: '租房信息', type: 'rent' },
      { icon: '../../images/saylove.png', name: '情感倾诉', type: 'talk' },
    ],

    hasUserInfo: false,
    pushStatus: false,
    showQr: false,
  },

  /** 页面加载 **/
  onLoad: function (options) {
    wx.showLoading({ title: '加载中', mask: true });

    this.setData({
      noMore: false,
      tasks: [],
      height: wx.getSystemInfoSync().windowHeight,
      width: wx.getSystemInfoSync().windowWidth,
    });

    // banner 缓存
    var bannerList = wx.getStorageSync('bannerList1') || [];
    var bannerListtime = wx.getStorageSync('bannerListtime1') || 0;
    var now = Date.parse(new Date());
    if (bannerList.length > 0 && (now - bannerListtime) / 1000 < 60 * 60 * 24) {
      this.setData({ bannerList: bannerList, showBanner: true });
    } else {
      wx.request({
        url: api.GetBanner,
        method: 'GET',
        success: (res) => {
          if (res.data.bannerList.length > 0) {
            this.setData({ bannerList: res.data.bannerList, showBanner: true });
            wx.setStorageSync('bannerList1', res.data.bannerList);
            wx.setStorageSync('bannerListtime1', Date.parse(new Date()));
          } else {
            this.setData({ showBanner: false });
          }
        },
      });
    }

    // 加载任务
    this.getTaskInfo(this.data.currentTab, this.data.currentSmallTab);

    // hotList 缓存
    var hotList = wx.getStorageSync('hotList') || [];
    var hotListtime = wx.getStorageSync('hotListtime') || 0;
    if (hotList.length > 0 && (now - hotListtime) / 1000 < 60 * 60 * 4) {
      this.setData({ hotList: hotList });
    } else {
      this.getHotList();
    }

        const app = getApp();

        const showModal = () => {
            if (app.globalData.shouldShowAnnouncementModal && app.globalData.unreadAnnouncements.length > 0) {
                this.setData({
                    showAnnouncementModal: true,
                    unreadAnnouncements: app.globalData.unreadAnnouncements,
                    currentAnnouncementIndex: 0
                });
                app.globalData.shouldShowAnnouncementModal = false;
            }
        };

        if (app.globalData.allAnnouncements && app.globalData.allAnnouncements.length > 0) {
            // 如果数据已经加载，直接显示
            showModal();
        } else {
            // 如果数据未加载，注册回调
            app.announcementDataReadyCallback = showModal;
        }
  },

  /** 页面显示 **/
  onShow: function () {
    this.selectComponent('#radial-menu')?.pop();
  },

  /** 点击分类 **/
  click: function (e) {
    var index = e.detail.index;
    var item = this.data.items[index];
    var isVerified = wx.getStorageSync('isVerified');

    if (isVerified != 1) {
      wx.showModal({
        title: '未认证！',
        content: '请前往个人中心进行校园认证。',
        success(res) {
          if (res.confirm) wx.navigateTo({ url: '../usercenter/usercenter' });
        },
      });
    } else {
      wx.navigateTo({ url: '../addPost/addPost?option=' + item.type });
    }
  },

  /** 公告弹窗逻辑 **/
  closeAnnouncementModal() {
    this.setData({ showAnnouncementModal: false });
    if (this.data.unreadAnnouncements.length > 0) {
      let latestId = this.data.unreadAnnouncements[this.data.unreadAnnouncements.length - 1].id;
      wx.setStorageSync('last_notice_id', latestId);
    }
  },

  showNextAnnouncement() {
    const { currentAnnouncementIndex, unreadAnnouncements } = this.data;
    if (currentAnnouncementIndex < unreadAnnouncements.length - 1) {
      this.setData({ currentAnnouncementIndex: currentAnnouncementIndex + 1 });
    } else {
      this.closeAnnouncementModal();
    }
  },

  /** 获取任务 **/
  getTaskInfo(e, t) {
    var that = this;
    that.setData({ noMore: false });
    var old_data = that.data.tasks;

    var radio = [];
    if (e == 0) radio = ['radio1', 'radio2', 'radio3', 'radio5', 'radio6', 'radio7', 'radio10'];
    else if (e == 1) radio = ['radio10', 'radio11', 'radio12'];
    else if (e == 2) radio = ['radio2', 'radio3'];

    wx.request({
      url: api.GettaskbyType,
      method: 'GET',
      data: { length: 100, radioGroup: radio, type: parseInt(t) + 4 },
      header: { 'content-type': 'application/json' },
      success(res) {
        wx.hideLoading();
        wx.stopPullDownRefresh();

        var data = res.data.taskList || [];
        data.forEach(d => { d.img = d.img.replace('[', '').replace(']', '').replace(/\"/g, '').split(','); });

        that.setData({ tasks: old_data.concat(data) });
        wx.setStorageSync('tasks1', old_data.concat(data));
        wx.setStorageSync('taskstime1', Date.parse(new Date()));

        if (res.data.taskList.length == 0) that.setData({ noMore: true });
      },
    });
  },

  /** 获取热门任务 **/
  getHotList() {
    var that = this;
    wx.request({
      url: api.GetHotTaskXiaoyuan,
      method: 'GET',
      data: { length: 10, campus: 'beita', region: 'beita' },
      header: { 'content-type': 'application/json' },
      success(res) {
        that.setData({ hotList: res.data.taskList });
        wx.setStorageSync('hotList', res.data.taskList);
        wx.setStorageSync('hotListtime', Date.parse(new Date()));
      },
    });
  },

  /** 轮播图点击 **/
  onSwiperTap(event) {
    var id = event.target.dataset.id;
    if (id.includes('pages/detail') || id.includes('http')) return;
    wx.navigateTo({ url: id });
  },

  /** 页面滚动 **/
  onPageScroll(e) {
    this.setData({ top: e.scrollTop });
  },

  /** 下拉刷新 **/
  onPullDownRefresh() {
    this.setData({ tasks: [] });
    this.getTaskInfo(this.data.currentTab, this.data.currentSmallTab);
    this.setData({ triggered: false });
  },

  /** 触底加载更多 **/
  onReachBottom() {
    if (!this.data.noMore) this.getTaskInfo(this.data.currentTab, this.data.currentSmallTab);
    else wx.showToast({ title: '没有更多内容', icon: 'none' });
  },

  /** 搜索相关 **/
  addhandle() { wx.navigateTo({ url: '../search/search?search_item=' + this.data.searchstr }); },
  searchList(ev) { this.setData({ searchstr: ev.detail.value.toString() }); },
  cancelsearch() { this.setData({ searchstr: '' }); },
  activity_clear() { this.setData({ searchstr: '' }); },

  /** 分享 **/
  onShareAppMessage() { wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] }); },
  onShareTimeline() { return { title: '买卖二手，树洞北理，尽在北理贝塔驿站', imageUrl: 'http://yqtech.ltd/treehole/timeline.jpg' }; },
});
