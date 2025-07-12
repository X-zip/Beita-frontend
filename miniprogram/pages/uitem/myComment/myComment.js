const api = require("../../../config/api");

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tasks: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this
    wx.showModal({
      title:'提示',
      content:'长按可删除您的评论',
      showCancel:false
    })
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      
    }
  },

  goToStoryDetail(e) {
    if (this.endTime - this.startTime < 350) {
      console.log("e.target.dataset" + JSON.stringify(e.target.dataset))
      wx.navigateTo({
        url: '../../detail/detail?id=' + e.target.dataset.detail
      })
    }
  },

  bindTouchStart: function (e) {
    this.startTime = e.timeStamp;
  },

  bindTouchEnd: function (e) {
    this.endTime = e.timeStamp;
  },

  delete_detail(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function (sm) {
        if (sm.confirm) {
          // 用户点击了确定 可以调用删除方法了  
          console.log(e.target.dataset.id)
          var pk = e.target.dataset.id
          const db = wx.cloud.database()
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
          console.log('用户点击取消')
        }
      }
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
    var that=this
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
      url: api.GetCommentByOpenid,
      method:'GET',
      data: {
        openid: app.globalData.openid,
        length: parseInt(length),
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        console.log("comment:",res.data)
        that.setData({
          tasks: old_data.concat(res.data.commentList)
        })
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
    this.setData({
      tasks: []
    })
    this.getTaskInfo()
  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    this.getTaskInfo()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})