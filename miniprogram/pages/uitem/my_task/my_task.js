// pages/my_task/my_task.js
var app = getApp();
var api = require('../../../config/api.js');
var CryptoJS = require('../../../utils/aes.js')
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
    wx.showModal({
      title:'提示',
      content:'长按可删除您的帖子',
      showCancel:false
    })
    if (wx.getStorageSync('avatarUrl') && wx.getStorageSync('userName')){
        this.setData({
          avatarUrl: wx.getStorageSync('avatarUrl'),
          userName:wx.getStorageSync('userName'),
          hasUserInfo: true
        }) 
    }
  },

  goToStoryDetail(e) {
    if (this.endTime - this.startTime < 350) {
      console.log("e.target.dataset" + JSON.stringify(e.target.dataset))
      wx.navigateTo({
        url: '../../detail/detail?id=' + e.target.dataset.id
      })
    }
  },

  bindTouchStart: function(e) {
    this.startTime = e.timeStamp;
  },

  bindTouchEnd: function(e) {
    this.endTime = e.timeStamp;
  },

  delete_detail(e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function(sm) {
        if (sm.confirm) {
          // 用户点击了确定 可以调用删除方法了  
          console.log(e.target)
          var pk = e.target.dataset.id
          var key = '1234512345123456';
          var iv = '1234512345123456';
          key = CryptoJS.enc.Utf8.parse(key);
          iv = CryptoJS.enc.Utf8.parse(iv);
          var param = '{"id":"'+pk+'"}'
          var encrypted = CryptoJS.AES.encrypt(param, key, {
            iv: iv,
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
          });
          encrypted = encrypted.ciphertext.toString().toUpperCase();  
          wx.request({
            url: api.DeleteTask,
            method:'GET',
            data: {
              pk:encrypted
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success (res) {
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
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    that.setData({
      tasks: []
    })
    that.getTaskInfo()
  },

  getTaskInfo() {
    var that = this
    var old_data = that.data.tasks;
    var length = old_data.length
    wx.request({
      url: api.GettaskbyOpenId,
      method:'GET',
      data: {
        openid: app.globalData.openid,
        length: parseInt(length),
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        var data = res.data.taskList
        for (var i in data){
          data[i].img = data[i].img.replace('[','').replace(']','').replace('\"','').replace('\"','').split(',')
        }
        console.log(data)
        wx.hideLoading()
        that.setData({
          tasks: old_data.concat(data)
        })
        if (res.data.taskList.length == 0) {
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
  onShareAppMessage: function() {

  }
})