Page({
  data: {
    wechatQr: '/images/contact_wechat_qr.jpg',
    serviceItems: [
      {
        title: '问题反馈',
        desc: '遇到内容、账号、发布、评论或上传问题时，可以通过意见反馈提交说明。'
      },
      {
        title: '内容处理',
        desc: '如需举报违规内容，请优先在详情页使用举报入口，便于定位具体内容。'
      },
      {
        title: '使用说明',
        desc: '平台会持续优化校园信息发布、评论互动、树洞交流和个人中心体验。'
      }
    ],
    helpText: '如需反馈问题，请在个人中心进入意见反馈，尽量描述问题页面、操作步骤和出现时间。'
  },

  toSuggestion() {
    wx.navigateTo({
      url: '../suggestion/suggestion'
    })
  },

  copyHelpText() {
    wx.setClipboardData({
      data: this.data.helpText,
      success: () => wx.showToast({ title: '已复制', icon: 'success' }),
      fail: () => wx.showToast({ title: '复制失败', icon: 'none' })
    })
  },

  previewWechatQr() {
    wx.previewImage({
      current: this.data.wechatQr,
      urls: [this.data.wechatQr]
    })
  },

  onShareAppMessage() {
    return {
      title: '贝塔驿站帮助与反馈',
      path: '/pages/uitem/contact/contact'
    }
  }
})
