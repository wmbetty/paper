// pages/activity/activity.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();
const statusBarHeight = app.globalData.height;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标
      showTitle: false,
      showHome: true
    },
    statusBarHeight: 0,
    token: '',
    winHeight: 0,
    activity: {}
  },
  onLoad: function (options) {
    let that = this;
    let id = options.id;
    that.setData({statusBarHeight: statusBarHeight})
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            that.setData({token: token})
            let activityApi = backApi.activityApi+id;
            Api.wxRequest(activityApi,'GET',{'access-token': token},(res)=>{
              if (res.data.status*1===200) {
                that.setData({activity: res.data.data});
              } else {
                  Api.wxShowToast('数据获取失败~', 'none', 2000);
              }
            })
          } else {
            Api.wxShowToast('token获取失败~', 'none', 2000);
          }
        })
      }
    })
  },
  onReady: function () {
    let that = this;
    let res = wx.getSystemInfoSync();
    var clientHeight=res.windowHeight;
    that.setData( {
      winHeight: clientHeight
    });
  },
  onShow: function () {},
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    let that = this;
    app.aldstat.sendEvent(`分享活动-${that.data.activity.title}-`,{
      play : ""
    });
    return {
      title: that.data.activity.title,
      path: `/pages/index/index?id=${that.data.activity.id}&isActivity=1`,
      imageUrl: that.data.activity.share_url
    }
  }
})
