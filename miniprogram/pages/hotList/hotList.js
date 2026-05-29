// pages/hotList/hotList.js
var app = getApp();
var api = require('../../config/api.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      var UV = app.globalData.UV
      var that = this
      var hotList = wx.getStorageSync('hotList')
      for (var i in hotList){
          hotList[i].img = hotList[i].img.replace('[','').replace(']','').replace('\"','').replace('\"','').split(',')
      }
      that.setData({
          tasks:hotList,
          UV:UV
      })
    },

    goToStoryDetail(e) {
      wx.navigateTo({
        url: '../detail/detail?id=' + e.currentTarget.dataset.id
      })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
  })