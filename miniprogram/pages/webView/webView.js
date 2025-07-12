// pages/webView/webView.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var that= this
    that.setData({
      src:options.id
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

  },

  onShareAppMessage: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
},
//用户点击右上角分享朋友圈
onShareTimeline: function () {
    return {
      title: '买卖二手，树洞北理，尽在北理贝塔驿站',
      imageUrl: 'http://yqtech.ltd/treehole/timeline.jpg'
    }
},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})