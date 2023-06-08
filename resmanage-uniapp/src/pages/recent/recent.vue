<template>
    <view class="nav-style" :style="{'height':statusBar.navHeight+'px','padding-top':statusBar.statusBarHeight+'px'}"
         >
        <view>最近项目</view>
        <view class="remove-recent" @click="removeRecent">
            <uni-icons type="minus" size="30" style="cursor: pointer"/>
        </view>
    </view>
  <view class="global--container">

  </view>
  <my-custom-tab-bar :index="0"/>
</template>

<script setup lang="ts">
import {onLoad, onShow} from "@dcloudio/uni-app";
import {checkLogin} from "@/utils/utils";
import {ref} from "vue";
import {showModal} from "@/utils/utils";
import file from "@/api/file";
let statusBar = ref({statusBarHeight: 1, navHeight: 1})

onLoad(() => {
    let {statusBarHeight = 0, system = ""} = uni.getSystemInfoSync()
    statusBar.value.statusBarHeight = statusBarHeight
    statusBar.value.navHeight = statusBarHeight + (system.indexOf('iOS') > -1 ? 44 : 48)
})
onShow(()=>{
    checkLogin()
})
function removeRecent(){
    showModal({content:'确定要移除最近访问的文件吗，不会删除源文件'}).then(()=>{
        file.removeAllQueryTimes().then(()=>{
            uni.showToast({title:'成功',icon:'success'})
        })
    }).catch(()=>{})
}
</script>

<style scoped lang="scss">
.nav-style {
    position: fixed;
    background: #f5f5f5;
    width: 100vw;
    display: flex;
    z-index: 998;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    padding: 0 12upx;
    font-size: 32upx;
    font-weight: bold;

    @media screen and (min-width: 1023px) {
        width: calc(100vw - 60px);
      left: 60px;
    }
}
.remove-recent{
  position: absolute;
  right: 12rpx;
}
</style>