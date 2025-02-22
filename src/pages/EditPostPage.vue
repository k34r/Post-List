<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostStore } from '@/stores/postStore'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()

const post = ref<{ id: string; title: string; description: string } | null>(null)
const loading = ref(true)
const newTitle = ref('')
const newDescription = ref('')

onMounted(async () => {
  loading.value = true
  if (postStore.posts.length === 0) {
    await postStore.fetchPosts()
  }
  post.value = postStore.posts.find(p => String(p.id) === route.params.id) || null
  if (post.value) {
    newTitle.value = post.value.title
    newDescription.value = post.value.description
  }
  loading.value = false
})

const saveChanges = async () => {
  if (post.value) {
    const updatedData = {
      title: newTitle.value,
      description: newDescription.value
    }
    await postStore.editPost(post.value.id, updatedData)
    router.push('/') // Возвращаем на главную страницу после сохранения
  }
}
</script>

<template>
  <div class="container mx-auto p-4">
    <button @click="$router.push('/')" class="bg-gray-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-gray-600">
      Назад
    </button>

    <div v-if="loading" class="text-center text-gray-500">Загрузка...</div>
    <div v-else-if="post" class="p-4 border rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-2">Редактировать пост</h1>

      <div class="mb-4">
        <label for="title" class="block text-sm font-medium text-gray-700">Заголовок</label>
        <input v-model="newTitle" id="title" type="text"
          class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div class="mb-4">
        <label for="description" class="block text-sm font-medium text-gray-700">Описание</label>
        <textarea v-model="newDescription" id="description" rows="4"
          class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
      </div>

      <div class="flex justify-end">
        <button @click="saveChanges" class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
          Сохранить
        </button>
      </div>
    </div>
    <div v-else class="text-center text-red-500">Пост не найден</div>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
}
</style>
