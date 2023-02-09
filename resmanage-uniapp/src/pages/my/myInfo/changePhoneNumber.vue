<template>
  <view class="contain">
    <view class="tips">
      <view>
        更换手机号后，下次可使用新手机号登录。
      </view>
      <view>
        当前手机号：+86-{{ oldPhoneNumber }}
      </view>
    </view>
    <uni-forms :modelValue="formData" label-width="90px" style="margin-top: 64upx">
      <uni-forms-item required label="新手机号：" name="phoneNumber">
        <uni-easyinput type="number" :maxlength="11" v-model="formData.phoneNumber" placeholder="请输入新手机号"/>
      </uni-forms-item>
      <uni-forms-item required name="captcha" label="验证码：">
        <view class="getCaptcha">
          <uni-easyinput type="number" :maxlength="6" v-model="formData.captcha" placeholder="请输入验证码"/>
          <button class="getCaptchaBtn" :disabled="captchaDis" @click="getCaptcha">{{ captchaPlaceHolder }}</button>
        </view>
      </uni-forms-item>
    </uni-forms>
    <button @click="login" class="login">确定</button>
  </view>
</template>

<script setup lang="ts">
import {onLoad} from "@dcloudio/uni-app";
import {ref} from "vue";
import loginApi from "@/api/login";
import {showModal} from "@/utils/utils"

let oldPhoneNumber = ref("")
let formData = ref({phoneNumber: '', captcha: ''})
let captchaDis = ref(false)
let captchaPlaceHolder = ref("获取验证码")  // 验证码按钮

onLoad(() => {
  oldPhoneNumber.value = uni.getStorageSync("userInfo").phoneNumber || ""
  if (!oldPhoneNumber) {
    uni.navigateBack()
  }
})

/**
 * 表单验证
 * @param phone
 * @param captcha
 */
let verification = (phone = false, captcha = false) => {
  if (phone) {
    if (formData.value.phoneNumber === oldPhoneNumber.value) {
      uni.showModal({title: '提示', content: "您输入的是旧手机号，请输入新手机号！", showCancel: false})
      return false
    }
    if (!formData.value.phoneNumber) {
      uni.showToast({title: '请输入手机号码', icon: 'error'})
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
    }
    if (formData.value.captcha.length !== 4) {
      uni.showToast({title: '验证码错误', icon: 'error'})
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
  if (captchaTimeStorage && new Date().getTime() - captchaTimeStorage < 300000) {
    uni.showModal({title: "错误", content: "非法操作，已拦截", showCancel: false})
    return false
  }
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
  if (!verification(true, true)) {
    return false
  }
  loginApi.changeNumber({phoneNumber: formData.value.phoneNumber, code: formData.value.captcha}).then(() => {
    showModal({title: "提示", content: "更换成功", showCancel: false}).then(() => {
      let userInfo = uni.getStorageSync("userInfo")
      userInfo.phoneNumber = formData.value.phoneNumber
      uni.setStorageSync("userInfo", userInfo)
      uni.navigateBack()
    })
  }).catch((err: any) => {
    showModal({title: "提示", content: err.errMsg || "操作失败", showCancel: false}).then(() => {
    })
  })

}
</script>

<style scoped lang="scss">
@import url("../myStyle.scss");

.contain {
  padding: 0 24upx;
  box-sizing: border-box;
  background: white;

  .tips {
    padding-top: 12upx;
    font-size: 24upx;
    opacity: 0.8;
  }
}

.getCaptcha {
  display: flex;
  justify-content: center;
  align-items: center;

  .getCaptchaBtn {
    font-size: 24upx;
    padding: 2upx 16upx;
    margin-left: 18upx;
  }
}

.login {
  background: #4d9eff;
  color: white;
}
</style>