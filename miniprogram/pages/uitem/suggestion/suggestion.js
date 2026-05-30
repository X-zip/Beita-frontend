// pages/suggestion/suggestion.js

const api = require("../../../config/api");
const session = require('../../../utils/session.js')
const apiCompat = require('../../../utils/apiCompat.js')

const app = getApp()

const reportReasons = [
  { code: 'spam', title: '垃圾广告' },
  { code: 'fraud', title: '诈骗引流' },
  { code: 'harassment', title: '辱骂骚扰' },
  { code: 'sexual', title: '色情低俗' },
  { code: 'illegal', title: '违法违规' },
  { code: 'privacy', title: '隐私泄露' },
  { code: 'false_info', title: '虚假信息' },
  { code: 'off_topic', title: '与校园无关' },
  { code: 'other', title: '其他' },
]

Page({
  data: {
    id: -1,
    isReport: false,
    selectedReason: reportReasons[0].code,
    reportReasons,
    texts: "至少5个字。",
    currentWordNumber: 0,
    min: 5,
    max: 500,
  },

  formSubmit: function(e) {
    const content = ((e.detail.value && e.detail.value.Content) || '').trim()
    if (!this.data.isReport && content.length === 0) {
      wx.showToast({
        title: '请补充信息',
        icon: 'none',
        duration: 1500
      })
      return
    }

    if (this.data.isReport) {
      this.submitReport(content)
    } else {
      this.submitSuggestion(content)
    }
  },

  submitReport: function(content) {
    const openid = app.globalData.openid || wx.getStorageSync('openid') || ''
    wx.request({
      url: api.ReportCreate,
      method: 'POST',
      data: {
        targetType: 'task',
        targetId: String(this.data.id),
        reporterOpenid: openid,
        reporterUnionid: wx.getStorageSync('unionid') || '',
        reasonCode: this.data.selectedReason,
        reasonText: content,
        evidenceUrls: [],
        source: 'miniprogram'
      },
      header: session.authHeader({ 'content-type': 'application/json' }),
      success: (res) => {
        const code = res.data && Number(res.data.code)
        if (code === 0 || code === 200) {
          this.finishSubmit('举报已提交')
        } else {
          this.submitSuggestion(content)
        }
      },
      fail: () => {
        this.submitSuggestion(content)
      }
    })
  },

  submitSuggestion: function(content) {
    const openid = app.globalData.openid || wx.getStorageSync('openid') || ''
    wx.request({
      url: api.Suggestion,
      method: 'GET',
      data: {
        content,
        id: this.data.id,
        openid
      },
      header: session.authHeader({ 'content-type': 'application/json' }),
      success: (res) => {
        if (apiCompat.shouldStopForApiError(res)) {
          return
        }
        this.finishSubmit(this.data.isReport ? '举报已提交' : '提交成功')
      },
    })
  },

  finishSubmit: function(title) {
    wx.navigateBack({
      delta: 0,
    })
    wx.showToast({
      title,
      icon: 'none',
    })
  },

  formReset: function() {
  },

  onReasonChange: function(e) {
    this.setData({
      selectedReason: e.detail.value
    })
  },

  inputs: function(e) {
    const value = e.detail.value || ''
    const len = parseInt(value.length)
    if (len <= this.data.min) {
      this.setData({
        texts: "至少5个字。"
      })
    } else if (len > this.data.min) {
      this.setData({
        texts: " "
      })
    }
    if (len > this.data.max) return
    this.setData({
      currentWordNumber: len
    })
  },

  onLoad: function(options) {
    const id = options.id ? Number(options.id) : -1
    this.setData({
      id,
      isReport: id > 0
    })
    wx.setNavigationBarTitle({
      title: id > 0 ? '举报内容' : '意见反馈'
    })
  },

  onReady: function() {
  },

  onShow: function() {
  },

  onHide: function() {
  },

  onUnload: function() {
  },

  onPullDownRefresh: function() {
  },

  onReachBottom: function() {
  },

  onShareAppMessage: function() {
  }
})
