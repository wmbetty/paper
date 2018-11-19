// component/navbar/navbar.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    navbarData: {   //navbarData   由父页面传递的数据，变量名字自命名
      type: Object,
      value: {},
      observer: function (newVal, oldVal) {}
    },
    title: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    height: '',
    //默认值  默认显示左上角
    navbarData: {
      showCapsule: 1,
      showNavTitle: false,
      title: '',
      showTitle: true,
      showHome: true,
      showSBack: false
    }
  },

  attached: function () {
    // 获取是否是通过分享进入的小程序
    this.setData({
      share: app.globalData.share
    })
    // 定义导航栏的高度   方便对齐
    this.setData({
      height: app.globalData.height
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 返回上一页面
    goback() {
      wx.navigateBack()
    },
  //返回到首页
    gohome() {
      wx.redirectTo({
        url: '/pages/index/index',
      })
    },
    goSearch () {
      wx.navigateTo({
        url: '/pages/search/search'
      })
    }
  }
})
