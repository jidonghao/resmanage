<template>
  <view class="contain global--container">
    <view class="myInfo item" @click="goPage('/pages/my/myInfo/myInfo')">
      <image class="avatar" :src="avatar"/>
      <view>
        <view class="nickName">{{ nickName || "用户0121211111" }}</view>
<!--        <view class="phoneNumber">+86 {{ phoneNumber }}</view>-->
      </view>
      <image class="arrowImg" src="@/static/icon/in-arrow.svg"/>
    </view>
    <arrow-list title="标签设置"/>
<!--    <arrow-list title="关于"/>-->
  </view>
    <my-custom-tab-bar :index="2"/>
</template>

<script setup lang="ts">
// import arrowList from "../../components/arrow-list/arrow-list.vue"
import {ref} from 'vue'
import {getAuthorization, removeAuthorization} from "@/utils/auth";
import {checkLogin, showModal} from "@/utils/utils";
import {onLoad, onShow} from "@dcloudio/uni-app";
import routingIntercept from "@/utils/permission";

let nickName = ref(''),
    phoneNumber = ref(''),
    avatar = ref('')

onShow(() => {
  let userInfo = uni.getStorageSync("userInfo")
  nickName.value = userInfo.nickName
  phoneNumber.value = userInfo.phoneNumber
  avatar.value = userInfo.avatar
});

let goPage = (url: String) => {
  uni.navigateTo({url})
}
onShow(()=>{
    checkLogin()
})

</script>

<style scoped lang="scss">
@import url("./myStyle.scss");


</style>