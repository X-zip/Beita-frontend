// pages/search/search.js
var app = getApp();
var api = require('../../config/api.js');
const CryptoJS = require('../../utils/aes.js')
const {
    AES_KEY,
    AES_IV,
    QINIU_CONFIG,
    SUBSCRIBE_TEMPLATE_IDS,
    MAX_IMAGE_COUNT,
} = require('../../utils/constants_private.js');
function encryptContent(contentObj) {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(contentObj), AES_KEY, {
      iv: AES_IV,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })
    return encrypted.ciphertext.toString().toUpperCase()
}
Page({

  /**
   * Page initial data
   */
  data: {
    tasks: [],
    noMore: false,
    initialLoading: false,
    loadingMore: false,
    skeletonRows: [1, 2, 3]
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this
    var UV = app.globalData.UV
    that.setData({
      ser_data: options.search_item,
      UV,
      initialLoading: true,
      loadingMore: false,
      noMore: false
    })
    that.getTaskInfo()
  },

  getTaskInfo() {
    var that = this
    var search = that.data.ser_data
    var old_data = that.data.tasks;
    var length = old_data.length
    const dataToEncrypt = { verify: 'zzyq', c_time: new Date() }
    const encrypted = encryptContent(dataToEncrypt)
    wx.request({
      url: api.GettaskbySearch,
      method:'GET',
      data: {
        search:search,
        length: parseInt(length),
        encrypted:encrypted,
        c_time: new Date(),
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
    //   header: { "Content-Type": "application/x-www-form-urlencoded" },
      success (res) {
        var data = (res.data && res.data.taskList) || []
        for (var i in data){
          data[i].img = data[i].img.replace('[','').replace(']','').replace('\"','').replace('\"','').split(',')
        }
        wx.hideLoading()
        if (data.length == 0) {
          that.setData({ noMore: true })
        }
        that.setData({
          tasks: old_data.concat(data),
          initialLoading: false,
          loadingMore: false
        })
      },
      fail () {
        that.setData({
          initialLoading: false,
          loadingMore: false
        })
      }
    })
  },


  goToStoryDetail(e) {
    wx.navigateTo({
      url: '../detail/detail?id=' + e.target.dataset.id
    })
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
  onPullDownRefresh: function () {
    this.setData({
      tasks: [],
      noMore: false,
      initialLoading: true,
      loadingMore: false
    })
    this.getTaskInfo()
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    if (this.data.noMore) {
      wx.showToast({
        title: '没有更多内容',
        icon: 'none'
      })
      return
    }
    if (this.data.loadingMore || this.data.initialLoading) {
      return
    }
    this.setData({ loadingMore: true })
    this.getTaskInfo()
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  }
})
