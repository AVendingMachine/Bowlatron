import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";
import './assets/main.css'
import VueSelect from "vue-select";
//createApp(App).mount("#app"); no fucking clue what this was for
createApp(App)
    .component("v-select", VueSelect)
    .use(router)
    .mount('#app')

