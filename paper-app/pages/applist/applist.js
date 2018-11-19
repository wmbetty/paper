// pages/applist/applist.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();
const statusBarHeight = app.globalData.height;

Page({
  data: {
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标
      title: '', //导航栏 中间的标题
      showHome: true
    },
    statusBarHeight: 0,
    token: '',
    list: []
  },
  onLoad: function (options) {
    let that = this;
    that.setData({statusBarHeight: statusBarHeight})

    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            that.setData({token: token});
            let miniprogramApi = backApi.appListApi + token;
            Api.wxRequest(miniprogramApi,'GET',{},(res)=>{
              if (res.data.status*1===200) {
                let data = res.data.data
                that.setData({list: data})
              } else {
                Api.wxShowToast('数据获取失败~', 'none', 2300);
              }
            })
          } else {
            Api.wxShowToast('token获取失败~', 'none', 2300);
          }
        })
      }
    })
  },
  onReady: function () {},
  onShow: function () {},
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {},
  openApp (e) {
    let item = e.currentTarget.dataset.item;
    app.aldstat.sendEvent(`小程序列表页点击小程序-${item.name}-`,{
      play : ""
    });
    wx.navigateToMiniProgram({
      appId: item.appid,
      success(res) {
        // 打开成功
      }
    })
  }
})
