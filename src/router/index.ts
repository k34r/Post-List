import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/post/:id',
      name: 'post',
      component: () => import('../pages/PostPage.vue'),
    }
  ],
})

// console.log("Маршруты загружены:", router.getRoutes())

export default router

