//app.js
const backApi = require('utils/util');
var aldstat = require("utils/ald-stat.js");
const Api = require('utils/wxApi');

App({
  globalData: {
    userInfo: null,
    share: false,  // 分享默认为false
    height: 0,
    page: '',
    token: '',
    searchText: '',
    aid: '',
    wid: ''
  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  onShow (options) {
    let that = this;
    // 判断是否由分享进入小程序
    if (options.scene == 1007 || options.scene == 1008) {
      that.globalData.share = true
    } else {
      that.globalData.share = false
    };
    //获取设备顶部窗口的高度（不同设备窗口高度不一样，根据这个来设置自定义导航栏的高度）
    //这个最初我是在组件中获取，但是出现了一个问题，当第一次进入小程序时导航栏会把
    //页面内容盖住一部分,当打开调试重新进入时就没有问题，这个问题弄得我是莫名其妙
    //虽然最后解决了，但是花费了不少时间
    wx.getSystemInfo({
      success: (res) => {
        that.globalData.height = res.statusBarHeight
      }
    })
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            that.globalData.token = token;
            // that.aldstat.sendOpenid(res.data.data.openid);
          } else {
            Api.wxShowToast('token获取失败~', 'none', 2000);
          }
        })
      }
    });
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log(res.hasUpdate);
    })
    updateManager.onUpdateReady(function () {
      // wx.showModal({
      //   title: '更新提示',
      //   content: '新版本已经准备好，是否重启应用？',
      //   success: function (res) {
      //     if (res.confirm) {
      //       // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
      //
      //     }
      //   }
      // })
      updateManager.applyUpdate()
    })
    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
    })
  },
  onHide: function () {
    let that = this;
    let page = that.globalData.page;
    let exitApi = backApi.exitApi + that.globalData.token;

    if (page === 'search') {
      let postData = {
        type: 'search',
        param: that.globalData.searchText,
        mode: 'out'
      }
      Api.wxRequest(exitApi, 'POST', postData, (res)=>{
        if (res.data.status*1===200) {
          console.log(res, 'exit')
        } else {
          console.log(res, '出错了')
        }
      })
    }
    if (page === 'details') {
      let postData = {
        type: 'movies',
        param: that.globalData.aid,
        mode: 'out'
      }
      Api.wxRequest(exitApi, 'POST', postData, (res)=>{
        if (res.data.status*1===200) {
          console.log(res, 'exit')
        } else {
          console.log(res, '出错了')
        }
      })
    }
    if (page === 'wallpaper') {
      let postData = {
        type: 'wallpaper',
        param: that.globalData.wid,
        mode: 'out'
      }
      Api.wxRequest(exitApi, 'POST', postData, (res)=>{
        if (res.data.status*1===200) {
          console.log(res, 'exit')
        } else {
          console.log(res, '出错了')
        }
      })
    }
  }
})
