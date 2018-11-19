// pages/morelist/morelist.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();
const statusBarHeight = app.globalData.height;

Page({
  data: {
    types: [],
    lists: [],
    typeId: '',
    nvabarData: {
      showCapsule: 0, //是否显示左上角图标
      showNavTitle: true,
      showTitle: false,
      showSBack: true
    },
    indexIn: true,
    isrefresh: false,
    page: 1,
    tabIndex: 0
  },
  onLoad: function (options) {
    let that = this;
    that.setData({typeId: options.typeId*1, statusBarHeight: statusBarHeight, tabIndex: options.idx})
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            that.setData({token: token});
            let moreApi = backApi.moreApi + token;
            wx.showLoading({
              title: '加载中'
            });
            Api.wxRequest(moreApi,'GET',{type_id: options.typeId, page: that.data.page},(res)=>{
              if (res.data.status*1===200) {
                wx.hideLoading();
                that.setData({types: res.data.data.type,lists: res.data.data.data})
              } else {
                wx.hideLoading();
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
  onReachBottom: function () {
    let that = this;
    let types = that.data.types;
    let tabIndex = that.data.tabIndex;
    let page = that.data.page*1+1;
    let moreApi = backApi.moreApi + that.data.token;
    let lists = that.data.lists;
    wx.showLoading({
      title: '加载中'
    });
    Api.wxRequest(moreApi,'GET',{type_id: types[tabIndex].id, page: page},(res)=>{
      if (res.data.status*1===200) {
        wx.hideLoading();
        if (res.data.data.data.length===0) {
          Api.wxShowToast('没有更多了~', 'none', 2300);
        } else {
          lists = lists.concat(res.data.data.data);
          that.setData({lists: lists, page: page});
        }
      } else {
        wx.hideLoading();
        Api.wxShowToast('数据获取失败~', 'none', 2300);
      }
    })
  },
  // onShareAppMessage: function () {},
  gotoDetails (e) {
    let item = e.currentTarget.dataset.item;
    let idx = e.currentTarget.dataset.tidx;
    app.aldstat.sendEvent(`更多页点击详情-${item.movies_name}-`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/details/details?aid=${item.movies_id}&tidx=${idx}`
    })
  },
  changeTab (e) {
    let that = this;
    let tid = e.currentTarget.dataset.tid;
    let index = e.currentTarget.dataset.index;
    let types = that.data.types;
    that.setData({typeId: tid, lists: [], indexIn: false, tabIndex: index, page: 1});
    let moreApi = backApi.moreApi + that.data.token;
    app.aldstat.sendEvent(`更多页点击-${types[index].type_name}-`,{
      play : ""
    });
    wx.showLoading({
      title: '加载中'
    });
    Api.wxRequest(moreApi,'GET',{type_id: tid, page: 1},(res)=>{
      if (res.data.status*1===200) {
        wx.hideLoading();
        that.setData({lists: res.data.data.data})
      } else {
        wx.hideLoading();
        Api.wxShowToast('数据获取失败~', 'none', 2300);
      }
    })
  },
  goRefresh () {
    let that = this;
    let tabIndex = that.data.tabIndex*1;
    let types = that.data.types;
    let tid = types[tabIndex].id;
    let page = that.data.page*1 + 1;
    let moreApi = backApi.moreApi + that.data.token;
    that.setData({isrefresh: true});
    app.aldstat.sendEvent(`更多页点击-${types[tabIndex].type_name}-换一换`,{
      play : ""
    });
    wx.showLoading({
      title: '加载中', mask: true
    });
    Api.wxRequest(moreApi,'GET',{type_id: tid, page: page}, (res)=>{
      if (res.data.status*1===200) {
        setTimeout(()=>{
          that.setData({isrefresh: false});
          wx.hideLoading();
          if (res.data.data.data.length===0) {
            Api.wxShowToast('没有更多啦，看看其他吧~', 'none', 2300);
          } else {
            let mlist = res.data.data.data;
            that.setData({lists: mlist,page: page});
          }
        }, 1500)
      } else {
        wx.hideLoading();
        Api.wxShowToast('数据获取失败~', 'none', 2300);
      }
    })
  }
})
