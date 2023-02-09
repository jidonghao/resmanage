<template>
  <view class="contain">
    <arrow-list title="头像" showLine>
      <image class="avatar" :src="avatar"></image>
    </arrow-list>
    <arrow-list title="昵称" showLine :value="nickName"/>
    <view @click="goPage('/pages/my/myInfo/changePhoneNumber')">
      <arrow-list title="手机号" :value="phoneNumber"/>
    </view>
    <view @click="goPage('/pages/my/myInfo/changePasswd')">
      <arrow-list title="密码" :value="hasPasswd?'已设置':'未设置'"/>
    </view>

    <view class="logout" @click="logout">退出登录</view>
  </view>
</template>

<script setup lang="ts">
// import arrowList from "/components/arrow-list/arrow-list.vue"
import {ref} from 'vue'
import {onShow} from "@dcloudio/uni-app";
import {showModal} from "@/utils/utils";
import {removeAuthorization} from "@/utils/auth";

let nickName = ref(''),
    phoneNumber = ref(''),
    avatar = ref(''),
    hasPasswd = ref(false)

onShow(() => {
  let userInfo = uni.getStorageSync("userInfo")
  nickName.value = userInfo.nickName
  phoneNumber.value = userInfo.phoneNumber
  avatar.value = userInfo.avatar
  hasPasswd.value = userInfo.hasPasswd
});
let goPage = (url: String) => {
  uni.navigateTo({url})
}
/**
 * 登出
 */
let logout = () => {
  showModal({content: "确定要退出登录吗？"}).then(() => {
    removeAuthorization()
    uni.removeStorageSync('userInfo')
    uni.redirectTo({url: '/pages/login/login'})
  }).catch(() => {
  })
}
</script>

<style scoped lang="scss">
@import url("../myStyle.scss");

.contain {
  height: 100vh;
}

.logout {
  background: white;
  padding: 24upx;
  box-sizing: border-box;
  text-align: center;
  margin-top: 24upx;
  margin: 24upx 0;
  border: solid rgba(0, 0, 0, 0.1);
  border-width: 1upx 0;

  &:active {
    background: #f5f5f5;
  }
}
</style>