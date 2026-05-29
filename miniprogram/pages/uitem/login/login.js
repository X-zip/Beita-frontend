// pages/uitem/login/login.js
var app = getApp();
const qiniuUploader = require("../../../utils/qiniuUploader_touxiang.js");
const api = require('../../../config/api.js');
const session = require('../../../utils/session.js')
const uploadCredential = require('../../../utils/uploadCredential.js')
const {
    SUBSCRIBE_TEMPLATE_IDS,
} = require('../../../utils/constants_private.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        avatarUrl: "../../../images/unlogin.png",
        avatarList: ["https://yqtech.ltd/animal/d1.jpg",
                    "https://yqtech.ltd/animal/d2.jpg",
                    "https://yqtech.ltd/animal/d3.jpg",
                    "https://yqtech.ltd/animal/d4.jpg",],
        showSelect:false
    },

    getUserProfile: function(e) {
        wx.request({
            url: api.GetMember,
            method:'GET',
            data: {
              openid: app.globalData.openid,
            },
            header: session.authHeader({ 'content-type': 'application/json' }),
            success (res) {
                if (res.data.memberList.length > 0) {
                    if (res.data.memberList[0].au4 > 0) {
                    wx.setStorageSync('isdel', true)
                    } else {
                    wx.setStorageSync('isdel', false)
                    }
                } else {
                    wx.setStorageSync('isdel', false)
                }
            },
        })
        wx.requestSubscribeMessage({
          tmplIds: [SUBSCRIBE_TEMPLATE_IDS],
          success(res) {
            if (wx.getStorageSync('subNum')) {
              var num = Number(wx.getStorageSync('subNum'))
              num += 1
              wx.setStorageSync('subNum', num)
            } else {
              wx.setStorageSync('subNum', 1)
            }
          }
        })
        if (e.detail.value.nickname == "") {
            wx.showToast({
                title: '请设置昵称！',
                duration: 2000,
                mask: true,
                icon: 'none',
            })
        } else if (!wx.getStorageSync('avatarUrl')) {
            wx.showToast({
                title: '请选择或上传头像！',
                duration: 2000,
                mask: true,
                icon: 'none',
            })
            this.setData({
                showSelect: true
            })
        } else {
            wx.showToast({
                title: '设置成功！',
                duration: 2000,
                mask: true,
            })
            wx.setStorageSync('userName', e.detail.value.nickname)
            wx.setStorageSync('hasUserInfo', true)
            wx.setStorageSync('random', 0)
            wx.switchTab({
                url: '../../usercenter/usercenter',
            })
        }

      },

      selectAvatar(e){
        this.setData({
            selectId:e.currentTarget.dataset.id
        })
        wx.setStorageSync('avatarUrl', this.data.avatarList[e.currentTarget.dataset.id] )
      },

      onChooseAvatar(e) {
        this.upload(e.detail.avatarUrl)
      },

      upload(e) {
        var that = this
        uploadCredential.getUploadCredential('avatar', e).then(credential => {
          qiniuUploader.upload(
            e,
            (res) => {
              let url = uploadCredential.normalizeImageUrl(res.imageURL);
              wx.setStorageSync('avatarUrl', url )
              that.setData({
                avatarUrl: url,
              })
            },
            (error) => {
              wx.showToast({
                title: '上传失败',
                icon: 'none'
              })
            },
            uploadCredential.qiniuOptions(credential),
            (progress) => {
            },
          )
        }).catch(() => {
          wx.showToast({
            title: '上传失败',
            icon: 'none'
          })
        })
      },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

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
