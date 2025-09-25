import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";
import './assets/main.css'
//createApp(App).mount("#app"); no fucking clue what this was for
createApp(App).use(router).mount('#app')

