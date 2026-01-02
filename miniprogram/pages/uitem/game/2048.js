var app = getApp();
var api = require('../../../config/api.js');
var Grid = require('./grid.js');
var Tile = require('./tile.js');
var GameManager = require('./game_manager.js');

var config = {
    data: {
        hidden: false,

        // 游戏数据可以通过参数控制
        grids: [],
        over: false,
        win: false,
        score: 0,
        highscore: 0,
        overMsg: '游戏结束',
        showRank:false,
        rankList:[],
        canUndo: false, // 是否可以撤回
    },

    onShareAppMessage: function() {
		wx.showShareMenu({
	      withShareTicket: true,
	      menus: ['shareAppMessage', 'shareTimeline']
	    })
	},
	//用户点击右上角分享朋友圈
	onShareTimeline: function () {
		return {
	      title: '只有最强的理工魂才合成过北理工!',
	      imageUrl: 'http://yqtech.ltd/treehole/timeline.jpg'
	    }
    },

    showRank:function() {
        var that= this
        that.setData({
            showRank:true
        })
        that.getRankList()
    },

    hideRank:function() {
        var that= this
        that.setData({
            showRank:false
        })
    },

    uploadRank:function(){
        var that = this
        wx.request({
            url: api.AddRank,
            data: {
              openid:app.globalData.openid,
              avatar: wx.getStorageSync('avatarUrl'),
              userName: wx.getStorageSync('userName'),
              score:that.data.score,
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            method:'GET',
            success: function (res) {
                console.log(res)
                wx.showToast({
                  title: '提交成功',
                })
            },
          })
    },

    getRankList:function(){
        var that =this;
        that.setData({
            noMore: false,
        })
        var old_data = that.data.rankList;
        var length = old_data.length
        wx.request({
          url: api.GetRank,
          data: {
            length:length,
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          method:'GET',
          success: function (res) {
              console.log(res)
              var data = res.data.rankList
              that.setData({
                rankList:old_data.concat(data)
              })
          },
          fail: function () {
            console.log("请求失败")
          }
        })
     },

     scrollToLower: function(e) {
         var that=this
        console.info('scrollToLower', e); 
        that.getRankList()
      },
    
    onLoad: function() {
        this.GameManager = new GameManager(4);

        this.setData({
            grids: this.GameManager.setup(),
            highscore: wx.getStorageSync('highscore') || 0
        });

    },
    onReady: function() {
        var that = this;

        // 页面渲染完毕隐藏loading
        that.setData({
            hidden: true
        });
    },
    onShow: function() {
        // 页面展示
    },
    onHide: function() {
        // 页面隐藏
    },
    onUnload: function() {
        // 页面关闭
    },

    // 更新视图数据
    updateView: function(data) {
        // 游戏结束
        if(data.over){
            data.overMsg = '游戏结束';
        }

        // 获胜
        if(data.win){
            data.overMsg = '恭喜';
        }

        this.setData(data);
    },

    // 重新开始
    restart: function() {
        this.updateView({
            grids: this.GameManager.restart(),
            over: false,
            won: false,
            score: 0,
            canUndo: false
        });
    },

    // 撤回操作
    undo: function() {
        var data = this.GameManager.undo();
        if (data) {
            var highscore = wx.getStorageSync('highscore') || 0;
            this.updateView({
                grids: data.grids,
                over: data.over,
                won: data.won,
                score: data.score,
                highscore: Math.max(highscore, data.score),
                canUndo: this.GameManager.canUndo()
            });
        }
    },

    touchStartClienX: 0,
    touchStartClientY: 0,
    touchEndClientX: 0,
    touchEndClientY: 0,
    isMultiple: false, // 多手指操作

    touchStart: function(events) {

        // 多指操作
        this.isMultiple = events.touches.length > 1;
        if (this.isMultiple) {
            return;
        }

        var touch = events.touches[0];

        this.touchStartClientX = touch.clientX;
        this.touchStartClientY = touch.clientY;

    },

    touchMove: function(events) {
        var touch = events.touches[0];
        this.touchEndClientX = touch.clientX;
        this.touchEndClientY = touch.clientY;
    },

    touchEnd: function(events) {
        if (this.isMultiple) {
            return;
        }

        var dx = this.touchEndClientX - this.touchStartClientX;
        var absDx = Math.abs(dx);
        var dy = this.touchEndClientY - this.touchStartClientY;
        var absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) > 10) {
            var direction = absDx > absDy ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);

            var data = this.GameManager.move(direction) || {
                grids: this.data.grids,
                over: this.data.over,
                won: this.data.won,
                score: this.data.score
            };

            var highscore = wx.getStorageSync('highscore') || 0;
            if(data.score > highscore){
                wx.setStorageSync('highscore', data.score);
            }

            this.updateView({
                grids: data.grids,
                over: data.over,
                won: data.won,
                score: data.score,
                highscore: Math.max(highscore, data.score),
                canUndo: this.GameManager.canUndo()
            });

        }

    }
};

Page(config);
