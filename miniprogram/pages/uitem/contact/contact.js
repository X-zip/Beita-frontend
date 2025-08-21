// uitem/contact/contact.js
Page({
    data: {
      // —— 开源仓库（点击复制 / 查看二维码） ——
      repos: [
        {
          name: "Beita-frontend",
          url: "https://github.com/X-zip/Beita-frontend",
          // TODO: 替换为你业务域名下的二维码图片地址，并把域名加入小程序后台“downloadFile合法域名/业务域名”
          qr: "https://your.cdn.example/qr/beita-frontend.png"
        },
        {
          name: "Beita-backend",
          url: "https://github.com/X-zip/Beita-backend",
          qr: "https://your.cdn.example/qr/beita-backend.png"
        }
      ],
  
      // —— 联系方式（按需调整/增删） ——
      contacts: [
        {
          label: "邮箱",
          value: "vxuziping@gmail.com", // TODO: 换成你的邮箱
          action: "copy"              // copy：复制到剪贴板
        },
        {
          label: "微信",
          value: "zp_x520",    // TODO: 换成你的微信号
          action: "copy"
        },
        // {
        //   label: "官网",
        //   value: "https://www.beita.app", // 如果是外链，建议复制；或在 web-view 用你备案域名中转
        //   action: "copy"
        // }
      ],
  
      // —— 二维码集合（例如客服/交流群），按需放置 ——
      qrcodes: [
        // {
        //   name: "项目交流群",
        //   img: "https://your.cdn.example/qr/group.png" // TODO: 替换
        // },
        {
          name: "微信",
          img: "http://yqtech.ltd/beita/contact/contact1.jpg" // TODO: 替换
        }
      ]
    },
  
    // 复制仓库链接
    copyLink(e) {
      const { url } = e.currentTarget.dataset || {}
      if (!url) {
        wx.showToast({ title: "无效链接", icon: "none" })
        return
      }
      wx.setClipboardData({
        data: url,
        success: () => wx.showToast({ title: "链接已复制", icon: "success" }),
        fail: () => wx.showToast({ title: "复制失败", icon: "none" })
      })
    },
  
    // 复制任意文本（用于邮箱、微信号、官网等）
    copyText(e) {
      const { text } = e.currentTarget.dataset || {}
      if (!text) {
        wx.showToast({ title: "内容为空", icon: "none" })
        return
      }
      wx.setClipboardData({
        data: text,
        success: () => wx.showToast({ title: "已复制", icon: "success" }),
        fail: () => wx.showToast({ title: "复制失败", icon: "none" })
      })
    },
  
    // 预览二维码（单张）
    previewQR(e) {
      const { src } = e.currentTarget.dataset || {}
      if (!src) {
        wx.showToast({ title: "暂无二维码", icon: "none" })
        return
      }
      wx.previewImage({ urls: [src] })
    },
  
    // 批量预览（如果你想左右滑看多个二维码）
    previewQRCodes(e) {
      const { index } = e.currentTarget.dataset || {}
      const imgs = (this.data.qrcodes || []).map(q => q.img).filter(Boolean)
      if (!imgs.length) {
        wx.showToast({ title: "暂无二维码", icon: "none" })
        return
      }
      wx.previewImage({
        current: imgs[index || 0],
        urls: imgs
      })
    },
  
    // （可选）复制整段说明文本
    copyAllInfo() {
      const repoLines = (this.data.repos || [])
        .map(r => `${r.name}: ${r.url}`)
        .join("\n")
      const contactLines = (this.data.contacts || [])
        .map(c => `${c.label}: ${c.value}`)
        .join("\n")
      const text = `开源仓库\n${repoLines}\n\n联系我们\n${contactLines}`
  
      wx.setClipboardData({
        data: text,
        success: () => wx.showToast({ title: "信息已复制", icon: "success" }),
        fail: () => wx.showToast({ title: "复制失败", icon: "none" })
      })
    },
  
    // —— 分享（可选） ——
    onShareAppMessage() {
      return {
        title: "贝塔｜联系与开源仓库",
        path: "/uitem/contact/contact"
      }
    },
    onShareTimeline() {
      return {
        title: "贝塔｜联系与开源仓库"
      }
    }
  })
  