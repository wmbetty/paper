// pages/suggest/suggest.js
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
      showTitle: true,
      showHome: true
    },
    typeId: 1,
    statusBarHeight: 0,
    token: '',
    page: 1,
    commentList: [],
    types: [],
    tabIndex: 0,
    showInput: false,
    content: '',
    showDialog: false,
    winHeight: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
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
            that.setData({token: token})
            let commentApi = backApi.commentApi+token;
            wx.showLoading({title: '加载中'});
            Api.wxRequest(commentApi,'GET',{type_id: 1, page: that.data.page},(res)=>{
              if (res.data.status*1===200) {
                wx.hideLoading();
                let types = res.data.data.type;
                let list = res.data.data.data;
                that.setData({
                  commentList: list,types: types
                })
              } else {
                wx.hideLoading();
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    let res = wx.getSystemInfoSync();
    var clientHeight=res.windowHeight;
    that.setData( {
      winHeight: clientHeight
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    let page = that.data.page*1+1;
    let tid = that.data.typeId;
    let commentApi = backApi.commentApi+that.data.token;
    let list = that.data.commentList;
    let tabIndex = that.data.tabIndex;
    let types = that.data.types;
    app.aldstat.sendEvent(`留言页上滑查看更多-${types[tabIndex].type_name}`,{
      play : ""
    });
    wx.showLoading({title: '加载中'});
    Api.wxRequest(commentApi,'GET',{type_id: tid, page: page},(res)=>{
      if (res.data.status*1===200) {
        wx.hideLoading();
        let mlist = res.data.data.data;
        if (mlist.lengt>0) {
          list = list.concat(mlist)
          that.setData({
            commentList: list
          })
        } else {
          Api.wxShowToast('没有更多了~', 'none', 2000);
        }
      } else {
        wx.hideLoading();
        Api.wxShowToast('数据获取失败~', 'none', 2000);
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  //
  // },
  changeTab (e) {
    let that = this;
    let tid = e.currentTarget.dataset.tid;
    let index = e.currentTarget.dataset.index;
    let types = that.data.types;
    that.setData({typeId: tid, commentList: [], tabIndex: index, page: 1});
    let commentApi = backApi.commentApi+that.data.token;
    app.aldstat.sendEvent(`留言页点击-${types[index].type_name}`,{
      play : ""
    });
    wx.showLoading({title: '加载中'});
    Api.wxRequest(commentApi,'GET',{type_id: tid, page: that.data.page},(res)=>{
      if (res.data.status*1===200) {
        wx.hideLoading();
        let list = res.data.data.data;
        that.setData({
          commentList: list
        })
      } else {
        wx.hideLoading();
        Api.wxShowToast('数据获取失败~', 'none', 2000);
      }
    })
  },
  gotoPraise (e) {
    let that = this;
    let idx = e.currentTarget.dataset.index;
    let good = e.currentTarget.dataset.good;
    let list = that.data.commentList;
    let tabidx = that.data.tabIndex;
    let types = that.data.types;
    let praiseApi = backApi.praiseApi+that.data.token;
    if (!good) {
      app.aldstat.sendEvent(`留言页点赞-${types[tabidx].type_name}-第${idx*1+1}条`,{
        play : ""
      });
      Api.wxRequest(praiseApi,'POST',{cid: list[idx].id},(res)=>{
        if (res.data.status*1===201) {
          list[idx].isGood = true;
          list[idx].total_praise = list[idx].total_praise*1+1;
          that.setData({
            commentList: list
          })
        } else {
          Api.wxShowToast(res.data.msg, 'none', 2000);
        }
      })

    } else {
      Api.wxShowToast('点过赞了哦~', 'none', 2000);
    }
  },
  getContent (e) {
    let that = this;
    let val = e.detail.value;
    that.setData({content:val});
  },
  inputBlur () {
    this.setData({showInput:false})
  },
  cancelDialog () {
    let that = this;
    that.setData({
      showDialog: false
    })
  },
  confirmDialog (e) {
    let that = this;
    let updateUserInfoApi = backApi.updateUserInfoApi+that.data.token;
    that.setData({
      showDialog: false
    });
    wx.login({
      success: function (res) {
        let code = res.code;
        wx.getUserInfo({
          success: (res)=>{
            let userData = {
              encryptedData: res.encryptedData,
              iv: res.iv,
              code: code
            }
            Api.wxRequest(updateUserInfoApi,'POST',userData,(res)=> {
              if (res.data.status*1===200) {
                wx.setStorageSync('userInfo', res.data.data);
                Api.wxShowToast('授权成功，可以留言啦', 'none', 2000);
              } else {
                Api.wxShowToast('更新用户信息失败', 'none', 2000);
              }
            })
          }
        })
      }
    })
  },
  showPut () {
    let that = this;
    setTimeout(()=>{
      let userInfo = wx.getStorageSync('userInfo');
      if (userInfo.id) {
        that.setData({showInput:true})
      } else {
        that.setData({
          showDialog: true
        })
      }
    }, 200)
  },
  sendComment () {
    let that = this;
    let tabIndex = that.data.tabIndex;
    let types = that.data.types;
    let tid = types[tabIndex].id;
    let content = that.data.content;
    let commentList = that.data.commentList;
    let commentApi = backApi.commentApi+that.data.token;
    if (content==='') {
      Api.wxShowToast('请输入留言内容', 'none', 2000);
    } else {
      app.aldstat.sendEvent(`${types[tabIndex].type_name}发送留言-${content}-`,{
        play : ""
      });
      wx.showLoading({title: '发送中',mask: true});
      Api.wxRequest(commentApi,'POST',{type_id: tid, content: content},(res)=> {
        if (res.data.status*1===201) {
          wx.hideLoading();
          commentList.unshift(res.data.data);
          that.setData({commentList: commentList, content: ''})
        } else {
          wx.hideLoading();
          Api.wxShowToast('留言出错了', 'none', 2000);
        }
      })
    }
  }

})
