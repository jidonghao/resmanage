<template>
    <view class="user-custom-tab-bar">
        <custom-tab-bar :direction="direction" :selected="props.index||0" @onTabItemTap="onTabClick"/>
    </view>
</template>
<style lang="scss">
.user-custom-tab-bar {
    border-bottom: 1px solid #e1e1e1;
    background-color: rgb(248, 248, 248);
    color: #333;
    padding-bottom: env(safe-area-inset-bottom);
    position: fixed;
    bottom: 0;
    box-sizing: border-box;
    width: 100vw;

    @media screen and (min-width: 1023px) {
        width: 60px;
        height: 100vh;
        left: 0;
        top: 0;
        z-index: 999;
        padding-top: 40px;
    }
}
::v-deep.uni-tabbar .uni-tabbar__icon {
    width: 48rpx !important;
    height: 48rpx !important;
}
</style>
<script setup lang="ts">
import {ref} from "vue";
import {onLoad} from "@dcloudio/uni-app";
const props = defineProps<{
    index:number
}>()
const list = ref( [
    {
        "iconPath": "static/icon/recent.png",
        "selectedIconPath": "static/icon/recent-select.png",
        "text": "最近项目",
        "pagePath": "pages/recent/recent"
    },
    {
        "iconPath": "static/icon/file-folder-close.png",
        "selectedIconPath": "static/icon/file-folder-open.png",
        "text": "浏览",
        "pagePath": "pages/index/index"
    },
    {
        "iconPath": "static/icon/my.png",
        "selectedIconPath": "static/icon/my-fill.png",
        "text": "我的",
        "pagePath": "pages/my/my"
    }
]),activeTab = ref(0),direction = ref("horizontal")
function onTabClick(event:any) {
    const {index, pagePath} = event
    uni.switchTab({ url: `/${pagePath}` })
}

/**
 * tabbar方向
 */
let timer: number | null = null;
function setDirection(e: any, isImmediate: boolean = false) {
    if (timer) {
        clearTimeout(timer);
    }
    if (isImmediate) {
        fun();
    } else {
        timer = setTimeout(() => {
            fun();
            timer = null;
        }, 10);
    }
}
function fun() {
    if (window.innerWidth > 1023) {
        direction.value = "vertical";
    } else {
        direction.value = "horizontal";
    }
}

onLoad(()=>{
    const innerWidth = window.innerWidth;
    setDirection({currentTarget:{innerWidth}},true)
    window.addEventListener("resize",setDirection)
})

</script>
