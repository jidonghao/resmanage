<template>
    <view class="container-login">
  <view class="selectUse">
<!--    <view :class="{'useSelect':useSelect===1}" @click="useSelect=1">手机号登录</view>-->
<!--    <view class="vBar">|</view>-->
<!--    <view :class="{'useSelect':useSelect===2}" @click="useSelect=2">密码登录</view>-->
  </view>

  <view class="container loginView" v-show="useSelect===1">
    <uni-forms :modelValue="formData" label-width="80px">
      <uni-forms-item required label="手机号：" name="phoneNumber">
        <uni-easyinput type="number" :maxlength="11" v-model="formData.phoneNumber" placeholder="请输入手机号"/>
      </uni-forms-item>
      <uni-forms-item required name="captcha" label="验证码：">
        <view class="getCaptcha">
          <uni-easyinput type="number" :maxlength="6" v-model="formData.captcha" placeholder="请输入验证码"/>
          <button class="getCaptchaBtn" :disabled="captchaDis" @click="getCaptcha">{{ captchaPlaceHolder }}</button>
        </view>
      </uni-forms-item>
<!--      <uni-forms-item required label.vue="邀请码：" name="phoneNumber">-->
<!--        <uni-easyinput type="text" :maxlength="11" v-model="formData.invitationCode" placeholder="请输入邀请码"/>-->
<!--      </uni-forms-item>-->
    </uni-forms>
  </view>
  <!--  -->
  <view class="container loginView" v-show="useSelect===2">
    <uni-forms :modelValue="formData" label-width="70px">
<!--      <uni-forms-item required label.vue="手机号：" name="phoneNumber">-->
<!--        <uni-easyinput type="number" :maxlength="11" v-model="formData.phoneNumber" placeholder="请输入手机号"/>-->
<!--      </uni-forms-item>-->
      <uni-forms-item required label="账号：" name="user">
        <uni-easyinput :maxlength="11" v-model="formData.user" placeholder="请输入账号"/>
      </uni-forms-item>
      <uni-forms-item required name="passwd" label="密码：">
        <uni-easyinput type="password" v-model="formData.passwd" placeholder="请输入密码"/>
      </uni-forms-item>
    </uni-forms>
  </view>
  <button @click="login" class="login">登录</button>
        <button size="mini" class="login register" @click="goRegister">没有账号？立即注册➡️</button>
    </view>
</template>

<script setup lang="ts">
import {ref, unref} from 'vue'
import loginApi from '@/api/login'
import {setAuthorization} from "@/utils/auth";

function goRegister(){
    uni.navigateTo({
        url:"/pages/login/register"
    })
}

let formData = ref({user: '', captcha: '', passwd: '', invitationCode: ""})
let useSelect = ref(2)
let captchaPlaceHolder = ref("获取验证码")  // 验证码按钮
let captchaDis = ref(false)
/**
 * 表单验证
 * @param phone
 * @param captcha
 * @param passwd
 */
let verification = (phone = false, captcha = false, passwd = false) => {
  if (phone) {
    if (!formData.value.user) {
      uni.showToast({title: '请输入账号', icon: 'error'})
      return false
    }
    // else if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(formData.value.phoneNumber)) {
    //   uni.showToast({title: '手机号格式有误', icon: 'error'})
    //   return false
    // }
  }
  if (captcha) {
    if (!formData.value.captcha) {
      uni.showToast({title: '请输入验证码', icon: 'error'})
      return false
    }
    if (formData.value.captcha.length !== 4) {
      uni.showToast({title: '验证码错误', icon: 'error'})
      return false
    }
    // if (!formData.value.invitationCode) {
    //   uni.showToast({title: '请先输入邀请码', icon: 'error'})
    //   return false
    // }
  }

  if (passwd) {
    if (!formData.value.passwd) {
      uni.showToast({title: '请输入密码', icon: 'error'})
      return false
    } else if (formData.value.passwd.length < 8) {
      uni.showModal({title: '提示',content:"用户名或密码错误",showCancel:false})
      return false
    }
  }

  return true
}
/**
 * 获取验证码
 */
let getCaptcha = () => {
  if (!verification(true))
    return false
  // 获取验证码

  let captchaTimeStorage = +uni.getStorageSync('captchaTime') || null
  // if (captchaTimeStorage && new Date().getTime() - captchaTimeStorage < 300000) {
  //   uni.showModal({title: "错误", content: "非法操作，已拦截", showCancel: false})
  //   return false
  // }
  loginApi.getCode({phoneNumber: formData.value.phoneNumber}).then(() => {
    uni.showToast({title: '成功发送', icon: 'success'})
    captchaDis.value = true
    captchaPlaceHolder.value = `60秒重新获取`

    uni.setStorageSync('captchaTime', new Date().getTime())

    let time = 59,
        captchaTime = setInterval(() => {
          captchaPlaceHolder.value = `${time--}秒重新获取`
          if (time === 0) {
            clearInterval(captchaTime)
            captchaDis.value = false
            captchaPlaceHolder.value = "重新获取"
          }
        }, 1e3)
  }).catch((err: any) => {
    uni.showModal({title: "提示", content: err.errMsg || '操作失败，请重试', showCancel: false})
  })
}
/**
 * 登录
 */
let login = () => {
  if (!verification(true, useSelect.value === 1, useSelect.value === 2)) {
    return false
  }

  switch (useSelect.value) {
    case 1:
      // loginApi.loginByCode({phoneNumber: formData.value.phoneNumber, code: formData.value.captcha,invitationCode:formData.value.invitationCode}).then((res: any) => {
      //   setAuthorization(res.token)
      //   uni.setStorageSync('userInfo', res.info)
      //   uni.reLaunch({url: "/pages/recent/recent"})
      // }).catch((err: any) => {
      //   uni.showModal({title:"提示",content: err.errMsg || "操作失败", showCancel: false})
      // })
      // break
    case 2:
      uni.showLoading({title: "请稍后", mask: true})
      loginApi.login({type: useSelect.value, ...unref(formData)}).then((res: any) => {
        setAuthorization(res.token)
        uni.setStorageSync('userInfo', res.info)
        uni.reLaunch({url: "/pages/recent/recent"})
      }).catch((err: any) => {
        uni.showModal({title:"提示",content: err.errMsg || "手机号或密码错误", showCancel: false})
      }).finally(() => {
        uni.hideLoading()
      })

      break
  }
}

</script>

<style scoped lang="scss">
.loginView {
  background: #fefefe;
}

.getCaptcha {
  display: flex;
  justify-content: center;
  align-items: center;

  .getCaptchaBtn {
    font-size: 24upx;
    padding: 2upx 16upx;
    margin-left: 18upx;
    color: #161616;
  }
}

.selectUse {
  user-select: none;
  padding: 120upx 0 80upx;
  display: flex;
  width:100%;
  align-items: center;
  justify-content: center;
  font-size: 32upx;
  color: rgba(17, 17, 17, 0.8);

  .vBar {
    margin: 0 24upx;
  }
}

.useSelect {
  color: dodgerblue;
}

.login {
  margin: 0 30upx;
  background: #007aff;
  color: white;
}
.register{
  margin-top: 20rpx;
  background: #f5f5f5;
  color: #1B1A1A;
}
.container-login{
  width: 750rpx;
  margin: 0 auto;
}
</style>