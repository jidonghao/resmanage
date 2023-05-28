<template>
    <view class="global--container">
        <view class="nav-style" :style="{'height':statusBar.navHeight+'px','padding-top':statusBar.statusBarHeight+'px'}"
              @click="closeMenu">
            <view class="leftControl" @click="goBackFolder">
                <uni-icons type="back" size="24" style="margin-left: 10upx"  v-if="folderShowList.length>1"/>
                <view class="leftControl--label"  v-if="folderShowList.length>1">{{folderShowList[folderShowList.length-1].label}}</view>
            </view>
            <view class="rightControl" :class="{'scaleRightControl':folderShowList.length>1}">
                <view class="searchInput">
                    <uni-easyinput suffixIcon="search" type="text" v-model="searchValue" placeholder="搜索文件名" @iconClick.stop="search"
                                   @confirm="search" ConfirmType="search"/>
                </view>
                <view class="filterBtn" @click.stop="showMenuHandler" :style="showMenu?'--background-color: dodgerblue':''">
                    <view v-for="i in 3" :key="i"/>
                </view>
            </view>
        </view>
        <view class="topLeftMenu menu" :class="{'topLeftMenuHide':menuHideIng}" v-show="showMenu"
              :style="`top:${statusBar.navHeight}px`">
            <view v-for="item in topMenuOptions" :key="item.value" @click.stop="selectMenu(item.value)" class="item"
                  :style="`${item.hideBorder?'--border:0':''}`">{{ item.label }}
            </view>
        </view>
    <scroll-view class="container" :refresher-threshold="100" :scroll-y="enableScroll"
                 :style="`padding-top:${statusBar.navHeight}px;`"
                 refresher-enabled :refresher-triggered="refreshing" @refresherpulling="pullDown"
                 @scrolltolower="getMoreList" lower-threshold="100px" @click="completeAddFolder">
        <view class="scroll-container">
            <folder v-for="(item,i) in fileList" :index="i" :filePath="item.filePath" :typeDetail="item.typeDetail"
                    :key="item.id" :id="item.id" :isNew="item.isNew" :fileName="item.fileName" :showMenu="item.showMenu"
                    :fullType="item.fullType" @click.stop="clickFile(item)"  @longpress.stop="showFileMenu($event,item,+i)"
                    @onChange="fileDetailChange" @completeAddFolder="completeAddFolder" @closeMenu="closeFileMenu($event,item,+i)"/>
        </view>
    </scroll-view>

        <uni-popup ref="previewPopup" type="center" :animation="false">
            <view class="popup-content" @click="closePreviewPopup">
              <image mode="aspectFit" v-if="nowDisplayItem.type === 'image'" :src="nowDisplayItem.filePath"></image>
              <video controls object-fit="contain" muted v-if="nowDisplayItem.type === 'video'" :src="nowDisplayItem.filePath"></video>
            </view>
        </uni-popup>
    </view>
    <my-custom-tab-bar :index="1"/>
</template>

<script setup lang="ts">
import file from "@/api/file";
// import forder from "../../components/folder/folder.vue"
import {ref, unref} from 'vue'
import {onLoad, onReady} from "@dcloudio/uni-app";
import login from "@/api/login";
import {showModal} from "@/utils/utils";
import {uploadFile} from "@/api/upload";
import eventBus from "@/utils/event-bus";

let statusBar = ref({statusBarHeight: 1, navHeight: 1})

onLoad(() => {
  let {statusBarHeight = 0, system = ""} = uni.getSystemInfoSync()
  statusBar.value.statusBarHeight = statusBarHeight
  statusBar.value.navHeight = statusBarHeight + (system.indexOf('iOS') > -1 ? 44 : 48)
})

let formQuery = ref({
      page: 1, limit: 100, folderId: -1, fileName: ""
    }),
    total = ref(0),pages=ref(0),list = ref<any[]>([]),refreshing=ref(false),
    queryFolderIdList: Number[] = [-1],
    fileList: any = ref([]),
    queryGetList = (showTips=false) => {
      formQuery.value.folderId = folderShowList.value[folderShowList.value.length-1].id

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
const enableScroll = ref(true)
function showFileMenu(event:Event,item:any,i:number){
    fileList.value[i].showMenu = true
    enableScroll.value = false
    // isAddFolder.value = true
    // console.log(event.target.)
    event.preventDefault()
    return false
}
function closeFileMenu(event:Event,item:any,i:number){
    fileList.value[i].showMenu = false
    enableScroll.value = true
    event.preventDefault()
    return false
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
    eventBus.on('onUploadProgress', (response:any) => {
        const res = response.res
        console.log('上传进度' + response.progress);
        console.log('已经上传的数据长度' + res.totalBytesSent);
        console.log('预期需要上传的数据总长度' + res.totalBytesExpectedToSend);
    })
})

const folderShowList = ref([
    {label: '/',id: -1}
])
function fileDetailChange(e: { value:String,index:String|Number }){
    fileList.value[+e.index].fileName = e.value
}
function goBackFolder(){
    folderShowList.value.pop()
    formQuery.value.page = 1
    formQuery.value.folderId = folderShowList.value[  folderShowList.value.length-1].id
    queryGetList()
}
// 点击文件
const previewPopup:any|null = ref(null), nowDisplayItem:any = ref()
function closePreviewPopup(){
    previewPopup.value.close()
}
let clickFile = (item: any) => {
  if (item.isNew) return false
    // completeAddFolder()
  if(isAddFolder.value) return false
  const type = item.fullType?.split('/')[0]||''
      switch (type) {
        case 'folder': // 文件夹
       // 点击文件夹时需做处理：点击的文件夹id入栈，返回时出栈
            folderShowList.value.push({
                label: item.fileName,
                id: item.id
            })
            formQuery.value.page = 1
            queryGetList()
          break
        case 'image': // img
        case 'video': // video
            previewPopup.value.open()
            nowDisplayItem.value = {...item, type}
          break
      default:
          uni.showToast({
              title: '未知类型，暂不支持在线预览', icon: 'none'
          })
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
    closeMenu()
    if(!isAddFolder.value||editFileIndex === -1)return false
    uni.showLoading({title:'保存中'})
    file.addFolder({
        folderName:fileList.value[editFileIndex].fileName,
        folderId: folderShowList.value[folderShowList.value.length-1].id
    }).then((res:any)=>{
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
   // completeAddFolder()
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
          fileList.value.unshift({id: -1, fileName: '新建文件夹', isNew: true,fullType:'folder'})
            editFileIndex = 0
          isAddFolder.value = true
          break
        case 2:
            uploadFileFun()
          break
      }
    }

function uploadFileFun(){
    uni.chooseFile({
        count: 9,
        success: (res) => {
            uni.showLoading({title:'正在上传',mask: true})
            let filesList = res.tempFilePaths,tempFiles = res.tempFiles
            if(filesList instanceof Array && tempFiles instanceof Array){
                let files: UniApp.UploadFileOptionFiles[] | { name: string; uri: string; }[] = [],typeList:any=[]
                filesList.forEach(item=>{
                    files.push({name:'file',uri:item})
                })

                tempFiles.forEach((item:any)=>{
                    typeList.push(item.type)
                })
                uploadFile(files, 'default' ,{folderId:folderShowList.value[folderShowList.value.length-1].id,typeList}).then((res:any)=>{
                    // console.log(res.fileList)
                    uni.hideLoading()
                    queryGetList()
                }).catch(()=>{
                    showModal({content:'上传文件失败，请稍后再试',showCancel:false})
                })
            }
        }
    })
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
  //display: flex;
  //flex-direction: row;
  //flex-wrap: wrap;
  //align-content: flex-start;
}

.nav-style {
  position: fixed;
  background: #f5f5f5;
  width: 100vw;
  display: flex;
  z-index: 998;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
  padding: 0 12upx;

    @media screen and (min-width: 1023px) {
        width: calc(100vw - 60px);
    }

  .leftControl{
    display: flex;
    //max-width: 360upx;
    align-items: center;
      animation: leftControl 0.5s 0 ease-in-out;
      overflow: hidden;

      @keyframes leftControl {
          0%{
              width: 0;
          }
          100%{
              width: 400upx;
          }
      }

    .leftControl--label{
      width: 100%;
      white-space: nowrap;
      padding-right: 24upx;
      font-size: 30upx;
      //text-overflow: ellipsis;
      overflow: hidden;
    }
  }
  .rightControl{
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 750rpx;
      transition: all 0.2s;
      .searchInput {
          margin-left: 24upx;
          width: 100%;
      }
      .filterBtn{
          flex-shrink: 0;
      }
  }
    .scaleRightControl{
        @media screen and (max-width: 1023px) {
            width: 500rpx;
        }
    }

  .filterBtn {
    margin-left: 16upx;
    cursor: pointer;
    --background-color: #3d3d3d;
    border: 4upx solid var(--background-color);
    border-radius: 50%;
    width: 36rpx;
    height: 36rpx;
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
  margin-right: 30upx;
  margin-top: 12upx;
  position: absolute;
  top: 0;
  right: 0;
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

.navbar--address{
    height: 56upx;
    width: 100vw;
  overflow: hidden;
  box-sizing: border-box;
    background: #f5f5f5;
    position: fixed;
  display: flex;
  align-items: center;
justify-content: flex-start;
  z-index: 99;
.address{
  width: 100%;
  padding: 0 12upx;
  box-sizing: border-box;
  height: 96%;
  border-radius: 12upx;
  margin-left: 24upx;
  margin-bottom: 6upx;
  background: white;
  display: flex;
  align-items: center;
  overflow-x: scroll;
  overflow-y: hidden;
  view{
    font-size: 20upx;
    padding: 0 12upx;
    border-radius: 6upx;
    margin-right: 4upx;
    background: whitesmoke;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
}
.popup-content{
    width: 60vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    image{
        width: 100%;
    }
    video{
        width: 100%;
        height: 40%;
    }
    @media screen and (max-width: 1024px) {
        width: 750rpx;
        image{
            height: 80%;
        }
    }
}
</style>
