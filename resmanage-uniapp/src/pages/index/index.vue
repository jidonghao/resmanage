<template>
        <view class="nav-style" :style="{'height':statusBar.navHeight+'px','padding-top':statusBar.statusBarHeight+'px'}"
              @click="closeMenu">
            <view class="filterBtn" @click.stop="showMenuHandler" :style="showMenu?'--background-color: dodgerblue':''">
                <view v-for="i in 3" :key="i"/>
            </view>
            <view class="searchInput">
                <uni-easyinput suffixIcon="search" type="text" v-model="searchValue" placeholder="搜索文件名" @iconClick.stop="search"
                               @confirm="search" ConfirmType="search"/>
            </view>
        </view>
        <view class="topLeftMenu" :class="{'topLeftMenuHide':menuHideIng}" v-show="showMenu"
              :style="`top:${statusBar.navHeight}px`">
            <view v-for="item in topMenuOptions" :key="item.value" @click.stop="selectMenu(item.value)" class="item"
                  :style="`${item.hideBorder?'--border:0':''}`">{{ item.label }}
            </view>
        </view>
    <scroll-view class="container" :refresher-threshold="100" scroll-y  :style="`padding-top:${statusBar.navHeight}px;`"
                 refresher-enabled :refresher-triggered="refreshing" @refresherpulling="pullDown"
                 @scrolltolower="getMoreList" lower-threshold="100px">
        <view class="scroll-container">
            <folder v-for="item in fileList" :key="item.id" :id="item.id" :isNew="item.isNew" :fileName="item.fileName"
                    @click.stop="clickFile(item)"/>
        </view>
    </scroll-view>

<!--        <view class="container" @click="closeMenu" :style="`padding-top:${statusBar.navHeight}px`">-->
<!--            <folder v-for="item in fileList" :key="item.id" :id="item.id" :isNew="item.isNew" :fileName="item.fileName"-->
<!--                    @click.stop="clickFile(item)"/>-->
<!--            &lt;!&ndash;    <view class="pH"/>&ndash;&gt;-->
<!--        </view>-->
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
    total = ref(0),pages=ref(0),list = ref<any[]>([]),refreshing=ref(false),
    queryFolderIdList: Number[] = [-1],
    fileList: any = ref([]),
    queryGetList = (showTips=false) => {
      file.queryFile(unref(formQuery)).then((res: any) => {
          if(formQuery.value.page===1){
              fileList.value = res.list
          }else{
              fileList.value = [...fileList.value,...res.list]
          }
          total.value = res.total
          pages.value = res.pages
          if(showTips){
              setTimeout(()=>{
                  refreshing.value=false
                  uni.showToast({
                      title:'加载成功',
                      icon:'none'
                  })
              },600)
          }
      }).catch(err => {
          console.error(err)
          uni.showToast({
              title:err.errMsg||'加载失败',
              icon:'none'
          })
          refreshing.value=false
      })
    }
function pullDown(){
    formQuery.value.page = 1
    refreshing.value=true
    queryGetList(true)
}
function getMoreList(){
    if(pages.value>formQuery.value.page++){
        queryGetList()
    }else{
        uni.showToast({
            title:'没有更多了',
            icon:'none'
        })
    }
}
onReady(() => {
  queryGetList()
})

const folderShowList = [-1]
// 点击文件
let clickFile = (item: any) => {
    completeAddFolder()
  if (item.isNew||isAddFolder.value) return false
  switch (item.type) {
    case 1: // 文件夹
   // 点击文件夹时需做处理：点击的文件夹id入栈，返回时出栈
        console.log(item.id)
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
const isAddFolder = ref(false) // 是否正新增文件夹
let editFileIndex = -1
/**
 * 完成文件夹编辑
 */
function completeAddFolder(){
    if(!isAddFolder.value||editFileIndex === -1)return false
    console.log("完成文件夹编辑")
    uni.showLoading({title:'保存中'})
    file.addFolder({folderName:fileList.value[editFileIndex].fileName}).then((res:any)=>{
        fileList.value[editFileIndex].id = res.id
        isAddFolder.value = false
        fileList.value[editFileIndex].isNew = false
    }).catch((err:any)=>{
        uni.showToast({
            title:err.errMsg||'系统繁忙，请稍后再试',
            icon:'none'
        })
    }).finally(()=>{
        uni.hideLoading()
    })
}

let closeMenu = () => {
   completeAddFolder()
      if (showMenu.value) {
        menuHideIng.value = true
        setTimeout(() => {
          showMenu.value = false
          menuHideIng.value = false
        }, 250)
      }
    },
    showMenuHandler = () => {
    if(isAddFolder.value) return false
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
          fileList.value.unshift({id: -1, fileName: '新建文件夹', isNew: true})
            editFileIndex = 0
          isAddFolder.value = true
          break
        case 2:
          break
      }
    }
</script>

<style scoped lang="scss">
.container {
  padding: 0;
  background: #fefefe;
  height: calc(100vh - 50px) ;
  width: 100vw;
  //display: flex;
  //flex-direction: row;
  //flex-wrap: wrap;
  //align-content: flex-start;
  overflow: scroll;
  overflow-x: hidden;

  .container_scroll__view {
    height: 200upx;
  }
}
.scroll-container{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
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
