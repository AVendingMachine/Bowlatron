// src/router/index.js
import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SecondView from "../views/SecondView.vue";
import DatabaseWriterView from "../views/DatabaseWriterView.vue";

const routes = [
    {path: '/', name: 'home', component: HomeView},
    {path: '/SecondView', component: SecondView},
    {path: '/DatabaseWriterView', component: DatabaseWriterView}
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router