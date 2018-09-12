//index.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');

Page({
  data: {
    winHeight:"",//窗口高度
    token: '',
    mlist: [],
    isX: false,
    type: 1,
    page: 1
  },
  onLoad: function (options) {
    let that = this;
    let movId = options.movId;
    //  高度自适应
    wx.getSystemInfo({
      success: function( res ) {
        let clientHeight=res.windowHeight;
        that.setData( {
          winHeight: clientHeight
        });
        let model = res.model;
        if (model.indexOf('iPhone') == -1) {
          that.setData({isAndrod: true})
        }
        if (model.indexOf('iPhone X') != -1) {
          that.setData({isX: true})
        }
      }
    });
    if (movId) {
      wx.navigateTo({
        url: `/pages/details/details?id=${id}`
      })
    }

    wx.showLoading({
      title: '加载中',
      mask: true
    });
    backApi.getToken().then(function (res) {
      if (res.data.status*1===200) {
        let token = res.data.data.access_token;
        let moviesListApi = backApi.moviesListApi+token;
        that.setData({token: token});
        Api.wxRequest(moviesListApi,'GET',{type: 1},(res)=>{
          if (res.data.status*1===200) {
            wx.hideLoading();
            if (res.data.data.length===0) {
              Api.wxShowToast('暂无数据~', 'none', 2000);
            } else {
              that.setData({mlist: res.data.data})
            }
          } else {
            wx.hideLoading();
            Api.wxShowToast('列表数据获取失败~', 'none', 2000);
          }
        })
      } else {
        Api.wxShowToast('token获取失败~', 'none', 2000);
      }
    })
  },
  onReady: function () {},
  onShow: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let type = that.data.type;
    let page = that.data.page*1+1;
    let mlist = that.data.mlist;
    let moviesListApi = backApi.moviesListApi+that.data.token;
    if (type*1===1) {
      Api.wxRequest(moviesListApi,'GET',{type: 1,page: page},(res)=>{
        if (res.data.status*1===200) {
          if (res.data.data.length>0) {
            mlist = mlist.concat(res.data.data);
            that.setData({mlist: mlist, page: page})
          } else {
            Api.wxShowToast('没有更多了~', 'none', 2000);
            return false
          }
        } else {
          Api.wxShowToast('列表数据获取失败~', 'none', 2000);
        }
      })
    } else {
      Api.wxRequest(moviesListApi,'GET',{type: 2,page: page},(res)=>{
        if (res.data.status*1===200) {
          if (res.data.data.length>0) {
            mlist = mlist.concat(res.data.data);
            that.setData({mlist: mlist, page: page})
          } else {
            Api.wxShowToast('没有更多了~', 'none', 2000);
            return false
          }
        } else {
          Api.wxShowToast('列表数据获取失败~', 'none', 2000);
        }
      })
    }
  },
  onShareAppMessage: function () {
    return {
      title: '',
      path: `/pages/index/index`,
      success() {
        Api.wxShowToast('分享成功~', 'none', 2000);
      },
      fail() {},
      complete() {}
    }
  },
  changeTab (e) {
    let that = this;
    let type = e.currentTarget.dataset.type*1;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    if (type===1) {
      that.setData({type: 1,page: 1,mlist: []})
      let moviesListApi = backApi.moviesListApi+that.data.token;
      Api.wxRequest(moviesListApi,'GET',{type: 1},(res)=>{
        if (res.data.status*1===200) {
          wx.hideLoading();
          if (res.data.data.length===0) {
            Api.wxShowToast('暂无数据~', 'none', 2000);
          } else {
            that.setData({mlist: res.data.data})
          }
        } else {
          wx.hideLoading();
          Api.wxShowToast('列表数据获取失败~', 'none', 2000);
        }
      })
    } else {
      that.setData({type: 2,page: 1,mlist: []})
      let moviesListApi = backApi.moviesListApi+that.data.token;
      Api.wxRequest(moviesListApi,'GET',{type: 2},(res)=>{
        if (res.data.status*1===200) {
          wx.hideLoading();
          if (res.data.data.length===0) {
            Api.wxShowToast('暂无数据~', 'none', 2000);
          } else {
            that.setData({mlist: res.data.data})
          }
        } else {
          wx.hideLoading();
          Api.wxShowToast('列表数据获取失败~', 'none', 2000);
        }
      })
    }
  },
  gotoDetail (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      // url: `/pages/details/details?id=${id}`
      url: `/pages/detail/detail?id=${id}`
    })
  },
  goSearch () {
    wx.navigateTo({
      url: '/pages/search/search'
    })
  }
})
