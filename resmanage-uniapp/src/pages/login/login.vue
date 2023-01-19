<template>
  <view class="selectUse">
    <view :class="{'useSelect':useSelect===1}" @click="useSelect=1">手机号登录</view>
    <view class="vBar">|</view>
    <view :class="{'useSelect':useSelect===2}" @click="useSelect=2">密码登录</view>
  </view>

  <view class="container loginView" v-show="useSelect===1">
    <uni-forms :modelValue="formData" label-width="80px">
      <uni-forms-item required label="手机号：" name="phoneNumber">
        <uni-easyinput type="number" :maxlength="11" v-model="formData.phoneNumber" placeholder="请输入手机号"/>
      </uni-forms-item>
      <uni-forms-item required name="captcha" label="验证码：">
        <view class="getCaptcha">
          <uni-easyinput type="number" :maxlength="6" v-model="formData.captcha" placeholder="请输入验证码"/>
          <button :disabled="captchaDis" @click="getCaptcha">{{ captchaPlaceHolder }}</button>
        </view>
      </uni-forms-item>
    </uni-forms>
  </view>
  <!--  -->
  <view class="container loginView" v-show="useSelect===2">
    <uni-forms :modelValue="formData" label-width="80px">
      <uni-forms-item required label="手机号：" name="phoneNumber">
        <uni-easyinput type="number" :maxlength="11" v-model="formData.phoneNumber" placeholder="请输入手机号"/>
      </uni-forms-item>
      <uni-forms-item required name="passwd" label="密码：">
        <uni-easyinput type="password" v-model="formData.passwd" placeholder="请输入密码"/>
      </uni-forms-item>
    </uni-forms>
  </view>
  <button @click="login" class="login">登录</button>
</template>

<script setup lang="ts">
import {ref, unref} from 'vue'
import loginApi from '@/api/login'
import {setAuthorization} from "@/utils/auth";

let formData = ref({phoneNumber: '', captcha: '', passwd: ''})
let useSelect = ref(1)
let captchaPlaceHolder = ref("请输入验证码")  // 验证码按钮
let captchaDis = ref(false)
/**
 * 表单验证
 * @param phone
 * @param captcha
 * @param passwd
 */
let verification = (phone = false, captcha = false, passwd = false) => {
  if (phone) {
    if (!formData.value.phoneNumber) {
      uni.showToast({title: '请先输入手机号码', icon: 'error'})
      return false
    } else if (!/^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/.test(formData.value.phoneNumber)) {
      uni.showToast({title: '手机号格式有误', icon: 'error'})
      return false
    }
  }
  if (captcha) {
    if (!formData.value.captcha) {
      uni.showToast({title: '请输入验证码', icon: 'error'})
      return false
    } else if (formData.value.captcha.length !== 6) {
      uni.showToast({title: '验证码错误', icon: 'error'})
      return false
    }
  }

  if (passwd) {
    if (!formData.value.passwd) {
      uni.showToast({title: '请输入密码', icon: 'error'})
      return false
    } else if (formData.value.passwd.length < 8) {
      uni.showToast({title: '用户名或密码错误', icon: 'error'})
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
  uni.showToast({title: '成功发送', icon: 'success'})
  captchaDis.value = true
  captchaPlaceHolder.value = `60秒重新获取`
  let time = 59,
      captchaTime = setInterval(() => {
        captchaPlaceHolder.value = `${time--}秒重新获取`
        if (time === 0) {
          clearInterval(captchaTime)
          captchaDis.value = false
          captchaPlaceHolder.value = "重新获取"
        }
      }, 1e3)
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
      uni.showToast({title: '短信权限正在申请...', icon: 'error'})
      break
    case 2:
      loginApi.login({type: useSelect.value, ...unref(formData)}).then((res: any) => {
        setAuthorization(res.token)
        uni.setStorageSync('userInfo',res.info)
        uni.reLaunch({url: "/pages/recent/recent"})
      }).catch((err: any) => {
        uni.showModal({content: err.errMsg || "手机号或密码错误", showCancel: false})
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

  > button {
    font-size: 28upx;
    margin-left: 18upx;
  }
}

.selectUse {
  user-select: none;
  padding: 120upx 0 80upx;
  display: flex;
  width: 100vw;
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
</style>