const api = require("../../../config/api");
const session = require('../../../utils/session.js')
const apiCompat = require('../../../utils/apiCompat.js')

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tasks: [],
    noMore: false,
    initialLoading: false,
    loadingMore: false,
    skeletonRows: [1, 2, 3]
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
      tasks: [],
      noMore: false,
      initialLoading: true,
      loadingMore: false
    })
    this.getTaskInfo()
  },

  getTaskInfo() {
    var that = this
    var old_data = that.data.tasks;
    var length = old_data.length
    wx.request({
      url: api.GetCommentByOpenid,
      method:'GET',
      data: {
        openid: app.globalData.openid,
        length: parseInt(length),
      },
      header: session.authHeader({ 'content-type': 'application/json' }),
      success (res) {
        var data = (res.data && res.data.commentList) || []
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
