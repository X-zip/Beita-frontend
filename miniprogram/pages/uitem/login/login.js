// pages/uitem/login/login.js
var app = getApp();
const token = require('../../../utils/qntoken.js')
const qiniuUploader = require("../../../utils/qiniuUploader_touxiang.js");
const api = require('../../../config/api.js');
const {
    QINIU_CONFIG,
    SUBSCRIBE_TEMPLATE_IDS,
} = require('../../utils/constants_private.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        avatarUrl: "../../../images/unlogin.png",
        avatarList: ["http://yqtech.ltd/animal/d1.jpg",
                    "http://yqtech.ltd/animal/d2.jpg",
                    "http://yqtech.ltd/animal/d3.jpg",
                    "http://yqtech.ltd/animal/d4.jpg",],
        showSelect:false
    },

    getUserProfile: function(e) {
        console.log("value:",e.detail.value)
        wx.request({
            url: api.GetMember,
            method:'GET',
            data: {
              openid: app.globalData.openid,
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success (res) {
            //   console.log(res.data.memberList[0].au4)
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
            console.log(res.data)
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
        console.log(e.currentTarget.dataset.id)
        this.setData({
            selectId:e.currentTarget.dataset.id
        })
        wx.setStorageSync('avatarUrl', this.data.avatarList[e.currentTarget.dataset.id] )
      },
    
      onChooseAvatar(e) {
        this.gettoken()
        this.upload(e.detail.avatarUrl)
      },
    
      gettoken() {
        var tokendata = []
        tokendata.ak = QINIU_CONFIG.ak
        tokendata.sk = QINIU_CONFIG.sk,
        tokendata.bkt = QINIU_CONFIG.bkt
        tokendata.cdn = ''
        this.data.tokendata = tokendata
        var uptoken = token.token(tokendata)
        this.setData({
          uptoken: uptoken
        })
        //console.log('uptoken', uptoken, this.data.tokendata)
      },
    
      upload(e) {
        // await this.gettoken()//获取token需要用到 不用await记得吧async取消
        console.log(e) //传入的地址
        var that = this
        qiniuUploader.upload(
          e, //上传的图片
          (res) => { //回调 success
            console.log(res)
            let url = 'http://' + res.imageURL;      
            console.log("image:", url);
            wx.setStorageSync('avatarUrl', url )
            that.setData({
              avatarUrl: url,
            })
          },
          (error) => { //回调 fail
            console.log('error: ' + error);
          }, {
            // 参数设置  地区代码 token domain 和直传的链接 注意七牛四个不同地域的链接不一样，我使用的是华南地区
            region: 'NCN',
            // ECN, SCN, NCN, NA, ASG，分别对应七牛的：华东，华南，华北，北美，新加坡 5 个区域
            uptoken: that.data.uptoken, //上传凭证自己生成
            uploadURL: 'https://upload-z1.qiniup.com', //下面选你的区z2是华南的
            domain: 'imgbf.yqtech.ltd', //cdn域名建议直接写出来不然容易出异步问题如domain:‘你的cdn’
          },
          (progress) => {
          },
        )
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