// miniprogram/pages/announcementHistory/announcementHistory.js
const app = getApp();
const api = require("../../config/api");

Page({

  /**
   * 页面的初始数据
   */
  data: {
        announcements: [],
        showModal: false,
        currentAnnouncement: {},
        currentAnnouncementIndex: 0
    },

  /**
   * 生命周期函数--监听页面加载
   */
onLoad: function (options) {
        const that = this;
        const allAnnouncements = app.globalData.allAnnouncements || [];
        const unreadAnnouncements = app.globalData.unreadAnnouncements || [];

        // 历史公告页面不应自动弹窗，只显示所有公告
        that.setData({
            announcements: allAnnouncements,
            showModal: false
        });
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

    showAnnouncementDetail: function (e) {
        const index = e.currentTarget.dataset.index;
        const announcement = this.data.announcements[index];
        this.setData({
            currentAnnouncement: announcement,
            showModal: true
        });
    },

    hideModal: function () {
        const that = this;
        const announcements = that.data.announcements;
        let nextIndex = that.data.currentAnnouncementIndex + 1;
        
        // 先关闭当前弹窗
        that.setData({
            showModal: false
        });
        
        // 历史公告页面只关闭当前弹窗，不自动显示下一个，也不返回上一页
        // 用户可以手动点击其他公告查看详情
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})