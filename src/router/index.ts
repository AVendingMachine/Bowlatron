// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SecondView from "../views/SecondView.vue";

const routes = [
    { path: '/', name: 'home', component: HomeView },
    { path: '/SecondView', component: SecondView },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router