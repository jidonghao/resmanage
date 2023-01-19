<template>
  <view class="arrow-list-item" :style="`margin-bottom:${props.showLine?'':'12upx'}`">
    <view class="title">{{ props.title }}</view>
    <view class="viewSlot">
      <slot v-if="!props.value"/>
      <view class="value" v-else>{{ props.value }}</view>
      <image class="arrow" src="@/static/icon/in-arrow.svg"/>
    </view>
  </view>
  <view class="showLine" v-if="props.showLine"/>
</template>
<script setup lang="ts">
const props = defineProps<{ title: String, value?:String, showLine?:boolean }>()
</script>

<style scoped lang="scss">
.arrow-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 30upx;
  padding: 24upx 32upx;
  box-sizing: border-box;
  background: white;

  &:active {
    background: #f3f2f2;
  }

  .viewSlot {
    display: flex;
    align-items: center;
    color: rgba(0, 0, 0, 0.8);

    .value {
      white-space: nowrap;
      width: 200upx;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: right;
    }

    .arrow {
      height: 40upx;
      width: 40upx;
    }
  }
}

.showLine {
  border-bottom: 1upx solid rgba(0, 0, 0, 0.2);
  margin-left: 32upx;
}
</style>