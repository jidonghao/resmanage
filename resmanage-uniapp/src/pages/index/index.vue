<template>
  <view class="nav-style" :style="{'height':statusBar.navHeight+'px','padding-top':statusBar.statusBarHeight+'px'}"
        @click="closeMenu">
    <view class="filterBtn" @click.stop="showMenuHandler" :style="showMenu?'--background-color: dodgerblue':''">
      <view v-for="i in 3" :key="i"/>
    </view>
    <view class="searchInput">
      <uni-easyinput suffixIcon="search" type="text" v-model="searchValue" placeholder="搜索文件名" @iconClick="search"
                     @confirm="search" ConfirmType="search"/>
    </view>
  </view>
  <view class="topLeftMenu" :class="{'topLeftMenuHide':menuHideIng}" v-show="showMenu"
        :style="`top:${statusBar.navHeight}px`">
    <view v-for="item in topMenuOptions" :key="item.value" @click="selectMenu(item.value)" class="item"
          :style="`${item.hideBorder?'--border:0':''}`">{{ item.label }}
    </view>
  </view>

  <view class="container" @click="closeMenu" :style="`padding-top:${statusBar.navHeight}px`">
    <folder v-for="item in fileList" :key="item.id" :id="item.id" :isNew="item.isNew" :fileName="item.fileName"
            @click="clickFile(item)"/>
<!--    <view class="pH"/>-->
  </view>
</template>

<script setup lang="ts">
import file from "@/api/file";
// import forder from "../../components/folder/folder.vue"
import {ref, unref} from 'vue'
import {onLoad, onReady} from "@dcloudio/uni-app";

let statusBar = ref({statusBarHeight: 1, navHeight: 1})

onLoad(() => {
  let {statusBarHeight = 0, system = ""} = uni.getSystemInfoSync()
  statusBar.value.statusBarHeight = statusBarHeight
  statusBar.value.navHeight = statusBarHeight + (system.indexOf('iOS') > -1 ? 44 : 48)
})

let formQuery = ref({
      page: 1, limit: 20, folderId: -1, fileName: ""
    }),
    queryFolderIdList: Number[] = [-1],
    fileList: any = ref([]),
    queryGetList = () => {
      file.queryFile(unref(formQuery)).then((res: any) => {
        fileList.value = res.list
      }).catch(err => {

      })
    }

onReady(() => {
  queryGetList()
})

// 点击文件
let clickFile = (item: any) => {
  if (item.isNew) return false
  switch (item.type) {
    case 1: // 文件夹
      break
    case 2: // img
      break
    case 3: // video
      break
  }
}

// 顶部菜单
let showMenu = ref(false), menuHideIng = ref(false)
let searchValue = ref(""),
    search = () => {

    }
const topMenuOptions = ref([
  {label: "选择", value: 0},
  {label: "新建文件夹", value: 1},
  {label: "上传文件", value: 2, hideBorder: true}
])

let closeMenu = () => {
      if (showMenu.value) {
        menuHideIng.value = true
        setTimeout(() => {
          showMenu.value = false
          menuHideIng.value = false
        }, 250)
      }
    },
    showMenuHandler = () => {
      if (showMenu.value) {
        closeMenu()
      } else {
        showMenu.value = true
      }
    }, selectMenu = (e: number) => {
      closeMenu()
      switch (e) {
        case 0:
          break
        case 1:
          fileList.value.unshift({id: void 0, fileName: '新建文件夹', isNew: true})
          break
        case 2:
          break
      }
    }
</script>

<style scoped lang="scss">
.container {
  background: #fefefe;
  height: 100%;
  width: 100vw;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  overflow: scroll;
  overflow-x: hidden;

  .container_scroll__view {
    height: 200upx;
  }
}

.nav-style {
  position: fixed;
  background: #f5f5f5;
  width: 100vw;
  display: flex;
  z-index: 998;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  padding: 0 24upx;

  .searchInput {
    margin-left: 24upx;
    width: 420upx;
  }

  .filterBtn {
    cursor: pointer;
    --background-color: #3d3d3d;
    border: 4upx solid var(--background-color);
    border-radius: 50%;
    width: 40upx;
    height: 40upx;
    display: flex;
    align-items: center;
    justify-content: center;

    > view {
      width: 6upx;
      height: 6upx;
      background: var(--background-color);
      border-radius: 50%;
      margin: 0 1.6upx;
    }

    &:active {
      --background-color: dodgerblue;
    }
  }

}

.topLeftMenu {
  width: 320upx;
  z-index: 999;
  opacity: 0.95;
  height: auto;
  margin-left: 30upx;
  margin-top: 12upx;
  position: absolute;
  border-radius: 12upx;
  overflow: hidden;
  color: black;
  box-shadow: 0 0 20upx 10upx rgba(0, 0, 0, 0.2);
  transform-origin: left -12upx;
  animation: show 0.15s ease-in-out forwards;

  @keyframes show {
    0% {
      transform: scale(0);
    }
    90% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(1);
    }
  }

  .item {
    --border: 1upx;
    padding: 12upx;
    background: rgba(255, 255, 255, 1);
    border-bottom: var(--border) solid rgba(187, 187, 187, 0.6);

    &:active {
      background: #f5f5f5;
    }
  }
}

.topLeftMenuHide {
  animation: hide 0.15s ease-in forwards;
  @keyframes hide {
    0% {
      transform: scale(1);
    }
    10% {
      transform: scale(1.02);
    }
    100% {
      transform: scale(0);
    }
  }
}
</style>
