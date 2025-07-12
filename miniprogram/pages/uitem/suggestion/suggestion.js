// pages/suggestion/suggestion.js

const api = require("../../../config/api");

//const app = getApp()
var app = getApp()

Page({

  /**
   * Page initial data
   */
  formSubmit: function(e) {
    //console.log(e.detail.value.Title.length + e.detail.value.Title.length + '  ' + e.detail.value.Wechat.length)
    if (e.detail.value.Content.length == 0) {
      wx.showToast({
        title: '请补全信息！',
        icon: 'none',
        duration: 1500
      })
    } else {
      var that = this;
      var id = that.data.id
      console.log('id'+id)
      wx.request({
        url: api.Suggestion,
        method:'GET',
        data: {
          content: e.detail.value,
          id:that.data.id,
          openid:app.globalData.openid
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success (res) {
          wx.navigateBack({
            delta: 0,
          })
          wx.showToast({
            title: '提交成功',
          })
        },
      })
    }
  },

  formReset: function() {
    console.log('form发生了reset事件')
  },

  data: {
    texts: "至少五个字。",
    task_data: [],
  },

  //监听组件事件，返回的结果


  inputs: function(e) {
    // 获取输入框的内容
    var value = e.detail.value;
    // 获取输入框内容的长度
    var len = parseInt(value.length);

    //最少字数限制
    if (len <= this.data.min)
      this.setData({
        texts: "至少5个字。"
      })
    else if (len > this.data.min)
      this.setData({
        texts: " "
      })

    //最多字数限制
    if (len > this.data.max) return;
    // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
    this.setData({
      currentWordNumber: len //当前字数  
    });
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    //new getApp().ToastPannel();
    console.log(options)
    if (options.id) {
      var id = options.id
    } else {
      var id = -1
    }
    this.setData({
      id:id
    })
  },


  markertap(e) {
    console.log(e)
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
  onPullDownRefresh: function() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  }
})