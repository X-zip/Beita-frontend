// components/radial-menu/index.js

// item 大小
var iconWidth = 70

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    items: Array,
    midIcon: String,
    run: {
      type: Boolean,
      value: false
    },
    speed: {
      type: Number,
      value: 50000
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iconWidth: iconWidth,
    isPush: true,
    animations: [],
    pushStatus:false
  },

  // 生命周期
  lifetimes: {

    attached: function () {
      this.init()
    },
  },

  attached() {
    this.init()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    init: function () {
      var that = this
      that.setData({
        pushStatus:false,
      })

      wx.getSystemInfo({
        success: function(res) {
          console.log(res.platform)
          var windowHeight = res.windowHeight
          var windowWidth = res.windowWidth
          that.setData({
            windowHeight: windowHeight,
            windowWidth: windowWidth,
          })
        },
      })
    },

    showTap: function () {
      var that = this
      var isPush = that.data.isPush
      if (isPush) {
        //收回动画
        that.pop()
      } else {
        //弹出动画
        that.push()
      }
      that.setData({ isPush: !isPush })
    },

    //回到顶部
  goTop: function (e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },

  goQun:function (e) {  // 一键回到顶部
    wx.navigateTo({
      url: '/pages/qr/qr',
    })
  },

  goGong:function (e) {  // 一键回到顶部
    wx.navigateTo({
        url: '../webView/webView?id=' + "https://mp.weixin.qq.com/s/Yf82iZkM6bebYJQqyjSWKQ",
      })
  },


    hideIcon:function(){
      var that=this
      console.log("hideIcon")
      that.pop()
      that.setData({ 
        pushStatus: false,
        isPush:false
      })
    },

    clickItem: function (e) {
      var index = e.currentTarget.dataset.index
      this.triggerEvent('click', { 'index': index })
    },

    //弹出动画
    push: function () {
      var that = this
      var midBtnAnimation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease-out'
      })
      midBtnAnimation.rotateZ(225).step()

      var count = that.data.items.length
      // 平均角度
      var animations = []

      for (var i = 0; i < count; i++) {
        // 角度转弧度
        var systemInfo = wx.getSystemInfoSync();
        var rpx = -i*90-80
        var y = rpx / 750 * systemInfo.windowWidth;
        var animation = wx.createAnimation({
          duration: 500,
          timingFunction: 'ease-out'
        })
        animation.translate(0,y).rotateZ(0).scale(1, 1).opacity(1).step()
        animations.push(animation.export())
      }
      that.setData({
        midBtnAnimation: midBtnAnimation.export(),
        animations: animations,
        pushStatus:true,
        isPush:true,
      })

    },

    //收回动画
    pop: function () {
      var that = this
      var midBtnAnimation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease-out'
      })
      midBtnAnimation.rotateZ(0).step()
      var count = that.data.items.length
      var animations = []
      for (var i = 0; i < count; i++) {
        var animation = wx.createAnimation({
          duration: 500,
          timingFunction: 'ease-out'
        })
        var y = parseInt(that.data.originY)/2 + parseInt(i)*30
        animation.translate(0, 0).rotateZ(0).scale(0, 0).opacity(0).step()
        animations.push(animation.export())
      }

      that.setData({
        midBtnAnimation: midBtnAnimation.export(),
        animations: animations,
        pushStatus:false,
        isPush:false,
      })
    },

  }
})