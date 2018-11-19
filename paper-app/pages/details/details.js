// pages/details/details.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();
const statusBarHeight = app.globalData.height;

Page({
  data: {
    aid: '',
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标
      showTitle: false,
      showHome: true
    },
    statusBarHeight: 0,
    token: '',
    imgList: [],
    tidx: ''
  },
  onLoad: function (options) {
    let that = this;
    console.log(options)
    that.setData({aid: options.aid, statusBarHeight: statusBarHeight});
    if (options.tidx !== '') {
      that.setData({tidx: options.tidx})
    }
    app.globalData.aid = options.aid;
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            that.setData({token: token})
            let moviesViewApi = backApi.moviesViewApi+token;
            wx.showLoading({
              title: '加载中'
            });
            Api.wxRequest(moviesViewApi,'GET',{movies_id: options.aid},(res)=>{
              if (res.data.status*1===200) {
                wx.hideLoading();
                let title = res.data.data.movies_name;
                that.setData({title: title})
                if (res.data.data.wallpaper.length===0) {
                  Api.wxShowToast('暂无数据~', 'none', 2000);
                } else {
                  that.setData({imgList: res.data.data.wallpaper})
                }
              } else {
                wx.hideLoading();
                Api.wxShowToast('列表数据获取失败~', 'none', 2000);
              }
            })
            let exitApi = backApi.exitApi + token;
            let postData = {
              type: 'movies',
              param: options.aid,
              mode: 'enter'
            }
            Api.wxRequest(exitApi, 'POST', postData, (res)=>{
              if (res.data.status*1===200) {
                console.log(res, 'exit')
              } else {
                console.log(res, '出错了')
              }
            })
          } else {
            Api.wxShowToast('token获取失败~', 'none', 2000);
          }
        })
      }
    })
  },
  onReady: function () {},
  onShow: function () {
    // wx.setStorageSync('page', 'details');
    app.globalData.page = 'details';
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  // onShareAppMessage: function () {}
  previewImg (e) {
    let length = this.data.imgList.length;
    let index = e.currentTarget.dataset.index;
    let title = this.data.title;
    let aid = this.data.aid;
    app.aldstat.sendEvent(`详情页点击预览-${title}-第${index*1+1}张-`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/previewimg/previewimg?index=${index}&title=${title}&aid=${aid}&length=${length}`
    })
  }
})
