// pages/preimg/previewimg.js
const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();
const statusBarHeight = app.globalData.height;

Page({
  data: {
    item: [],
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标
      showTitle: false,
      showHome: true,
    },
    statusBarHeight: 0,
    token: '',
    winHeight: 0,
    winWidth: 0,
    index: 0,
    title: '',
    curr_img: '',
    showPreview: false,
    showDownload: false,
    aid: '',
    showDialog: false,
    openType: 'openSetting',
    authInfo: '需要获取相册权限才能保存图片哦',
    model: '',
    length: 0
  },
  cancelDialog () {
    this.setData({showDialog:false})
  },
  confirmDialog () {
    this.setData({showDialog:false})
    wx.openSetting({
      success(settingdata) {
        if (settingdata.authSetting["scope.writePhotosAlbum"]) {
          Api.wxShowToast("获取权限成功，再次点击保存到相册",'none',2000)
        } else {
          Api.wxShowToast("获取权限失败",'none',2000)
        }
      }
    })
  },
  onLoad: function (options) {
    let that = this;
    that.setData({
      statusBarHeight: statusBarHeight,index: options.index,title: options.title,
      aid: options.aid, length: options.length
    })
    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            that.setData({token: token});
            let moviesViewApi = backApi.moviesViewApi+token;
            wx.showLoading({
              title: '加载中'
            });
            Api.wxRequest(moviesViewApi,'GET',{movies_id: options.aid},(res)=>{
              if (res.data.status*1===200) {
                wx.hideLoading();
                if (res.data.data.wallpaper.length===0) {
                  Api.wxShowToast('暂无数据~', 'none', 2000);
                } else {
                  that.setData({item: res.data.data.wallpaper})
                  app.globalData.wid = res.data.data.wallpaper[0].wallpaper_id
                  let exitApi = backApi.exitApi + token;
                  let postData = {
                    type: 'wallpaper',
                    param: res.data.data.wallpaper[0].wallpaper_id,
                    mode: 'enter'
                  }
                  Api.wxRequest(exitApi, 'POST', postData, (res)=>{
                    if (res.data.status*1===200) {
                      console.log(res, 'exit')
                    } else {
                      console.log(res, '出错了')
                    }
                  })
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
      }
    })
  },
  onReady: function () {
    let that = this;
    let res = wx.getSystemInfoSync();
    var clientHeight=res.windowHeight;
    that.setData( {
      winHeight: clientHeight,
      winWidth: res.windowWidth,
      model: res.model
    });
  },
  onShow: function () {
    app.globalData.page = 'wallpaper'
  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  onShareAppMessage: function () {
    let that = this;
    let operationApi = backApi.operationApi+that.data.token;
    let index = that.data.index;
    let wid = that.data.item[index].wallpaper_id;
    let aid = that.data.aid;
    let item = JSON.stringify(that.data.item);
    let model = that.data.model;
    app.aldstat.sendEvent(`预览页分享-${that.data.title}-第${index*1+1}张`,{
      play : ""
    });
    if (model.indexOf('iPhone') !== -1) {
      setTimeout(()=>{
        Api.wxShowToast('分享完成', 'none', 2000);
      },1200)
    }
    let postData = {
      movies_id: aid,
      wallpaper_id: wid,
      type: 'share'
    }
    Api.wxRequest(operationApi,'POST',postData,(res)=>{
      console.log(res, 'share')
    })
    return {
      title: that.data.title,
      path: `/pages/index/index?isPreview=1&aid=${aid}&title=${that.data.title}&index=${index}&length=${that.data.length}`,
      imageUrl: that.data.item[index].original_url
    }
  },
  change (e) {
    let that = this;
    let current = e.detail.current;
    let imgList = that.data.item;
    app.globalData.wid = imgList[current].wallpaper_id;
    for (let i=0; i<imgList.length; i++) {
      if (i === current) {
        that.setData({index: current})
      }
    }
    let exitApi = backApi.exitApi + that.data.token;
    let postData = {
      type: 'wallpaper',
      param: imgList[current].wallpaper_id,
      mode: 'enter'
    }
    Api.wxRequest(exitApi, 'POST', postData, (res)=>{
      if (res.data.status*1===200) {
        console.log(res, 'exit')
      } else {
        console.log(res, '出错了')
      }
    })
  },
  previewImg (e) {
    let that = this;
    let curr_img = e.currentTarget.dataset.preview;
    that.setData({curr_img: curr_img, showPreview: true})
  },
  hidePreview () {
    this.setData({showPreview: false})
  },
  downloadImg () {
    let that = this;
    let index = that.data.index;
    let currImg = that.data.item[index].original_url;
    let wid = that.data.item[index].wallpaper_id;
    let aid = that.data.aid;
    let checkDownloadApi = backApi.checkDownloadApi+that.data.token;
    let operationApi = backApi.operationApi+that.data.token;
    app.aldstat.sendEvent(`预览页下载-${that.data.title}-第${index*1+1}张`,{
      play : ""
    });
    let postData = {
      movies_id: aid,
      wallpaper_id: wid
    }
    Api.wxRequest(checkDownloadApi,'POST',postData,(res)=>{
      if (res.data.status*1===200) {
        let status = res.data.data.status*1;
        if (status===1) {
          wx.downloadFile({
          url: currImg,
          success:function(res){
            wx.showLoading({
              title: '保存中'
            });
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function (res) {
                wx.hideLoading();
                let pdata = {
                  movies_id: aid,
                  wallpaper_id: wid,
                  type: 'download'
                }
                Api.wxShowToast('已保存到相册', 'none', 2000);
                Api.wxRequest(operationApi,'POST',pdata,(res)=>{
                  console.log(res.data.status, 'download')
                })
              },
              fail: function (err) {
                wx.hideLoading();
                that.setData({showDialog:true})
              }
            })
          },
          fail:function(res){
            console.log(res, 'save err')
            Api.wxShowToast('出错了', 'none', 2000);
          }
        })
        } else {
            that.setData({showDownload: true})
            setTimeout(()=>{
              that.setData({showDownload: false})
            }, 1800)
        }
      }
    })
  },
  goback() {
    wx.navigateBack()
  },
//返回到首页
  gohome() {
    wx.redirectTo({
      url: '/pages/index/index',
    })
  }
})
