<template>
  <view class="contain">
    <view class="myInfo item" @click="goPage('/pages/my/myInfo/myInfo')">
      <image class="avatar" :src="avatar"></image>
      <view>
        <view class="nickName">{{ nickName || "用户0121211111" }}</view>
        <view class="phoneNumber">+86 {{ phoneNumber }}</view>
      </view>
      <image class="arrowImg" src="@/static/icon/in-arrow.svg"/>
    </view>
    <arrow-list title="设置"/>
    <arrow-list title="关于"/>
  </view>
</template>

<script setup lang="ts">
// import arrowList from "../../components/arrow-list/arrow-list.vue"
import {ref} from 'vue'
import {removeAuthorization} from "@/utils/auth";
import {showModal} from "@/utils/utils";
import {onLoad} from "@dcloudio/uni-app";

let nickName = ref(''),
    phoneNumber = ref(''),
    avatar = ref('')

onLoad(() => {
  let userInfo = uni.getStorageSync("userInfo")
  nickName.value = userInfo.nickName
  phoneNumber.value = userInfo.phoneNumber
  avatar.value = userInfo.avatar
});

let goPage = (url:String)=>{
  uni.navigateTo({url})
}


</script>

<style scoped lang="scss">
@import url("./myStyle.scss");


</style>