<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import routingIntercept from '@/utils/permission'
onLaunch(() => {
  console.log("App Launch");
  routingIntercept()
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style></style>
