//app.js
const api = require("./config/api")

App({
  onLaunch: function() {
    var that = this
    that.setNavBarInfo()
    if (wx.getStorageSync('openid')) {
        that.globalData.openid = wx.getStorageSync('openid')
        wx.request({
            url: api.CheckVerifyUserQuanzi,
            method:'GET',
            data: {
              openid: wx.getStorageSync('openid')
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success (res) {
              if (res.data.code == "200") {
                wx.setStorageSync('isVerified', 1)
              } else if (res.data.code == "0") {
                wx.setStorageSync('isVerified', 0)
              } else {
                wx.setStorageSync('isVerified', -1)
              }
            }
        })
        wx.request({
            url: 'https://[domain]/getMember',
            method:'GET',
            data: {
              openid: wx.getStorageSync('openid'),
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
      } else {
        wx.login({
            success (res) {
              if (res.code) {
                //发起网络请求
                wx.request({
                  url: api.Login,
                  method:'GET',
                  data: {
                    code: res.code
                  },
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success (res) {
                    console.log(res.data)
                    that.globalData.openid = res.data.result.openid
                    wx.setStorageSync('openid', res.data.result.openid)
                    wx.request({
                        url: api.CheckVerifyUserQuanzi,
                        method:'GET',
                        data: {
                          openid: res.data.result.openid
                        },
                        header: {
                          'content-type': 'application/json' // 默认值
                        },
                        success (res) {
                          if (res.data.code == "200") {
                            wx.setStorageSync('isVerified', 1)
                          } else if (res.data.code == "0") {
                            wx.setStorageSync('isVerified', 0)
                          } else {
                            wx.setStorageSync('isVerified', -1)
                          }
                        }
                    })
                    wx.request({
                        url: 'https://[domain]/getMember',
                        method:'GET',
                        data: {
                          openid: res.data.result.openid,
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
                  }
                })
              } else {
                console.log('登录失败！' + res.errMsg)
              }
            }
        })
        if ((wx.getStorageSync('avatarUrl') == "" || wx.getStorageSync('userName') == "")){
        wx.setStorageSync('random',1)
        var timestamp = String(Date.parse(new Date()) / 1000);
        timestamp = timestamp.slice(-4);
        const tmp = parseInt(Math.floor(Math.random()*10))
        var userName=this.globalData.avatarList.name[tmp]+timestamp
        var avatar = this.globalData.avatarList.img[tmp]     
        wx.setStorageSync('avatarUrl',avatar)
        wx.setStorageSync('userName',userName)
        } else {
        wx.setStorageSync('random',0)
        }
      }
  },

  setNavBarInfo () {
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    // 胶囊按钮位置信息
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    this.globalData.topEdge = menuButtonInfo.top;
    this.globalData.bottomEdge = menuButtonInfo.bottom;
    this.globalData.leftEdge = menuButtonInfo.left;
    this.globalData.rightEdge = menuButtonInfo.right;
    // 导航栏高度 = 状态栏到胶囊的间距（胶囊距上距离-状态栏高度） * 2 + 胶囊高度 + 状态栏高度
    this.globalData.navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
    this.globalData.menuBotton = menuButtonInfo.top - systemInfo.statusBarHeight;
    this.globalData.menuRight = systemInfo.screenWidth - menuButtonInfo.right;
    this.globalData.menuHeight = menuButtonInfo.height;
    this.globalData.menuWidth = menuButtonInfo.right - menuButtonInfo.left;
  },

  globalData: {
    openid: '',
    locationInfo: null,
    region: ['0'],
    navBarHeight: 0, // 导航栏高度
    menuBotton: 0, // 胶囊距底部间距（保持底部间距一致）
    menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
    menuHeight: 0, // 胶囊高度（自定义内容可与胶囊高度保证一致）
    menuWidth: 0,
    topEdge:0,
    bottomEdge:0,
    leftEdge:0,
    rightEdge:0,
    template_id:"w5kbqlvMy5KVxqCDtQgVsDgcV_TCS63xrLKVAbpH9aQ",
    verify_template:"yodvJrTB7FBCbqhOBgXhmN4AQQRFCs7w3yWUcCE06K4",
    avatarList: {
        img: [
          'http://yqtech.ltd/animal/1.png',
          'http://yqtech.ltd/animal/2.png',
          'http://yqtech.ltd/animal/3.png',
          'http://yqtech.ltd/animal/4.png',
          'http://yqtech.ltd/animal/5.png',
          'http://yqtech.ltd/animal/6.png',
          'http://yqtech.ltd/animal/7.png',
          'http://yqtech.ltd/animal/8.png',
          'http://yqtech.ltd/animal/9.png',
          'http://yqtech.ltd/animal/10.png',
          'http://yqtech.ltd/animal/11.png',
          'http://yqtech.ltd/animal/12.png',
          'http://yqtech.ltd/animal/13.png',
          'http://yqtech.ltd/animal/14.png',
          'http://yqtech.ltd/animal/15.png',
          'http://yqtech.ltd/animal/16.png',
          'http://yqtech.ltd/animal/17.png',
          'http://yqtech.ltd/animal/18.png',
          'http://yqtech.ltd/animal/19.png',
          'http://yqtech.ltd/animal/20.png',
          'http://yqtech.ltd/animal/21.png',
        ],
        name: [
          'Bee',
          'Butterfly',
          'Monkey',
          'Octopus',
          'Sheep',
          'Snail',
          'Boa',
          'Dragonfly',
          'Nustang',
          'Octopus',
          'Peacock',
          'Antelope',
          'Walrus',
          'Starfish',
          'Otter',
          'Alligator',
          'Squirrel',
          'Ostrich',
          'Albatross',
          'Alpaca',
          'Ladybird',
        ]
    }
  }
})