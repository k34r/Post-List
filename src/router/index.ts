import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import PostPage from '@/pages/PostPage.vue'
import EditPostPage from '@/pages/EditPostPage.vue'
import CreatePostPage from '@/pages/CreatePostPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/post/:id', component: PostPage },
  { path: '/post/:id/edit', component: EditPostPage },
  { path: '/create-post', component: CreatePostPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router


