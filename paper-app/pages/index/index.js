// pages/test/test.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();
const statusBarHeight = app.globalData.height;

var startx, starty;

Page({
  data: {
    // slider: [
    //   {'linkUrl': 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg', 'id': 1},
    //   {'linkUrl': 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg', 'id': 2},
    //   {'linkUrl': 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg', 'id': 3}
    // ],
    swiperCurrent: 0,
    nvabarData: {
      showCapsule: 0, //是否显示左上角图标
      showNavTitle: true,
      showTitle: false
    },
    statusBarHeight: 0,
    token: '',
    banners: [],
    appList: [],
    hots: [],
    hotObj: {},
    recommends: [],
    recommendObj: {},
    others: [],
    otherObj: {},
    drama: [],
    dramaObj: {},
    showCommentBtn: false,
    options: {},
    isPullDown: false,
    isTop: true,
    distanceY: 0,
    indicatorColor: 'rgba(199, 199, 204, 1)',
    dotActiveColor: '#666666',
    indicatorDots: true
  },
  //手指接触屏幕
  touchstart (e) {
    starty = e.touches[0].pageY;
  },
  //手指离开屏幕
  touchend (e) {
    let that = this;
    var endy = e.changedTouches[0].pageY;
    let distanceY = endy - starty;
    that.setData({distanceY: distanceY})
    if (that.data.isTop && distanceY > 60) {
      that.setData({isPullDown: true})
      that.onLoad(that.data.options);
    }
  },
  onLoad: function (options) {
    let that = this;
    that.setData({options: options})
    if (options.isPreview) {
      wx.navigateTo({
        url: `/pages/previewimg/previewimg?length=${options.length}&index=${options.index}&title=${options.title}&aid=${options.aid}`
      })
    }
    if (options.isActivity) {
      wx.navigateTo({
        url: `/pages/activity/activity?id=${options.id}`
      })
    }
    that.setData({statusBarHeight: statusBarHeight});
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            that.setData({isPullDown: false})
            let token = res.data.data.access_token;
            let bannerApi = backApi.bannerApi + token;
            let moviesListApi = backApi.moviesListApi + token;
            let recommendAppApi = backApi.recommendAppApi + token;
            that.setData({token: token});
            Api.wxRequest(bannerApi,'GET',{},(res)=>{
              if (res.data.status*1===201) {
                if (res.data.data.length===0) {
                  Api.wxShowToast('暂无banner数据~', 'none', 2000);
                } else {
                  that.setData({banners: res.data.data})
                }
              } else {
                that.setData({isPullDown: false})
                Api.wxShowToast('banner数据获取失败~', 'none', 2000);
              }
            })
            wx.showLoading({
              title: '加载中'
            });
            Api.wxRequest(recommendAppApi,'GET',{},(res)=>{
              if (res.data.status*1===200) {
                wx.hideLoading();
                that.setData({appList: res.data.data})
              } else {
                wx.hideLoading();
                Api.wxShowToast('小程序获取失败~', 'none', 2000);
              }
            })

            Api.wxRequest(moviesListApi,'GET',{},(res)=>{
              if (res.data.status*1===200) {
                let hotObj = res.data.data.hot;
                let recommendObj = res.data.data.recommend;
                let otherObj = res.data.data.other;
                let dramaObj = res.data.data.drama;
                that.setData({
                  hotObj: hotObj, recommendObj: recommendObj, otherObj: otherObj,
                  hots: hotObj.data, recommends: recommendObj.data, others: otherObj.data,
                  drama: dramaObj.data, dramaObj: dramaObj
                })
              } else {
                Api.wxShowToast('专辑数据获取失败~', 'none', 2000);
              }
            })
          } else {
            that.setData({isPullDown: false})
            Api.wxShowToast('token获取失败~', 'none', 2000);
          }
        })
      }
    })
  },
  onReady: function () {},
  onShow: function () {
    // wx.setStorageSync('page', 'index');
    app.globalData.page = 'index'
  },
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {},

  //轮播图的切换事件
  swiperChange: function(e){
//只要把切换后当前的index传给<swiper>组件的current属性即可
    let that = this;
    let swiperCurrent = that.data.swiperCurrent*1;
    let curr = e.detail.current*1;
    if (swiperCurrent !== curr) {
      that.setData({
        swiperCurrent: e.detail.current
      })
    }
  },
  //点击指示点切换
  chuangEvent: function(e){
    this.setData({
      swiperCurrent: e.currentTarget.id
    })
  },
  bannerGo (e) {
    let that = this;
    let banners = that.data.banners;
    let idx = e.currentTarget.dataset.index;
    let page = banners[idx].link_url;
    app.aldstat.sendEvent(`首页轮播图跳转-${banners[idx].title}-`,{
      play : ""
    });
    wx.navigateTo({
      url: page
    })
  },
  gotoApp (e) {
    let item = e.currentTarget.dataset.item;
    app.aldstat.sendEvent(`首页点击小程序-${item.name}-`,{
      play : ""
    });
    wx.navigateToMiniProgram({
      appId: item.appid,
      // path: 'page/index/index?id=123',
      // extraData: {
      //   foo: 'bar'
      // },
      // envVersion: 'develop',
      success(res) {
        // 打开成功
      }
    })
  },
  gotoMore () {
    app.aldstat.sendEvent(`首页点击更多好玩小程序-`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/applist/applist`
    })
  },
  gotoMorePaper (e) {
    let tid = e.currentTarget.dataset.tid;
    let index = e.currentTarget.dataset.index;
    if (index*1===0) {
      app.aldstat.sendEvent(`首页点击推荐更多专辑`,{
        play : ""
      });
    }
    if (index*1===1) {
      app.aldstat.sendEvent(`首页点击热门更多专辑`,{
        play : ""
      });
    }
    if (index*1===2) {
      app.aldstat.sendEvent(`首页点击其他更多专辑`,{
        play : ""
      });
    }
    if (index*1===3) {
      app.aldstat.sendEvent(`首页点击影视剧照更多专辑`,{
        play : ""
      });
    }
    wx.navigateTo({
      url: `/pages/morelist/morelist?typeId=${tid}&idx=${index}`
    })
  },
  gotoDetails (e) {
    let item = e.currentTarget.dataset.item;
    let aid = e.currentTarget.dataset.item.movies_id;
    let idx = e.currentTarget.dataset.index;
    app.aldstat.sendEvent(`首页点击详情-${item.movies_name}-`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/details/details?aid=${aid}&tidx=${idx}`
    })
  },
  onPageScroll (e) {
    let that = this;
    let scrollTop = e.scrollTop;
    if (scrollTop === 0) {
      that.setData({isTop: true})
    } else {
      that.setData({isTop: false})
    }
    if (scrollTop>270) {
      that.setData({showCommentBtn: true})
    } else {
      that.setData({showCommentBtn: false})
    }
  },
  gotoSuggest () {
    app.aldstat.sendEvent(`首页点击留言按钮`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/suggest/suggest`
    })
  }
})
