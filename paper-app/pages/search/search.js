const backApi = require('../../utils/util');
const Api = require('../../utils/wxApi');

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
    type: 1
  },
  onLoad: function (options) {
    let that = this;
    //  高度自适应
    wx.getSystemInfo( {
      success: function( res ) {
        let clientHeight=res.windowHeight;
        that.setData( {
          winHeight: clientHeight
        });
        if (res.model==='iPhone X') {
          that.setData({isX: true})
        }
      }
    });
    backApi.getToken().then(function (res) {
      if (res.data.status*1===200) {
        let token = res.data.data.access_token;
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
  },
  onReady: function () {},
  onShow: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {
    let that = this;
    let type = that.data.type;
    let page = that.data.page*1+1;
    let searchText = that.data.searchText;
    let listApi = backApi.moviesListApi+that.data.token;
    let imgList = that.data.imgList;
    Api.wxRequest(listApi,'GET',{keywords: searchText, page: page,type: type},(res)=>{
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
  showSelectList () {
    let that = this;
    let showSelect = that.data.showSelect;
    if (showSelect) {
      that.setData({showSelect: false})
    } else {
      that.setData({showSelect: true})
    }
  },
  choseType (e) {
    let that = this;
    let type = e.currentTarget.dataset.type*1;
    let searchText = that.data.searchText;
    let listApi = backApi.moviesListApi+that.data.token;
    if (type===1) {
      that.setData({titleText: '壁纸', type: 1, page: 1})
    } else {
      that.setData({titleText: '剧照', type: 2, page: 1})
    }
    setTimeout(()=>{
      let type = that.data.type;
      if (searchText!=='') {
        wx.showLoading({
          title: '加载中',
          mask: true
        });
        Api.wxRequest(listApi,'GET',{keywords: searchText, page: 1,type: type},(res)=>{
          if (res.data.status*1===200) {
            wx.hideLoading();
            if (res.data.data.length>0) {
              that.setData({imgList: res.data.data,page: 1,keywords: searchText,showTags: false})
            } else {
              Api.wxShowToast('暂未搜到结果~', 'none', 2000);
              that.setData({imgList: [],page: 1})
            }
          } else {
            wx.hideLoading();
            Api.wxShowToast('搜索失败~', 'none', 2000);
          }
        })
      }
    },220)
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
    let type = that.data.type*1;
    let listApi = backApi.moviesListApi+that.data.token;
    if (text!=='') {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
      Api.wxRequest(listApi,'GET',{keywords: text, page: 1,type: type},(res)=>{
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
    }
  },
  gosearch (e) {
    let that = this;
    let listApi = backApi.moviesListApi+that.data.token;
    let word = e.currentTarget.dataset.word;
    setTimeout(()=>{
      let type = that.data.type;
      that.setData({
        page: 1,keywords: word,searchText: word
      });
      Api.wxRequest(listApi,'GET',{page: 1,keywords:word,type: type},(res)=>{
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
      url: `/pages/details/details?id=${id}`
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