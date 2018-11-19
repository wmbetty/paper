const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();
const statusBarHeight = app.globalData.height;

Page({
  data: {
    winHeight: 0,
    winWidth: 0,
    imgList: [],
    isX: false,
    movId: '',
    token: '',
    movies_name: '',
    wallpaper_count: '',
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标
      showTitle: false,
      showHome: true
    },
    statusBarHeight: 0
  },
  onLoad: function (options) {
    let that = this;
    let id = options.id;
    that.setData({movId: id, statusBarHeight: statusBarHeight});
    //  高度自适应
    wx.getSystemInfo({
      success: function( res ) {
        let clientHeight=res.windowHeight;
        that.setData( {
          winHeight: clientHeight,
          winWidth: res.windowWidth
        });
        let model = res.model;
        if (model.indexOf('iPhone') == -1) {
          that.setData({isAndrod: true})
        }
        if (model==='iPhone X') {
          that.setData({isX: true})
        }
      }
    });
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    backApi.getToken().then(function (res) {
      if (res.data.status * 1 === 200) {
        let token = res.data.data.access_token;
        that.setData({token: token});
        let moiveViewApi = backApi.moiveViewApi+token;
        Api.wxRequest(moiveViewApi,'GET',{movies_id: id},(res)=>{
          if (res.data.status*1===200) {
            wx.hideLoading();
            that.setData({movies_name: res.data.data.movies_name,wallpaper_count: res.data.data.wallpaper_count});
            console.log(res.data.data, 'aaaa')
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
      } else {
        Api.wxShowToast('获取token失败~', 'none', 2000);
      }
    })
  },
  onReady: function () {},
  onShow: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    let that = this;
    let movId = that.data.movId;
    return {
      title: '',
      path: `/pages/index/index?movId=${movId}`,
      success() {
        Api.wxShowToast('分享成功~', 'none', 2000);
      },
      fail() {},
      complete() {}
    }
  },
  previewImg (e) {
    let that = this;
    let img = e.currentTarget.dataset.img;
    let imgList = that.data.imgList;
    let prevList = [];
    for (let item of imgList) {
      prevList = prevList.concat(item.original_url);
    }
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: prevList
    })
  },
  goBack () {
    wx.navigateBack({
      delta: 1
    })
  },
  goHome () {
    wx.redirectTo({
      url: '/pages/index/index'
    })
  }
})
