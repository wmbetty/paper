const Api = require('wxApi');

const http = "https://fabu.gif.79643.com/"
// const http = "https://gif.79643.com/"

const loginApi = `${http}movies/member/login`
const moviesListApi = `${http}movies/movies?access-token=`
// const imgDetailApi = `${http}v1/images/`
// const categoryApi = `${http}v1/category?access-token=`
const updateUserInfoApi = `${http}movies/member/user-info?access-token=`
const moiveViewApi = `${http}movies/movies/view?access-token=`
// const searchApi = `${http}v1/images/search`
const tagListApi = `${http}movies/movies/tag?access-token=`
// const rewardItemApi = `${http}v1/reward?access-token=`
// const lotteryApi = `${http}v1/reward/lottery?access-token=`
// const rewardRecordApi = `${http}v1/reward/record?access-token=`

function getToken(){
  return new Promise(function(resolve,reject){
    //ajax...
    wx.login({
      success: function(res) {
        let reqData = {};
        let code = res.code;
        if (code) {
          reqData.code = code;
          Api.wxRequest(loginApi,'POST',reqData,(res)=>{
            resolve(res)
          })
        } else {
          wx.showToast({ title: '登录失败', icon: 'none' })
        }
      }
    });
    //如果有错的话就reject
  })
}

module.exports = {
  moviesListApi: moviesListApi,
  moiveViewApi: moiveViewApi,
  // categoryApi: categoryApi,
  getToken: getToken,
  updateUserInfoApi: updateUserInfoApi,
  // imageViewApi: imageViewApi,
  // searchApi: searchApi,
  tagListApi: tagListApi,
  // rewardItemApi: rewardItemApi,
  // lotteryApi: lotteryApi,
  // rewardRecordApi: rewardRecordApi
}
