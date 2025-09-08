// app.js
const api = require("./config/api")
const {
    SUBSCRIBE_TEMPLATE_IDS,
    VERIFY_TEMPLATE_ID,
} = require('./utils/constants_private.js');

App({
    onLaunch: function() {
        const that = this;
        that.setNavBarInfo();

        const cachedOpenid = wx.getStorageSync('openid');
        if (cachedOpenid) {
            that.globalData.openid = cachedOpenid;
            that.fetchInitialData(cachedOpenid);
        } else {
            // 登录并获取 openid，然后拉初始化数据
            wx.login({
                success(res) {
                    if (res.code) {
                        wx.request({
                            url: api.Login,
                            method: 'GET',
                            data: { code: res.code },
                            header: { 'content-type': 'application/json' },
                            success(loginRes) {
                                if (loginRes && loginRes.data && loginRes.data.result && loginRes.data.result.openid) {
                                    const openid = loginRes.data.result.openid;
                                    that.globalData.openid = openid;
                                    wx.setStorageSync('openid', openid);
                                    that.fetchInitialData(openid);
                                } else {
                                    console.error('Login 返回数据异常', loginRes);
                                    wx.setStorageSync('isVerified', -1);
                                }
                            },
                            fail(err) {
                                console.error('Login 请求失败', err);
                                wx.setStorageSync('isVerified', -1);
                            }
                        });
                    } else {
                        console.error('wx.login 失败：', res.errMsg);
                        wx.setStorageSync('isVerified', -1);
                    }
                },
                fail(err) {
                    console.error('wx.login 请求失败', err);
                    wx.setStorageSync('isVerified', -1);
                }
            });
        }

        // 处理默认 avatar / userName 等（保留你原逻辑）
        if ((wx.getStorageSync('avatarUrl') == "" || wx.getStorageSync('userName') == "")) {
            wx.setStorageSync('random', 1)
            var timestamp = String(Date.parse(new Date()) / 1000);
            timestamp = timestamp.slice(-4);
            const tmp = parseInt(Math.floor(Math.random() * 10))
            var userName = this.globalData.avatarList.name[tmp] + timestamp
            var avatar = this.globalData.avatarList.img[tmp]
            wx.setStorageSync('avatarUrl', avatar)
            wx.setStorageSync('userName', userName)
        } else {
            wx.setStorageSync('random', 0)
        }
    },

    // 合并后的数据拉取函数，避免重复代码
    fetchInitialData(openid) {
        const that = this;

        // 检查审核状态
        wx.request({
            url: api.CheckVerifyUserQuanzi,
            method: 'GET',
            data: { openid },
            header: { 'content-type': 'application/json' },
            success(res) {
                if (res && res.data) {
                    if (res.data.code == "200") {
                        wx.setStorageSync('isVerified', 1);
                    } else if (res.data.code == "0") {
                        wx.setStorageSync('isVerified', 0);
                    } else {
                        wx.setStorageSync('isVerified', -1);
                    }
                } else {
                    wx.setStorageSync('isVerified', -1);
                }
            },
            fail() {
                wx.setStorageSync('isVerified', -1);
            }
        });

        // 获取会员信息（设置 isdel）
        wx.request({
            url: api.GetMember,
            method: 'GET',
            data: { openid },
            header: { 'content-type': 'application/json' },
            success(res) {
                try {
                    if (res && res.data && Array.isArray(res.data.memberList) && res.data.memberList.length > 0) {
                        if (res.data.memberList[0].au4 > 0) {
                            wx.setStorageSync('isdel', true);
                            return;
                        }
                    }
                    wx.setStorageSync('isdel', false);
                } catch (e) {
                    console.error('GetMember 解析失败', e);
                    wx.setStorageSync('isdel', false);
                }
            },
            fail() {
                wx.setStorageSync('isdel', false);
            }
        });

        // 获取已推送公告 + lastNoticeId
        wx.request({
            url: api.GetPushedAnnouncements,
            method: 'GET',
            data: { openid },
            header: { 'content-type': 'application/json' },
            success(res) {

                if (res && res.data && res.data.announcements && res.data.announcements.length > 0) {
                    const announcements = res.data.announcements.map(item => {
                        if (item.postTime) {
                            const date = new Date(item.postTime);
                            item.time = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                        } else {
                            item.time = "未知时间";
                        }
                        return item;
                    });

                    const lastNoticeId = res.data.lastNoticeId || 0;
                    const unreadAnnouncements = announcements.filter(item => item.id > lastNoticeId);

                    that.globalData.allAnnouncements = announcements; // 新增：保存所有公告

                    if (unreadAnnouncements.length > 0) {
                        that.globalData.unreadAnnouncements = unreadAnnouncements;
                        that.globalData.shouldShowAnnouncementModal = true;
                        if (that.announcementDataReadyCallback) {
                            that.announcementDataReadyCallback();
                        }
                    } else {
                        that.globalData.unreadAnnouncements = [];
                        that.globalData.shouldShowAnnouncementModal = false;
                    }
                    // 保存后端返回的lastNoticeId
                    that.globalData.lastNoticeId = lastNoticeId;
                    wx.setStorageSync('last_notice_id', lastNoticeId);
                } else {
                    that.globalData.unreadAnnouncements = [];
                    that.globalData.shouldShowAnnouncementModal = false;
                    that.globalData.lastNoticeId = res && res.data ? (res.data.lastNoticeId || 0) : 0;
                }

            },
            fail(err) {
                console.error('GetPushedAnnouncements failed:', err);
            }
        });
    },

    setNavBarInfo() {
        const systemInfo = wx.getSystemInfoSync();
        const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
        this.globalData.topEdge = menuButtonInfo.top;
        this.globalData.bottomEdge = menuButtonInfo.bottom;
        this.globalData.leftEdge = menuButtonInfo.left;
        this.globalData.rightEdge = menuButtonInfo.right;
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
        navBarHeight: 0,
        menuBotton: 0,
        menuRight: 0,
        menuHeight: 0,
        menuWidth: 0,
        topEdge: 0,
        bottomEdge: 0,
        leftEdge: 0,
        rightEdge: 0,
        template_id: SUBSCRIBE_TEMPLATE_IDS,
        verify_template: VERIFY_TEMPLATE_ID,
        unreadAnnouncements: [],
        lastNoticeId: 0,
        shouldShowAnnouncementModal: false,
        allAnnouncements: [], // 新增：用于存储所有公告
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
                'Bee','Butterfly','Monkey','Octopus','Sheep','Snail','Boa','Dragonfly','Nustang','Octopus',
                'Peacock','Antelope','Walrus','Starfish','Otter','Alligator','Squirrel','Ostrich','Albatross','Alpaca','Ladybird',
            ]
        }
    }
});
