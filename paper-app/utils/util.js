const Api = require('wxApi');

// const http = "https://fabu.gif.604f.cn/"

const http = "https://gif.79643.com/"

const loginApi = `${http}movies/member/login`
const moviesListApi = `${http}movies/movies?access-token=`
const updateUserInfoApi = `${http}movies/member/user-info?access-token=`
const moviesViewApi = `${http}movies/movies/view?access-token=`
const tagListApi = `${http}movies/movies/keywords?access-token=`
const bannerApi = `${http}movies/banner?access-token=`
const appListApi = `${http}movies/miniprogram?access-token=`
const recommendAppApi = `${http}movies/miniprogram/recommend?access-token=`
const moreApi = `${http}movies/movies/more?access-token=`
const activityApi = `${http}movies/activity/`
const searchApi = `${http}movies/movies/search?access-token=`
const checkDownloadApi = `${http}movies/movies/check-download?access-token=`
const operationApi = `${http}movies/movies/operation?access-token=`
const commentApi = `${http}movies/comment?access-token=`
const praiseApi = `${http}movies/comment/praise?access-token=`
const exitApi = `${http}movies/movies/exit-rate?access-token=`

function getToken(){
  return new Promise(function(resolve,reject){
    //ajax...
    wx.login({
      success: function(res) {
        // let reqData = {};
        let code = res.code;
        if (code) {
          // reqData.code = code;
          // Api.wxRequest(loginApi,'POST',{code: code},(res)=>{
          //   resolve(res)
          // })
          // wx.request({
          //   url: loginApi,
          //   method: 'POST',
          //   data: {code: code},
          //   header: {
          //     'content-type': 'application/json' // 默认值
          //   },
          //   success: (res)=>{},
          //   fail: (res)=>{}
          // })
        } else {
          wx.showToast({ title: '登录失败', icon: 'none' })
        }
      }
    });
    //如果有错的话就reject
  })
}

module.exports = {
  loginApi: loginApi,
  moviesListApi: moviesListApi,
  moviesViewApi: moviesViewApi,
  getToken: getToken,
  updateUserInfoApi: updateUserInfoApi,
  tagListApi: tagListApi,
  bannerApi: bannerApi,
  appListApi: appListApi,
  recommendAppApi: recommendAppApi,
  moreApi: moreApi,
  activityApi: activityApi,
  searchApi: searchApi,
  checkDownloadApi: checkDownloadApi,
  operationApi: operationApi,
  commentApi: commentApi,
  praiseApi: praiseApi,
  exitApi: exitApi
}
