// pages/my_like/my_like.js
var app = getApp();
const api = require('../../../config/api.js');
var CryptoJS = require('../../../utils/aes.js')
const session = require('../../../utils/session.js')
const {
    AES_KEY,
    AES_IV,
    QINIU_CONFIG,
    SUBSCRIBE_TEMPLATE_IDS,
} = require('../../../utils/constants_private.js');

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
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    tasks: [],
    noMore:false,
    initialLoading: false,
    loadingMore: false,
    skeletonRows: [1, 2, 3]
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
      tasks: [],
      noMore: false,
      initialLoading: true,
      loadingMore: false
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
      header: session.authHeader({ 'content-type': 'application/json' }),
      success (res) {
        if (res.data.likeList.length == 0) {
          that.setData({
            noMore: true,
            initialLoading: false,
            loadingMore: false
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
        const dataToEncrypt = { verify: 'zzyq', c_time: new Date() }
        const encrypted = encryptContent(dataToEncrypt)
        for (let i = 0; i < pk_list.length; i++) {
          wx.request({
            url: api.GettaskbyId,
            method:'GET',
            data: {
              pk: pk_list[i],
              encrypted,
              c_time: new Date(),
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success (res) {
              var tasks = that.data.tasks
              var task=res.data.taskList
              that.setData({
                tasks: tasks.concat(task),
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
        }
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
  onShareAppMessage: function() {

  }
})
