<template>
  <view class="contain">
    <uni-forms>
      <uni-forms-item name="newNickname">
        <uni-easyinput type="text" :maxlength="24" v-model="newNickname" placeholder="请输入新昵称"/>
      </uni-forms-item>
      <button @click="submit" class="login" :disabled="submitLoading">确定</button>
    </uni-forms>
  </view>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {onShow} from "@dcloudio/uni-app";
import loginApi from "@/api/login"
import {showModal} from "@/utils/utils";

let newNickname = ref(""), submitLoading = ref(false)

onShow(() => {
  let userInfo = uni.getStorageSync("userInfo")
  newNickname.value = userInfo.nickName
})

let submit = () => {
  if (!newNickname.value) {
    uni.showToast({title: "请先填写后再试", icon: "none"})
    return false
  }
  submitLoading.value = true
  loginApi.changeNickname({nickname: newNickname.value}).then(() => {
    showModal({title: "提示", content: "修改成功", showCancel: false}).then(() => {
      let userInfo = uni.getStorageSync("userInfo")
      userInfo.nickName = newNickname.value
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

<style scoped>
.contain {
  /*padding: 48upx 24upx;*/
}

.login {
  margin: 0 24upx;
  background: #4fa5ff;
  color: white;
}
</style>
