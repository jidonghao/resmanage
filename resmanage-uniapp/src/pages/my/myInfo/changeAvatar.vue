<template>
  <view class="nav-style" :style="{'height':statusBar.navHeight+'px','padding-top':statusBar.statusBarHeight+'px'}">
    <uni-icons type="back" @click="goBack" size="26"/>
    <view class="title">头像</view>
<!--    <view>修改</view>-->
    <uni-icons type="cloud-upload-filled" @click="chooseImg" size="30"></uni-icons>
  </view>
  <view class="contain">
    <image class="avatar" mode="widthFix" :src="avatar"></image>
  </view>
</template>

<script setup lang="ts">
// #ifdef H5
import {ref} from "vue";
import {onLoad, onShow} from "@dcloudio/uni-app";
import {uploadFile} from "@/api/upload";
import login from "@/api/login"
import {showModal} from "@/utils/utils";

document.body.style.overflow = 'hidden'
// #endif

let statusBar = ref({statusBarHeight: 1, navHeight: 1}),
    avatar = ref("")

onLoad(() => {
  let {statusBarHeight = 0, system = ""} = uni.getSystemInfoSync()
  statusBar.value.statusBarHeight = statusBarHeight
  statusBar.value.navHeight = statusBarHeight + (system.indexOf('iOS') > -1 ? 44 : 48)

  avatar.value = uni.getStorageSync("userInfo").avatar
})

let imageValue = ref([]),
    goBack = () => {
      uni.navigateBack()
    }
let chooseImg = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      let filesList = res.tempFilePaths
      if(filesList instanceof Array){
        let files: UniApp.UploadFileOptionFiles[] | { name: string; uri: string; }[] = []
        filesList.forEach(item=>{
          files.push({name:'file',uri:item})
        })
        uploadFile(files).then((res:any)=>{
          console.log(res.fileList[0])
          login.changeAvatar({avatar:res.fileList[0]}).then(() => {
            avatar.value =  res.fileList[0]
            showModal({title: "提示", content: "更换成功", showCancel: false}).then(() => {
              let userInfo = uni.getStorageSync("userInfo")
              userInfo.avatar = res.fileList[0]
              uni.setStorageSync("userInfo", userInfo)
              uni.navigateBack()
            })
          }).catch((err: any) => {
            showModal({title: "提示", content: err.errMsg || "操作失败", showCancel: false}).then(() => {
            })
          })

        }).catch(()=>{
          showModal({content:'上传文件失败，请稍后再试',showCancel:false})
        })
      }
    }
  })
},downLoad = () => {
  // #ifdef H5
  download()

  function download() {
    let blob = new Blob([avatar.value], {
      type: 'text/plain'
    });
    const blobUrl = window.URL.createObjectURL(blob);
    download(blobUrl);
    window.URL.revokeObjectURL(blobUrl);

    function download(href: any, filename = '') {
      const a = document.createElement('a');
      a.download = filename;
      a.href = href;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  // #endif
  uni.showLoading({title: "请稍后"})
  uni.downloadFile({
    url: avatar.value, //仅为示例，并非真实的资源
    success: (res) => {
      if (res.statusCode === 200) {
        console.log('下载成功');
      }
    },
    complete: () => {
      uni.hideLoading()
    }
  });
}
let showMenu = () => {
  uni.showActionSheet({
    itemList: ['修改头像', '保存头像'],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          chooseImg()
          break
        case 1:
          downLoad()
          break
      }
    }
  })
}

</script>

<style scoped lang="scss">
.contain {
  height: 100vh;
  width: 100vw;
  background: black;
  overflow: hidden;
  padding-top: 48upx;
  display: flex;
  justify-content: center;
  align-items: center;

  .avatar {
    width: 100%;
  }
}

.nav-style {
  position: fixed;
  background: #f5f5f5;
  width: 100vw;
  display: flex;
  z-index: 998;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 18upx;


}
</style>
