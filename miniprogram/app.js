//app.js
const api = require("./config/api")
const session = require('./utils/session.js')
const {
    SUBSCRIBE_TEMPLATE_IDS,
    VERIFY_TEMPLATE_ID,
} = require('./utils/constants_private.js');

// 生成随机头像与名字（保持同一索引对应）
function pickRandomAvatar(avatarList, timestamp = '') {
    const imgs = avatarList?.img || [];
    const names = avatarList?.name || [];
    const n = Math.min(imgs.length, names.length); // 以较短的为准

    if (n === 0) {
      return { userName: 'Guest' + timestamp, avatar: '' }; // 可换成你的默认头像
    }

    const idx = Math.floor(Math.random() * n); // 0 ~ n-1
    return {
      userName: names[idx] + timestamp,
      avatar: imgs[idx],
      idx,
    };
}

App({
  onLaunch: function() {
    var that = this
    that.setNavBarInfo()
    that.getUV()
    if (wx.getStorageSync('openid')) {
        that.globalData.openid = wx.getStorageSync('openid')
        if (!session.getLoginSession()) {
          wx.login({
            success(loginRes) {
              if (!loginRes.code) return
              wx.request({
                url: api.Login,
                method:'GET',
                data: {
                  code: loginRes.code
                },
                header: {
                  'content-type': 'application/json'
                },
                success(res) {
                  if (res.data && res.data.result) {
                    session.saveLoginSession(res.data.result)
                    if (res.data.result.openid) {
                      that.globalData.openid = res.data.result.openid
                      wx.setStorageSync('openid', res.data.result.openid)
                    }
                    if (res.data.result.unionid) {
                      wx.setStorageSync('unionid', res.data.result.unionid)
                    }
                  }
                },
                fail(err) {
                  console.error('刷新登录 session 失败:', err)
                }
              })
            }
          })
        } else if (!wx.getStorageSync('unionid')) {
          session.ensureUnionidBackfill().catch(function(err) {
            console.error('unionid backfill failed:', err)
          })
        }
        wx.request({
            url: api.CheckVerifyUserQuanzi,
            method:'GET',
            data: {
              openid: wx.getStorageSync('openid')
            },
            header: session.authHeader({ 'content-type': 'application/json' }),
            success (res) {
              if (res.data.code == "200") {
                wx.setStorageSync('isVerified', 1)
              } else if (res.data.code == "0") {
                wx.setStorageSync('isVerified', 0)
              } else {
                wx.setStorageSync('isVerified', -1)
              }
            },
            fail: function(err) {
              console.error('检查认证状态失败:', err)
            }
        })
        wx.request({
            url: api.GetMember,
            method:'GET',
            data: {
              openid: wx.getStorageSync('openid'),
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
            fail: function(err) {
              console.error('获取用户信息失败:', err)
            }
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
                    if (res.data && res.data.result && res.data.result.openid) {
                      const loginResult = res.data.result
                      that.globalData.openid = loginResult.openid
                      wx.setStorageSync('openid', loginResult.openid)
                      if (loginResult.unionid) {
                        wx.setStorageSync('unionid', loginResult.unionid)
                      }
                      session.saveLoginSession(loginResult)
                    } else {
                      console.error('登录响应数据格式错误:', res.data)
                      return
                    }
                    wx.request({
                        url: api.CheckVerifyUserQuanzi,
                        method:'GET',
                        data: {
                          openid: res.data.result.openid
                        },
                        header: session.authHeader({ 'content-type': 'application/json' }),
                        success (res) {
                          if (res.data.code == "200") {
                            wx.setStorageSync('isVerified', 1)
                          } else if (res.data.code == "0") {
                            wx.setStorageSync('isVerified', 0)
                          } else {
                            wx.setStorageSync('isVerified', -1)
                          }
                        },
                        fail: function(err) {
                          console.error('检查认证状态失败:', err)
                        }
                    })
                    wx.request({
                        url: api.GetMember,
                        method:'GET',
                        data: {
                          openid: res.data.result.openid,
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
                        fail: function(err) {
                          console.error('获取用户信息失败:', err)
                        }
                    })
                  },
                  fail: function(err) {
                    console.error('登录请求失败:', err)
                  }
                })
              } else {
                console.error('登录失败！' + res.errMsg)
              }
            },
            fail: function(err) {
              console.error('wx.login失败:', err)
            }
        })
        if ((wx.getStorageSync('avatarUrl') == "" || wx.getStorageSync('userName') == "")){
        wx.setStorageSync('random',1)
        const timestamp = Math.floor(Date.now() / 1000).toString().slice(-4);
        const picked = pickRandomAvatar(this.globalData.avatarList, timestamp);
        var userName = picked.userName;
        var avatar   = picked.avatar;
        wx.setStorageSync('avatarUrl',avatar)
        wx.setStorageSync('userName',userName)
        } else {
            wx.setStorageSync('random',0)
        }

      }
  },

  getUV() {
    var that = this
    wx.request({
        url: api.GetDailySummary,  //接口
        method: 'post',
        data: {
          region:'beita',
          campusGroup:that.globalData.campus  //这里是发送给服务器的参数（参数名：参数值）
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'  //这里注意POST请求content-type是小写，大写会报错
        },
        success: function (res) {
          if(res.data.result.errcode) {
            that.globalData.UV = 10248
            wx.setStorageSync('UV', 10248)
          } else {
            if (res.data.result.list.length > 0) {
                for (var i=0;i<res.data.result.list.length;i++){
                    if (res.data.result.list[i].page_path == "pages/index/index") {
                        // that.setData({
                        //     UV:res.data.result.list[i].page_visit_uv
                        // })
                        that.globalData.UV = res.data.result.list[i].page_visit_uv
                        wx.setStorageSync('UV', res.data.result.list[i].page_visit_uv)
                    }
                }
            } else {
                that.globalData.UV = 10248
                wx.setStorageSync('UV', 10248)
            }
          }
        },
        fail: function(err) {
          console.error('获取UV数据失败:', err)
          that.globalData.UV = 10248
          wx.setStorageSync('UV', 10248)
        }
    });
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
    UV:10248,
    template_id:SUBSCRIBE_TEMPLATE_IDS,
    verify_template:VERIFY_TEMPLATE_ID,
    avatarList: {
        img: [
          'https://yqtech.ltd/animal/1.png',
          'https://yqtech.ltd/animal/2.png',
          'https://yqtech.ltd/animal/3.png',
          'https://yqtech.ltd/animal/4.png',
          'https://yqtech.ltd/animal/5.png',
          'https://yqtech.ltd/animal/6.png',
          'https://yqtech.ltd/animal/7.png',
          'https://yqtech.ltd/animal/8.png',
          'https://yqtech.ltd/animal/9.png',
          'https://yqtech.ltd/animal/10.png',
          'https://yqtech.ltd/animal/11.png',
          'https://yqtech.ltd/animal/12.png',
          'https://yqtech.ltd/animal/13.png',
          'https://yqtech.ltd/animal/14.png',
          'https://yqtech.ltd/animal/15.png',
          'https://yqtech.ltd/animal/16.png',
          'https://yqtech.ltd/animal/17.png',
          'https://yqtech.ltd/animal/18.png',
          'https://yqtech.ltd/animal/19.png',
          'https://yqtech.ltd/animal/20.png',
          'https://yqtech.ltd/animal/21.png',
          'https://yqtech.ltd/zhuke_avatar/1.png',
          'https://yqtech.ltd/zhuke_avatar/2.png',
          'https://yqtech.ltd/zhuke_avatar/3.png',
          'https://yqtech.ltd/zhuke_avatar/4.png',
          'https://yqtech.ltd/zhuke_avatar/5.png',
          'https://yqtech.ltd/zhuke_avatar/6.png',
          'https://yqtech.ltd/zhuke_avatar/7.png',
          'https://yqtech.ltd/zhuke_avatar/8.png',
          'https://yqtech.ltd/zhuke_avatar/9.png',
          'https://yqtech.ltd/zhuke_avatar/10.png',
          'https://yqtech.ltd/zhuke_avatar/11.png',
          'https://yqtech.ltd/zhuke_avatar/12.png',
          'https://yqtech.ltd/zhuke_avatar/13.png',
          'https://yqtech.ltd/zhuke_avatar/14.png',
          'https://yqtech.ltd/zhuke_avatar/15.png',
          'https://yqtech.ltd/zhuke_avatar/1.png',
          'https://yqtech.ltd/zhuke_avatar/2.png',
          'https://yqtech.ltd/zhuke_avatar/3.png',
          'https://yqtech.ltd/zhuke_avatar/4.png',
          'https://yqtech.ltd/zhuke_avatar/5.png',
          'https://yqtech.ltd/zhuke_avatar/6.png',
          'https://yqtech.ltd/zhuke_avatar/7.png',
          'https://yqtech.ltd/zhuke_avatar/8.png',
          'https://yqtech.ltd/zhuke_avatar/9.png',
          'https://yqtech.ltd/zhuke_avatar/10.png',
          'https://yqtech.ltd/zhuke_avatar/11.png',
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
          'Penguin',
          'Koala',
          'Panda',
          'Hedgehog',
          'Raccoon',
          'Chipmunk',
          'Seal',
          'Dolphin',
          'BlueWhale',
          'Caterpillar',
          'Firefly',
          'Jellyfish',
          'Seahorse',
          'Falcon',
          'Hummingbird',
          'Corgi',
          'RedFox',
          'Lynx',
          'PolarBear',
          'Kingfisher',
          'Hamster',
          'MantaRay',
          'Meerkat',
          'Chameleon',
          '马里奥',
          '多啦A梦'
    ]},
  }
})
