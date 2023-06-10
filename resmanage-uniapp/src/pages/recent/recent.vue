<template>
    <view class="nav-style" :style="{'height':statusBar.navHeight+'px','padding-top':statusBar.statusBarHeight+'px'}"
         >
        <view>最近项目</view>
        <view class="remove-recent" @click="removeRecent">
            <uni-icons type="minus" size="30" style="cursor: pointer"/>
        </view>
    </view>
  <view class="global--container">
      <scroll-view class="container" :refresher-threshold="100" :scroll-y="enableScroll"
                   :style="`padding-top:${statusBar.navHeight}px;`"
                   refresher-enabled :refresher-triggered="refreshing" @refresherpulling="pullDown"
                   @scrolltolower="getMoreList" lower-threshold="100px" @click="completeAddFolder">
          <view class="scroll-container">
              <IsEmpty v-if="fileList.length===0">暂无数据</IsEmpty>
              <folder
                      v-for="(item, i) in fileList"
                      class="folder" :style="`animation-delay: ${i * 0.01}s`"
                      :index="i"
                      :filePath="item.filePath"
                      :typeDetail="item.typeDetail"
                      :key="item.id"
                      :id="item.id"
                      :isNew="item.isNew"
                      :fileName="item.fileName"
                      :showMenu="item.showMenu"
                      :fullType="item.fullType"
                      @click.stop="clickFile($event, item)"
                      @touchstart.stop="touchStart($event, item, i)"
                      @touchend.stop="touchEnd"
                      @touchmove.stop="touchMove"
                      @onChange="fileDetailChange"
                      @completeAddFolder="completeAddFolder"
                      @closeMenu="closeFileMenu"
                      @completeEditFile="completeEditFile"
                      @contextmenu.prevent="showFileMenu($event, item, i)"
              />
          </view>
      </scroll-view>
  </view>
    <uni-popup ref="previewPopup" type="center" :animation="false">
        <view class="popup-content" @click="closePreviewPopup">
            <image mode="aspectFit" v-if="nowDisplayItem.type === 'image'" :src="nowDisplayItem.filePath"></image>
            <video controls object-fit="contain" muted v-if="nowDisplayItem.type === 'video'"
                   :src="nowDisplayItem.filePath"></video>
        </view>
    </uni-popup>
  <my-custom-tab-bar :index="0"/>
</template>

<script setup lang="ts">
import {onLoad, onShow} from "@dcloudio/uni-app";
import {checkLogin} from "@/utils/utils";
import {ref, unref} from "vue";
import {showModal} from "@/utils/utils";
import file from "@/api/file";
import IsEmpty from "@/components/isEmpty/isEmpty.vue";
let statusBar = ref({statusBarHeight: 1, navHeight: 1})

onLoad(() => {
    let {statusBarHeight = 0, system = ""} = uni.getSystemInfoSync()
    statusBar.value.statusBarHeight = statusBarHeight
    statusBar.value.navHeight = statusBarHeight + (system.indexOf('iOS') > -1 ? 44 : 48)
})
onShow(()=>{
    checkLogin()
    queryGetList()
})
function closePreviewPopup() {
    previewPopup.value.close()
}
function closeFileMenu(event?: any) {
    showFileMenuShow.value = false
    enableScroll.value = true
    return false
}
function getMoreList() {
    if (pages.value > formQuery.value.page++) {
        queryGetList()
    } else {
        uni.showToast({
            title: '没有更多了',
            icon: 'none'
        })
    }
}
function completeEditFile() {
    if(selectItemIndex.value===-1)return false
    if (!fileList.value[selectItemIndex.value].fileName) {
        showModal({content: '文件名不能为空', showCancel: false}).then(() => {

        })
    }
    file.updateFileName({
        fileId: fileList.value[selectItemIndex.value].id,
        fileName: fileList.value[selectItemIndex.value].fileName
    }).then(() => {
        uni.showToast({title: '修改成功'})
        fileList.value[selectItemIndex.value].isNew = false
    }).catch((err: any) => {
        showModal({content: err.errMsg || '操作失败，请稍后重试',}).then(() => {
        })
    })
}

let editFileIndex = -1
/**
 * 完成文件夹编辑
 */
function completeAddFolder() {
    if (!isAddFolder.value || editFileIndex === -1) return false
    uni.showLoading({title: '保存中'})
    file.addFolder({
        folderName: fileList.value[editFileIndex].fileName,
        folderId: folderShowList.value[folderShowList.value.length - 1].id
    }).then((res: any) => {
        fileList.value[editFileIndex].id = res.id
        isAddFolder.value = false
        fileList.value[editFileIndex].isNew = false
    }).catch((err: any) => {
        uni.showToast({
            title: err.errMsg || '系统繁忙，请稍后再试',
            icon: 'none'
        })
    }).finally(() => {
        uni.hideLoading()
    })
}
function fileDetailChange(e: { value: String, index: String | Number }) {
    fileList.value[+e.index].fileName = e.value
}

const folderShowList = ref([
    {label: '/', id: -1}
])
const previewPopup: any | null = ref(null), nowDisplayItem: any = ref()

const isAddFolder = ref(false) // 是否正新增文件夹
const timer = ref<any>(null);
const isLongPress = ref(false);
let clickFile = (event: any, item: any) => {
    if (isLongPress.value) return false
    if (item.isNew) return false
    // completeAddFolder()
    if (isAddFolder.value) return false
    const type = item.fullType?.split('/')[0] || ''
    switch (type) {
        case 'folder': // 文件夹

            break
        case 'image': // img
        case 'video': // video
            previewPopup.value.open()
            nowDisplayItem.value = {...item, type}
            break
        default:
            uni.showToast({
                title: '该文件类型暂不支持在线预览', icon: 'none'
            })
            break
    }
}

const touchStart = (event: any, item: any, i: number) => {
    isLongPress.value = false;
    timer.value = setTimeout(() => {
        isLongPress.value = true;
        showFileMenu(event, item, i, 'longpress');
    }, 600);
};
const enableScroll = ref(true),
    showFileMenuShow = ref(false),
    fileMenuPlace = ref({x: 0, y: 0}), selectItemIndex = ref(-1)

function showFileMenu(event: any, item: any, i: number, longPress?: string) {
    if (selectItemIndex.value !== -1 && fileList.value[selectItemIndex.value].id)
        fileList.value[selectItemIndex.value].isNew = false

    selectItemIndex.value = i
    let x, y;
    if (longPress) {
        x = event.changedTouches[0].clientX || 0;
        y = event.changedTouches[0].clientY - 30 || 0;
        // 检查菜单是否会超出窗口的右边缘
        const menuWidth = 240; // 这里设置你的菜单的宽度

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth;
        }
    } else {
        x = event.pageX - 50 || 0;
        y = event.pageY - 30 || 0;
        // 检查菜单是否会超出窗口的右边缘
        const menuWidth = 320; // 这里设置你的菜单的宽度

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth;
        }
    }

    fileMenuPlace.value = {
        x,
        y
    }
    showFileMenuShow.value = true
    enableScroll.value = false
    event.preventDefault()
    return false
}

const touchEnd = () => {
    clearTimeout(timer.value);
};

const touchMove = () => {
    clearTimeout(timer.value);
};
const formQuery = ref<{page:number, limit: number}>({
        page: 1, limit: 100
    }),
    total = ref(0), pages = ref(0), list = ref<any[]>([]), refreshing = ref(false),
    fileList: any = ref([]),
    queryGetList = (showTips = false) => {

        file.getRecentlyViewedFiles(unref(formQuery)).then((res: any) => {
            if (formQuery.value.page === 1) {
                fileList.value = res.list
            } else {
                fileList.value = [...fileList.value, ...res.list]
            }
            total.value = res.total
            pages.value = res.pages
            if (showTips) {
                setTimeout(() => {
                    refreshing.value = false
                    uni.showToast({
                        title: '加载成功',
                        icon: 'none'
                    })
                }, 600)
            }
        }).catch(err => {
            console.error(err)
            uni.showToast({
                title: err.errMsg || '加载失败',
                icon: 'none'
            })
            refreshing.value = false
        })
    }

function pullDown() {
    formQuery.value.page = 1
    refreshing.value = true
    queryGetList(true)
}

  function removeRecent(){
    showModal({content:'确定要移除最近访问的文件吗，不会删除源文件'}).then(()=>{
    file.removeAllQueryTimes().then(()=>{
        uni.showToast({title:'成功',icon:'success'})
        formQuery.value.page = 1
        queryGetList()
    })
  }).catch(()=>{})
}
</script>

<style scoped lang="scss">
.folder {
  opacity: 0;
  animation: showFolder 0.3s linear forwards;

  @keyframes showFolder {
    0% {
      opacity: 0;
      //transform: scale(1.1);
    }
    100% {
      opacity: 1;
      //transform: scale(1);
    }
  }
}

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

.popup-content {
  width: 60vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  image {
    width: 100%;
  }

  video {
    width: 100%;
    height: 40%;
  }

  @media screen and (max-width: 1024px) {
    width: 750rpx;
    image {
      height: 80%;
    }
  }
}
</style>