const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');
const app = getApp();
const statusBarHeight = app.globalData.height;

Page({
  data: {
    isSearchText: false,
    searchText: '',
    focus: true,
    winHeight: 0,
    imgList: [],
    tagList: [],
    showTags: true,
    isX: false,
    showSelect: false,
    titleText: '壁纸',
    token: '',
    type: 1,
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标
      title: '', //导航栏 中间的标题
      showHome: true
    },
    statusBarHeight: 0
  },
  onLoad: function (options) {
    let that = this;
    that.setData({statusBarHeight: statusBarHeight})
    //  高度自适应
    wx.getSystemInfo( {
      success: function( res ) {
        let clientHeight=res.windowHeight;
        that.setData( {
          winHeight: clientHeight
        });
        if (res.model.indexOf('iPhone X') != -1) {
          that.setData({isX: true})
        }
      }
    });

    let loginApi = backApi.loginApi;
    wx.login({
      success: function(res) {
        let code = res.code;
        Api.wxRequest(loginApi, 'POST', {code: code}, (res)=>{
          if (res.data.status*1===200) {
            let token = res.data.data.access_token;
            that.setData({token: token})
            let tagListApi = backApi.tagListApi+token;
            that.setData({token: token});
            Api.wxRequest(tagListApi,'GET',{},(res)=>{
              if (res.data.status*1===200) {
                if (res.data.data.length===0) {
                  Api.wxShowToast('暂无标签数据~', 'none', 2000);
                } else {
                  that.setData({tagList: res.data.data})
                }
              } else {
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
  onReady: function () {},
  onShow: function () {
    app.globalData.page = 'search'
  },
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let page = that.data.page*1+1;
    let searchText = that.data.searchText;
    let listApi = backApi.searchApi+that.data.token;
    let imgList = that.data.imgList;

    app.aldstat.sendEvent(`搜索页上滑看更多:关键词-${searchText}`,{
      play : ""
    });
    Api.wxRequest(listApi,'GET',{keywords: searchText, page: page},(res)=>{
      if (res.data.status*1===200) {
        if (res.data.data.length>0) {
          imgList = imgList.concat(res.data.data);
          that.setData({imgList: imgList, page: page})
        } else {
          Api.wxShowToast('没有更多了~', 'none', 2000);
        }
      } else {
        Api.wxShowToast('数据出错了~', 'none', 2000);
      }
    })
  },
  // onShareAppMessage: function () {
  //   app.aldstat.sendEvent(`搜索页上滑看更多:关键词-${searchText}`,{
  //     play : ""
  //   });
  //   return {
  //     title: '',
  //     path: `/pages/index/index`,
  //     success() {
  //       Api.wxShowToast('分享成功~', 'none', 2000);
  //     },
  //     fail() {},
  //     complete() {}
  //   }
  // },
  showSelectList () {
    let that = this;
    let showSelect = that.data.showSelect;
    if (showSelect) {
      that.setData({showSelect: false})
    } else {
      that.setData({showSelect: true})
    }
  },
  inputPut (e) {
    let that = this;
    let text = e.detail.value;
    if (text !== '') {
      that.setData({
        searchText: text,
        isSearchText: true
      })
    } else {
      that.setData({
        searchText: '',imgList: [],
        isSearchText: false,
        page: 1,keywords: '',showTags: true
      })
    }
  },
  clearText () {
    let that = this;
    that.setData({
      searchText: '',
      isSearchText: false,
      focus: true,page: 1,keywords: '', showTags: true, imgList: []
    })
  },
  inputBlur () {
    let that = this;
    let text = that.data.searchText;
    let listApi = backApi.searchApi+that.data.token;
    if (text!=='') {
      app.aldstat.sendEvent(`搜索页输入关键词-${text}`,{
        play : ""
      });
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      Api.wxRequest(listApi,'GET',{keywords: text, page: 1},(res)=>{
        if (res.data.status*1===200) {
          wx.hideLoading();
          if (res.data.data.length>0) {
            that.setData({imgList: res.data.data,page: 1,keywords: text,showTags: false})
          } else {
            Api.wxShowToast('暂未搜到结果~', 'none', 2000);
            that.setData({imgList: [],page: 1})
          }
        } else {
          wx.hideLoading();
          Api.wxShowToast('搜索失败~', 'none', 2000);
        }
      })
      let exitApi = backApi.exitApi + that.data.token;
      let postData = {
        type: 'search',
        param: text,
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
  },
  gosearch (e) {
    let that = this;
    let listApi = backApi.searchApi+that.data.token;
    let word = e.currentTarget.dataset.word;
    app.aldstat.sendEvent(`搜索页点击热门关键词-${word}`,{
      play : ""
    });
    setTimeout(()=>{
      that.setData({
        page: 1,keywords: word,searchText: word
      });
      Api.wxRequest(listApi,'GET',{page: 1,keywords:word},(res)=>{
        if (res.data.status*1===200) {
          if (res.data.data.length>0) {
            that.setData({imgList: res.data.data, showTags: false})
          } else {
            Api.wxShowToast('该标签暂无数据~', 'none', 2000);
          }
        } else {
          Api.wxShowToast('图片获取失败~', 'none', 2000);
        }
      })
    },200)
    let exitApi = backApi.exitApi + that.data.token;
    let postData = {
      type: 'search',
      param: word,
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
  inputFocus () {
    let that = this;
    let text = that.data.searchText;
    if (text!=='') {
      that.setData({isSearchText: true})
    }
  },
  gotoDetail (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
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
  },
  gotoDetails (e) {
    let item = e.currentTarget.dataset.item;
    app.aldstat.sendEvent(`搜索点击详情-${item.movies_name}-`,{
      play : ""
    });
    wx.navigateTo({
      url: `/pages/details/details?aid=${item.movies_id}`
    })
  }
})
