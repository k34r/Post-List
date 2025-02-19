import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/HomePage.vue'
import PostPage from '../pages/PostPage.vue'
import FormPage from '../pages/FormPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/post',
      name: 'post',
      component: () => import('../pages/PostPage.vue'),
    },
    {
      path: '/form',
      name: 'form',
      component: () => import('../pages/FormPage.vue'),
    },
  ],
})

export default router
