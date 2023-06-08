<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import routingIntercept from '@/utils/permission'
onLaunch(() => {
  routingIntercept()
  console.log("App Launch");

// #ifdef H5
  uni.hideTabBar({
      animation: false
  })
// #endif

});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style>
@import url("@/style/global.scss");
</style>
