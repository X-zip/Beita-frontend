// pages/adddetail/adddetail.js
const app = getApp()
const util = require('../../utils/util.js')
const check = require('../../utils/check.js')
const token = require('../../utils/qntoken.js')
const qiniuUploader = require("../../utils/qiniuUploader_shudong.js")
const api = require('../../config/api.js')
const CryptoJS = require('../../utils/aes.js')
const {
    AES_KEY,
    AES_IV,
    QINIU_CONFIG,
    SUBSCRIBE_TEMPLATE_IDS,
    MAX_IMAGE_COUNT,
} = require('../../utils/constants_private.js');
  

// 工具函数
function showToast(title, icon = 'none') {
  wx.showToast({ title, icon, duration: 1500 })
}

function showLoading(title = '加载中...') {
  wx.showLoading({ title, mask: true })
}

function encryptContent(contentObj) {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify(contentObj), AES_KEY, {
    iv: AES_IV,
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  })
  return encrypted.ciphertext.toString().toUpperCase()
}

function validateForm(option, values) {
  const rules = {
    Help: ['Title', 'Wechat', 'campusGroup'],
    Parttime: ['Title', 'Wechat', 'Price', 'campusGroup'],
    rent: ['Wechat', 'Price', 'campusGroup', 'radiogroup'],
    second: ['Title', 'Wechat', 'Price', 'campusGroup', 'radiogroup'],
    treehole: ['radiogroup']
  }
  const required = rules[option] || []
  if (!values.Content || values.Content.length === 0) return false
  return required.every(f => values[f] && values[f].length > 0)
}

Page({
  data: {
    checked: true,
    max_content: 500,
    min_content: 5,
    max_title: 30,
    min_title: 5,
    imgViewList: [],
    imgOriList: [],
    imgnum: 0,
    hidden: true,
    banDate: "0天",
    option: '',
    animalList: {
      img: [...Array(21)].map((_, i) => `http://yqtech.ltd/animal/${i + 1}.png`),
      name: [
        'Bee', 'Butterfly', 'Monkey', 'Octopus', 'Sheep', 'Snail', 'Boa',
        'Dragonfly', 'Nustang', 'Octopus', 'Peacock', 'Antelope', 'Walrus',
        'Starfish', 'Otter', 'Alligator', 'Squirrel', 'Ostrich', 'Albatross', 'Alpaca', 'Ladybird'
      ]
    }
  },

  onLoad(options) {
    this.setData({ option: options.option })
    if (wx.getStorageSync('avatarUrl') && wx.getStorageSync('userName')) {
        this.setData({
          hasUserInfo: true
        })
    }
  },

  nologin() {
    wx.showModal({
      title: '未登陆！',
      content: '未登陆时只能浏览内容而无法发布，请前往个人中心点击登陆按钮进行授权登陆。',
      confirmText: '知道了',
    })
  },

  formSubmit(e) {
    wx.requestSubscribeMessage({
        tmplIds: [SUBSCRIBE_TEMPLATE_IDS]
    });

    const values = e.detail.value
    const option = this.data.option
    if (!validateForm(option, values)) {
      return showToast('请补全信息！')
    }

    if (this.data.imgViewList.length > MAX_IMAGE_COUNT) {
      return showToast('最多上传3张图片')
    }

    showLoading('发布中，请稍等...')

    let userName, avatar
    if (option === 'treehole') {
      const tmp = Math.floor(Math.random() * 20)
      const timestamp = String(Date.now()).slice(-4)
      avatar = this.data.animalList.img[tmp]
      userName = values.nickName?.length ? values.nickName : this.data.animalList.name[tmp] + timestamp
      wx.setStorageSync('avatar', avatar)
      wx.setStorageSync('nickName', userName)
    } else {
      avatar = wx.getStorageSync('avatarUrl')
      userName = wx.getStorageSync('userName')
    }

    const content = values.Content.trim()
    const title = values.Title?.trim() || content.slice(0, 30)
    const dataToEncrypt = { content, title, verify: 'zzyq', c_time: new Date() }
    const encrypted = encryptContent(dataToEncrypt)

    check.checkString(content + title, app.globalData.openid).then(result => {
      if (!result) return showToast('有违规内容！')

      wx.request({
        url: api.AddTask,
        method: 'POST',
        data: {
          c_time: new Date(),
          content, title,
          price: values.Price || '',
          wechat: values.Wechat || '',
          avatar,
          radioGroup: values.radiogroup || 'radio7',
          campusGroup: values.campusGroup || 2,
          userName: userName.replace('匿名', 'happy'),
          img: this.data.imgOriList,
          cover: this.data.imgViewList,
          region: "beita",
          likeNum: 0, commentNum: 0, watchNum: 0,
          openid: app.globalData.openid,
          verify: "zzyqxxkj",
          encrypted
        },
        header: { "Content-Type": "application/x-www-form-urlencoded" },
        success: res => {
          const code = res.data.code
          const banMap = { 1: "1天", 3: "3天", 7: "7天" }
          if (banMap[code]) {
            this.setData({ hidden: false, banDate: banMap[code] })
          } else {
            const target = option === "treehole" ? '../treehole/treehole' : '../index/index'
            wx.switchTab({ url: target })
            showToast('发布成功', 'success')
          }
          wx.hideLoading()
        },
        fail: () => {
          wx.hideLoading()
          showToast('提交失败，请稍后再试')
        }
      })
    })
  },

  inputs(e) {
    const len = e.detail.value.length
    this.setData({
      texts: len <= this.data.min_content ? "至少5个字。" : " ",
      currentWordNumber: len > this.data.max_content ? this.data.max_content : len
    })
  },

  takePhoto() {
    if (this.data.imgnum >= MAX_IMAGE_COUNT) return showToast('最多选择3张！')
    wx.chooseMedia({
      count: MAX_IMAGE_COUNT - this.data.imgnum,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        res.tempFiles.forEach(f => this.uploadImageToQiniu(f.tempFilePath))
      }
    })
  },

  uploadImageToQiniu(filePath) {
    showLoading('上传图片中...')
    const uptoken = token.token({
        ak: QINIU_CONFIG.ak,
        sk: QINIU_CONFIG.sk,
        bkt: QINIU_CONFIG.bkt
    });

    qiniuUploader.upload(filePath, res => {
      const url = 'http://' + res.imageURL
      const imgViewList = this.data.imgViewList.concat(url)
      const imgOriList = this.data.imgOriList.concat(url)
      this.setData({ imgViewList, imgOriList, imgnum: imgViewList.length })
      wx.hideLoading()
    }, err => {
      console.log(err)
      wx.hideLoading()
      showToast('上传失败')
    }, {
      region: 'NCN',
      uptoken,
      uploadURL: 'https://upload-z1.qiniup.com',
      domain: 'imgbf.yqtech.ltd'
    })
  },

  deleteImg(e) {
    const index = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: res => {
        if (res.confirm) {
          const imgViewList = this.data.imgViewList
          const imgOriList = this.data.imgOriList
          imgViewList.splice(index, 1)
          imgOriList.splice(index, 1)
          this.setData({ imgViewList, imgOriList, imgnum: imgViewList.length })
        }
      }
    })
  },

  confirm() {
    this.setData({ hidden: true })
  },

  previewQr(e) {
    wx.previewImage({
      current: e.target.dataset.id,
      urls: [e.target.dataset.id]
    })
  },

  showAgreement() {
    wx.navigateTo({
      url: '../agreement/agreement',
    })
  },

  onCloseAgreement() {
    this.setData({ showAgreement: false })
  },

  onChangeCheck(e) {
    this.setData({ checked: e.detail })
  }
})
