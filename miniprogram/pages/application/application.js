// pages/application/application.js 优化后版本
const app = getApp()
const api = require('../../config/api.js')
const token = require('../../utils/qntoken.js')
const qiniuUploader = require("../../utils/qiniuUploader_touxiang.js")
import Toast from '@vant/weapp/toast/toast'

Page({
  data: {
    fileListStudent: [],
    option1: [
      { text: '@bit.edu.cn', value: 0 }, { text: '@muc.edu.cn', value: 1 },
      { text: '@ruc.edu.cn', value: 3 }, { text: '@cnu.edu.cn', value: 4 },
      { text: '@btbu.edu.cn', value: 5 }, { text: '@bucm.edu.cn', value: 6 },
      { text: '@cude.edu.cn', value: 7 }, { text: '@uibe.edu.cn', value: 8 },
      { text: '@bfsu.edu.cn', value: 9 }, { text: '@mails.tsinghua.edu.cn', value: 10 },
      { text: '@pku.edu.cn', value: 11 }, { text: '@buaa.edu.cn', value: 12 },
      { text: '@bnu.edu.cn', value: 13 }, { text: '@cau.edu.cn', value: 14 },
      { text: '@bjtu.edu.cn', value: 15 }, { text: '@ustb.edu.cn', value: 16 },
      { text: '@cugb.edu.cn', value: 17 }, { text: '@bjfu.edu.cn', value: 18 },
      { text: '@butp.edu.cn', value: 19 }, { text: '@buct.edu.cn', value: 20 }
    ],
    value1: 0,
    snsMsgWait: 60,
    smsFlag: false,
    email: ""
  },

  onLoad() {
    wx.request({
      url: api.CheckVerifyUserQuanzi,
      method: 'GET',
      data: { openid: wx.getStorageSync('openid') },
      success: (res) => {
        const { code } = res.data
        if (code === "200") {
          wx.setStorageSync('isVerified', 1)
          Toast('已认证')
          wx.navigateBack()
        } else if (code === "0") {
          wx.setStorageSync('isVerified', 0)
          Toast('请耐心等待认证结果')
          wx.navigateBack()
        } else {
          wx.setStorageSync('isVerified', -1)
        }
      }
    })
  },

  onChangeName(e) { this.setData({ name: e.detail }) },
  onChangeWechat(e) { this.setData({ wechat: e.detail }) },
  onChangePhone(e) { this.setData({ phone: e.detail }) },
  onChangeCampus(e) { this.setData({ campus: e.detail }) },
  onChangeSchool(e) { this.setData({ school: e.detail }) },
  onChangeYear(e) { this.setData({ year: e.detail }) },
  onChangePassport(e) { this.setData({ passport: e.detail }) },
  onChangeEmail(e) { this.setData({ email: e.detail }) },
  onChangeCode(e) { this.setData({ code: e.detail }) },

  deleteImg(event) {
    const { index, name } = event.detail
    if (name === "student") {
      const fileListStudent = [...this.data.fileListStudent]
      fileListStudent.splice(index, 1)
      this.setData({ fileListStudent })
    }
  },

  afterRead(event) {
    const { file, name } = event.detail
    wx.showLoading({ title: '正在上传图片...', mask: true })
    wx.uploadFile({
      url: api.ImgCheck,
      filePath: file.url,
      name: 'file',
      header: { 'content-type': 'multipart/form-data' },
      success: (checkres) => {
        const res = JSON.parse(checkres.data)
        if (res.errmsg === "ok") {
          this.uploadCanvasImg(file.url, name)
        } else {
          wx.showToast({
            title: res.errcode === "40006" ? '图片太大！' : '图片违规！',
            icon: 'error'
          })
          wx.hideLoading()
        }
      }
    })
  },

  uploadCanvasImg(oriImg, name) {
    this.gettoken()
    this.uploadOri(oriImg, name)
  },

  gettoken() {
    const tokendata = {
      ak: 'wnkRCtmFWg7DZhCLjT72UOAT9WCdaI-TkPi8ncHr',
      sk: '_8ZESS4_ZA0fqCMekohRgyVbWT01C7qi12Xj2OM7',
      bkt: 'beifanggx',
      cdn: ''
    }
    this.setData({ uptoken: token.token(tokendata) })
  },

  uploadOri(path, name) {
    wx.showLoading({ title: '正在上传图片...', mask: true })
    qiniuUploader.upload(path,
      (res) => {
        const url = 'http://' + res.imageURL
        if (name === "student") {
          const fileListStudent = [...this.data.fileListStudent, { url }]
          this.setData({ fileListStudent })
        }
        wx.hideLoading()
      },
      (error) => {
        console.log('upload error: ', error)
        wx.hideLoading()
      }, {
        region: 'NCN',
        uptoken: this.data.uptoken,
        uploadURL: 'https://upload-z1.qiniup.com',
        domain: 'imgbf.yqtech.ltd'
      })
  },

  submitApplication() {
    const { fileListStudent } = this.data
    wx.requestSubscribeMessage({ tmplIds: [app.globalData.verify_template] })
    if (!fileListStudent.length) {
      return wx.showToast({ title: '请上传！', icon: 'none' })
    }
    wx.request({
      url: api.AddVerifyUserQuanzi,
      method: 'GET',
      data: {
        openid: app.globalData.openid,
        pic: fileListStudent[0].url,
        campus: "beita",
        email: ""
      },
      success: (res) => {
        if (res.data.code === "-1") {
          Toast.fail(res.data.msg)
        } else {
          Toast.success({
            message: '提交成功，等待审核！',
            duration: 2000,
            onClose: () => wx.setStorageSync('isVerified', 0)
          })
        }
      }
    })
  },

  sendEmail() {
    const { email, value1, option1 } = this.data
    if (!email) return wx.showToast({ title: '请填写邮箱！', icon: 'none' })
    Toast.loading({ message: '加载中...', forbidClick: true, loadingType: 'spinner' })
    const fullEmail = email + option1[value1].text
    const code = Math.random().toString().slice(-6)
    wx.setStorageSync('code', code)
    wx.setStorageSync('email', fullEmail)
    wx.request({
      url: api.SendEmailBeita,
      method: 'GET',
      data: { email: fullEmail, code },
      success: (res) => {
        wx.showToast({ title: '已发送！', icon: 'none' })
        const interval = setInterval(() => {
          const newTime = this.data.snsMsgWait - 1
          if (newTime < 0) {
            clearInterval(interval)
            this.setData({ smsFlag: false, snsMsgWait: 60 })
          } else {
            this.setData({ smsFlag: true, snsMsgWait: newTime })
          }
        }, 1000)
      }
    })
  },

  verify() {
    const code = wx.getStorageSync('code')
    const email = wx.getStorageSync('email')
    if (this.data.code !== code) return Toast.fail('验证码错误')

    Toast.loading({ message: '验证中...', forbidClick: true, loadingType: 'spinner' })
    wx.request({
      url: api.CheckEmailQuanzi,
      method: 'GET',
      data: { campus: "beita", email },
      success: (res) => {
        if (res.data.code === 200) {
          wx.request({
            url: api.AddVerifyUserQuanzi,
            method: 'GET',
            data: { openid: app.globalData.openid, pic: "", campus: "beita", email },
            success: () => {
              Toast.success('验证成功，欢迎来到贝塔驿站！')
              wx.setStorageSync('isVerified', 1)
            }
          })
        } else {
          Toast.fail('该邮箱不可重复认证')
        }
      }
    })
  },

  toGuide() {
    wx.navigateTo({
      url: '../webView/webView?id=https://mp.weixin.qq.com/s/7XhFxMw1OcDaRApjDvQ6hg'
    })
  },

  onReady() {},
  onShow() {},
  onHide() {},
  onUnload() {},
  onPullDownRefresh() {},
  onReachBottom() {},
  onShareAppMessage() {},

  imgYu() {
    wx.previewImage({
      urls: ['https://imgbf.yqtech.ltd/beita/qr/bitqr2.jpg']
    })
  }
})
