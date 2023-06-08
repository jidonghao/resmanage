<template>
  <view class="contain">
    <view class="loginView">
      <uni-forms :modelValue="formData" label-width="100px" label-align="right">
        <uni-forms-item required name="passwd" label="旧密码：" v-if="hasPasswd">
          <uni-easyinput type="password" v-model="formData.passwdOld" placeholder="请输入旧密码"/>
        </uni-forms-item>
        <uni-forms-item required name="passwd" label="新密码：">
          <uni-easyinput type="password" v-model="formData.passwdNew" placeholder="请输入新密码"/>
        </uni-forms-item>
        <uni-forms-item required name="passwd" label="验证密码：">
          <uni-easyinput type="password" v-model="formData.rePasswd" placeholder="请再次输入密码"/>
        </uni-forms-item>
      </uni-forms>
      <button @click="changePasswd" class="submit" :disabled="submitLoading">确定</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import {ref} from "vue";
import loginApi from "@/api/login"
import {showModal} from "@/utils/utils"
import {onShow} from "@dcloudio/uni-app";

let formData = ref({passwdOld: '', passwdNew: '', rePasswd: ''}),
    submitLoading = ref(false)
let hasPasswd = ref(false)

onShow(() => {
  hasPasswd.value = uni.getStorageSync("userInfo")?.hasPasswd
})

/**
 * 验证密码输入是否正确
 */
let verification = () => {
  if (!formData.value.passwdOld && !hasPasswd) {
    uni.showToast({title: '请输入旧密码', icon: 'none'})
    return false
  }
  if (!formData.value.passwdNew) {
    uni.showToast({title: '请输入新密码', icon: 'none'})
    return false
  }
  if (!formData.value.rePasswd) {
    uni.showToast({title: '请输入再次输入新密码', icon: 'none'})
    return false
  }
  if (!(formData.value.passwdNew === formData.value.rePasswd)) {
    uni.showToast({title: '两次输入的密码不一致', icon: 'none'})
  }
  if (formData.value.passwdNew.length < 8) {
    uni.showToast({title: '密码太简单了', icon: 'none'})
    return false
  }
  if (formData.value.rePasswd.length > 40) {
    uni.showToast({title: '密码太长了', icon: 'none'})
    return false
  }
  return true
}

let changePasswd = () => {
  if (!verification()) return false
  submitLoading.value = true
  loginApi.changePasswd({passwd: formData.value.passwdNew, passwdOld: formData.value.passwdOld}).then(() => {
    showModal({title: "提示", content: "修改成功", showCancel: false}).then(() => {
      let userInfo = uni.getStorageSync("userInfo")
      userInfo.hasPasswd = true
      uni.setStorageSync("userInfo", userInfo)
      uni.navigateBack()
    })
  }).catch((err: any) => {
    uni.showModal({title: "提示", content: err.errMsg || "操作失败", showCancel: false})
  }).finally(() => {
    submitLoading.value = false
  })
}
</script>

<style scoped lang="scss">
@import url("../myStyle.scss");

.contain {
  background: white;
}

.loginView {
  box-sizing: border-box;
  padding: 120upx 24upx;
  width: 750rpx;
  margin: 0 auto;
}

.submit {
  background: #3d9dff;
  color: white;

  &:active {
    background: #218bfc;
  }
}
</style>