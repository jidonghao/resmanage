<template>
    <view class="global--container">
        <scroll-view class="container" :refresher-threshold="100" :scroll-y="true"
                     refresher-enabled :refresher-triggered="refreshing" @refresherpulling="pullDown"
                     lower-threshold="100px">
            <view class="scroll-container">
                <view class="label-item" @click="editLabelFun(null,-1)">
                    <view class="label-title">新增标签</view>
                    <uni-icons type="plus" block size="14"></uni-icons>
                </view>
                <view class="label-item" v-for="(item,i) in labelList" :style="`background: white;animation-delay: ${i*0.01}s`"
                      @click="setCheckedToItem(item,i)">
                    <view class="label-title">
                        <checkbox v-if="props.fileId!==-1" class="checkbox"
                                  :value="item.isChecked" :checked="item.isChecked"
                                  @click="setCheckedToItem(item,i)"/>
                        <view>{{ item.labelName }}</view>
                    </view>
                    <view style="display: flex;justify-content: center;align-items: center">
                        <button class="edit" size="mini" @click="editLabelFun(item,i)">
                            <uni-icons type="compose" block size="14"></uni-icons>
                        </button>
                        <button class="edit delete" size="mini" @click.stop="delLabel(item,i)">
                            <uni-icons type="trash-filled" block size="14" color="white"></uni-icons>
                        </button>
                    </view>
                </view>
            </view>
        </scroll-view>
    </view>
    <uni-popup ref="editDialog" type="dialog">
        <uni-popup-dialog ref="inputClose" mode="input" :title="editLabel.editIndex!==-1?'修改标签名称':'新增标签'"
                          :before-close="true" @close="editDialogClose" :value="editLabel.labelName"
                          placeholder="请输入名称" @confirm="editDialogConfirm">

        </uni-popup-dialog>
    </uni-popup>
</template>

<script setup lang="ts">
import {onLoad} from "@dcloudio/uni-app";
import {ref, unref} from "vue";
import file from "@/api/file";
import {showModal} from "@/utils/utils";
const props = defineProps<{ fileId: number,labels: [],index?: number }>()
const emit = defineEmits<{
    onLabelChange: (e: { labels: [], index: number }) => void
}>()
const editDialog = ref<any>(), editLabel = ref<any>({labelName: '', editIndex: -1})
onLoad(() => {
    getList()
})

function callBackLabelChange(){
    let newLabelList: number[] = []
    newLabelList = labelList.value.filter((v: { isChecked: boolean, id: number }) => v.isChecked)
        .map((v: { isChecked: boolean, id: number }) => v.id);
    emit("onLabelChange",{labels:newLabelList,index:props.index})
}

function setChecked(){
    labelList.value.forEach((item:any)=>{
        props.labels.forEach(v=>{
            if(item.id === v){
                item.isChecked = true
            }
        })
    })
}

function setCheckedToItem(item:any,i:number){
    labelList.value[i].isChecked = !labelList.value[i].isChecked
    callBackLabelChange()
    if(!props.fileId)return false
    if(item.isChecked){
        file.addLabelToItem({fileId:props.fileId,labelId:item.id}).then()
    }else{
        file.removeLabelFromItem({fileId:props.fileId,labelId:item.id}).then()
    }
}

function editLabelFun(item: any, i: number) {
    if (!item) {
        editLabel.value.labelName = ""
    } else {
        editLabel.value = JSON.parse(JSON.stringify(item))
    }
    editLabel.value.editIndex = i
    editDialog.value.open()
}

function delLabel(item: any, i: number) {
    showModal({content: '确定要删除该标签吗？与该标签绑定的文件不会被删除'}).then(() => {
        file.deleteLabel({labelId: item.id}).then(() => {
            uni.showToast({title: "删除成功", icon: 'success'})
            labelList.value.splice(i, 1)
            if(props.fileId!==-1){
                callBackLabelChange()
            }
        }).catch((err: any) => {
            uni.showModal({title: "提示", content: err.errMsg || "操作失败", showCancel: false})
        })
    })
}

function editDialogClose() {
    editDialog.value.close()
}

function editDialogConfirm(val: string) {
    if (!val) {
        uni.showToast({title: '名称不能为空', icon: "none"})
        return false
    }
    if (val.length > 10) {
        uni.showToast({title: '名称最长十个字符', icon: "none"})
        return false
    }

    editLabel.value.labelName = val
    if (editLabel.value.editIndex === -1) {
        file.addLabel({labelName: editLabel.value.labelName}).then((res: any) => {
            // labelList.value[editLabel.value.editIndex].labelName = editLabel.value.labelName
            labelList.value.push({id: res.id, labelName: editLabel.value.labelName})
            editDialog.value.close()
            uni.showToast({title: '添加成功', icon: 'success'})
        }).catch((err: any) => {
            uni.showModal({title: "提示", content: err.errMsg || "操作失败", showCancel: false})
        })
    } else {
        file.updateLabel({labelId: editLabel.value.id, labelName: editLabel.value.labelName}).then(() => {
            labelList.value[editLabel.value.editIndex].labelName = editLabel.value.labelName
            editDialog.value.close()
        }).catch((err: any) => {
            uni.showModal({title: "提示", content: err.errMsg || "操作失败", showCancel: false})
        })
    }


}

const refreshing = ref(false)

function pullDown() {
    refreshing.value = true
    getList(true)
}

const labelList = ref<any>([])

function getList(showTips = false) {
    file.getLabels().then((res: any) => {
        labelList.value = res.labels
        if (showTips) {
            setTimeout(() => {
                refreshing.value = false
                uni.showToast({
                    title: '加载成功',
                    icon: 'none'
                })
            }, 600)
        }
        if(props.fileId){
            setChecked()
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
</script>

<style scoped lang="scss">
.global--container {
  padding-left: 0 !important;
}

.label-item {
  width: 640rpx;
  height: 86rpx;
  background: #fff5ee;
  border-radius: 8px;
  border: 1rpx dashed black;
  margin-top: 20rpx;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 12rpx 24rpx;
  font-size: 28rpx;
  cursor: pointer;
  opacity: 0;
  animation: show 0.3s linear forwards;
  @keyframes show {
    0% {
      opacity: 0;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
    .label-title{
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .checkbox{
        margin-top: -6rpx;
    }
    ::v-deep.checkbox .uni-checkbox-input{
        width: 28rpx!important;
        height: 28rpx!important;
    }

  @media screen and (min-width: 1023px) {
    &:hover {
      transform: scale(1.05);
      border-style: dot-dot-dash;
      border-color: dodgerblue;
      background: #fff3ef;
    }
  }

  .edit {
    display: flex;
    margin: 0;
    background: #fff5ee;
  }

  .delete {
    margin-left: 12rpx;
    background: tomato;
  }
}

.scroll-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  height: calc(100vh - 60px);
  padding-bottom: 200rpx;
  overflow: visible;
  //min-height: 200rpx;
}

</style>