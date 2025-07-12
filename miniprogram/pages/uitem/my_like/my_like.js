// pages/my_like/my_like.js
var app = getApp();
const api = require('../../../config/api.js');
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
  onLoad: function() {
    var that = this
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
      url: '../../detail/detail?id=' + e.target.dataset.id
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  onShow: function() {
    var that = this
    that.setData({
      tasks: []
    })
    that.getTaskInfo()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  getTaskInfo: function() {
    var that = this
    var pk_list = []
    var task_list = []
    var openid = app.globalData.openid
    var old_data = that.data.tasks;
    var length = old_data.length
    wx.request({
      url: api.GetlikeByOpenid,
      method:'GET',
      data: {
        openid: openid,
        length:length
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        console.log(res)
        if (res.data.likeList.length == 0) {
          that.setData({
            noMore: true
          })
          wx.showToast({
            title: '没有更多内容',
            icon: 'none'
          })
        }
        wx.hideLoading()
        for (let i = 0; i < res.data.likeList.length; i++) {
          pk_list[i] = res.data.likeList[i].pk
        }
        for (let i = 0; i < pk_list.length; i++) { 
          wx.request({
            url: api.GettaskbyId,
            method:'GET',
            data: {
              pk: pk_list[i]
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success (res) {
              var tasks = that.data.tasks
              var task=res.data.taskList
              that.setData({
                tasks: tasks.concat(task)
              })
              
            },
          })
        }
      },
    })

  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
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
  onShareAppMessage: function() {

  }
})