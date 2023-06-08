<script setup lang="ts">

</script>

<template>
  <view class="isEmpty">
    <image src="@/image/isEmpty.svg"></image>
    <view>什么都没有~</view>
  </view>
</template>

<style scoped lang="scss">
.isEmpty {
  width: 100%;
  height: 500rpx;
  max-height: 100%;
  padding: 60rpx 40rpx 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  opacity: 0.6;

  image {
    margin-bottom: 20rpx;
  }
}
</style>