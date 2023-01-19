<template>
  <view class="container">
    <button @click="getInfo">获取信息</button>
    {{info}}
  </view>
</template>

<script setup lang="ts">
import manage from "@/api/manage";
import { ref } from 'vue'
let info = ref('空')

let getInfo = ()=>{
  manage.getInfo({}).then((res:any)=>{
    info.value = JSON.stringify(res)
  })
}
</script>

<style>

</style>
