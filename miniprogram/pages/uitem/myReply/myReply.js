const api = require("../../../config/api");

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tasks: [],
    noMore:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    if (wx.getStorageSync('avatarUrl') && wx.getStorageSync('userName')){
        this.setData({
          avatarUrl: wx.getStorageSync('avatarUrl'),
          userName:wx.getStorageSync('userName'),
          hasUserInfo: true
        }) 
    }
  },

  goToStoryDetail(e) {
    console.log("e.target.dataset" + JSON.stringify(e.target.dataset))
    wx.navigateTo({
      url: '../../detail/detail?id=' + e.target.dataset.detail
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
    that.setData({
      tasks: []
    })
    this.getTaskInfo()
  },

  getTaskInfo() {
    var that = this
    var old_data = that.data.tasks;
    var length = old_data.length
    console.log(length)
    wx.request({
      url: api.GetCommentByApplyto,
      method:'GET',
      data: {
        applyTo: app.globalData.openid,
        length: parseInt(length),
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        console.log("reply:",res.data)
        wx.hideLoading()
        that.setData({
          tasks: old_data.concat(res.data.commentList)
        })
        if (res.data.commentList.length == 0) {
          that.setData({
            noMore: true
          })
          wx.showToast({
            title: '没有更多内容',
            icon: 'none'
          })
        }
      },
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
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
    if (this.data.noMore) {
      wx.showToast({
        title: '没有更多内容',
        icon: 'none'
      })
    } 
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})