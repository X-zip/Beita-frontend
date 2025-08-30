// 本组件为搜索组件
// 需要传入addflag   值为true / false （是否显示搜索框右侧部分）
// 若显示搜索框右侧部分，addflag值为true  需传入右侧图标url以及addhandle函数
var app = getApp();
Component({

  properties: {

    addflag: {    //显示搜索框右侧部分
      type: Boolean,
      value: false,   //如果不传addflg，那么默认不显示
      observer(newVal, oldVal, changedPath) {

      }
    },
    addimg: {       //显示搜索框右侧部分icon
      type: String,
      value: ''
    },
    closeimg: {       //显示搜索框右侧部分icon
      type: String,
      value: ''
    },
    searchstr: {     //input  值
      type: String,
      value: '值'
    },

  },

  /**
   * 组件的初始数据
   */
  data: {
    searchflag: false,   //搜索框 取消按钮显示与隐藏
    navBarHeight: app.globalData.navBarHeight, //导航栏高度
    menuRight: app.globalData.menuRight, // 胶囊距右方间距（方保持左、右间距一致）
    menuBotton: app.globalData.menuBotton,
    menuHeight: app.globalData.menuHeight,
    menuWidth:app.globalData.menuWidth,
    leftEdge:app.globalData.leftEdge,
    autofocus:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {

    //获得焦点
    getfocus() {
      this.setData({
        searchflag: true,
        autofocus:true
      })
    },
    //搜索框右侧按钮事件
    addhandle() {
      this.triggerEvent("addhandle");
    },
    //搜索输入
    searchList(e) {
      this.triggerEvent("searchList", e);
    },
    //查询
    endsearchList(e) {

      this.triggerEvent("endsearchList");
    },
    //失去焦点
    blursearch() {
      // console.log('失去焦点')

    },
    // 取消
    cancelsearch() {
      this.setData({
        searchflag: false,
        autofocus:false
      })
      this.triggerEvent("cancelsearch");
    },
    //清空搜索框
    activity_clear(e) {
      this.triggerEvent("activity_clear");
    },

  }
})