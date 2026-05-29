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
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this
    var UV = app.globalData.UV
    that.setData({
      ser_data: options.search_item,
      UV
    })
    wx.showLoading({
      title: '加载中',
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
        var data = res.data.taskList
        for (var i in data){
          data[i].img = data[i].img.replace('[','').replace(']','').replace('\"','').replace('\"','').split(',')
        }
        wx.hideLoading()
        that.setData({
          tasks: old_data.concat(data)
        })
      },
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
    wx.showLoading({
      title: '加载中，请稍后',
      mask: true,
    })
    this.setData({
      tasks: []
    })
    this.getTaskInfo()
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    wx.showLoading({
      title: '加载中，请稍后',
      mask: true,
    })
    this.getTaskInfo()
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  }
})