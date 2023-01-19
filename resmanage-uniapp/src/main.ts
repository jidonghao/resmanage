import { createSSRApp } from "vue";
import App from "./App.vue";
import arrowList from '/components/arrow-list/arrow-list.vue'
export function createApp() {
  const app = createSSRApp(App);
  app.component('arrow-list',arrowList)
  return {
    app,
  };
}
