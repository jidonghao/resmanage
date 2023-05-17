<template>
  <view class="folder-folder" @longpress="showMenu">
    <image class="folder-img" v-if="!props.imgPath&&!props.videoPath" src="@/static/icon/folder.svg"/>

    <view v-if="props.imgPath" class="folder-img-view">
      <image class="isImg" mode="widthFix" :src="props.imgPath"/>
    </view>

    <view v-if="props.videoPath" class="folder-img-view">
      <image class="isImg isVideo" mode="widthFix" :src="props.videoPath"/>
      <image class="videoStart" mode="widthFix" src="@/static/icon/start-white.svg"/>
    </view>

    <view v-if="!props.isNew" class="file-name">{{ props.fileName }}</view>
    <textarea auto-height maxlength="24" class="file-name-input" v-else type="text" v-model="fileName" autofocus
              confirm-type="done"/>
  </view>
</template>

<script setup lang="ts">
import {ref} from 'vue'

const props = defineProps<{ id?: Number, fileName: String, imgPath?: String, videoPath?: String, isNew?: Boolean }>()
let fileName = ref(props.fileName), showMenuFlag = ref(false)
let showMenu = (e:any) => {
  console.log(e)
  showMenuFlag.value = true
  e.preventDefault()
  return false
}
</script>

<style scoped lang="scss">
.folder-folder {
  cursor: pointer;
  padding: 12upx;
  margin: 12upx;
  margin-right: 0;
  width: 200upx;
  text-align: center;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  border-radius: 12upx;

  .folder-img {
    width: 140upx;
    height: 140upx;

    &:active {
      opacity: 0.6;
    }
  }

  .folder-img-view {
    position: relative;
    width: 100%;
    height: 140upx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .isImg {
    margin: 0;
    width: 140upx;
    max-height: 100%;
    border: 10upx double #d2d2d2;
  }

  .isVideo {
    border: 12upx double #bebebe;
  }

  .videoStart {
    position: absolute;
    width: 60upx;
    opacity: 0.9;
  }

  .file-name, .file-name-input {
    font-size: 26upx;
  }

  .file-name-input {
    width: 180upx;
    padding: 6upx 12upx;
    position: absolute;
    z-index: 9;
    top: 140upx;
    background: rgba(240, 240, 240, 0.9);
    border-radius: 12upx;
  }
}
</style>