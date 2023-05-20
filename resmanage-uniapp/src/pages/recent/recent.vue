<template>
  <view class="global--container">

  </view>
  <my-custom-tab-bar :index="0"/>
</template>

<script setup lang="ts">
import {onShow} from "@dcloudio/uni-app";
import {checkLogin} from "@/utils/utils";

onShow(()=>{
    checkLogin()
})

</script>

<style scoped lang="">

</style>