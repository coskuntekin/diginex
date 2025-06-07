import "@/assets/stylesheets/tailwind.css";
import "@/assets/stylesheets/element.css";
import "element-plus/es/components/notification/style/css";
import "element-plus/es/components/message-box/style/css";
import "element-plus/es/components/pagination/style/css";
import "element-plus/es/components/dialog/style/css";
import { createPinia } from "pinia";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount("#diginex");
