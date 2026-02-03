import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "./style.css";
import App from "./App.vue";
import { useAccountsStore } from "./stores/accounts";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(ElementPlus);

useAccountsStore(pinia).hydrateFromStorage();

app.mount("#app");
