<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostStore } from '@/stores/postStore'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()

const post = ref<{ id: string; title: string; description: string } | null>(null)
const loading = ref(true)
const newTitle = ref('')
const newDescription = ref('')
const isTextarea = ref(false) // Флаг для контроля типа поля описания

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

// Валидация
const titleError = computed(() => newTitle.value.length > 12 ? 'Максимум 12 символов' : '')
const descriptionLimit = computed(() => (isTextarea.value ? 50 : 25))
const descriptionError = computed(() => newDescription.value.length > descriptionLimit.value ? `Максимум ${descriptionLimit.value} символов` : '')

const saveChanges = async () => {
  if (post.value && !titleError.value && !descriptionError.value) {
    const updatedData = {
      title: newTitle.value.trim(),
      description: newDescription.value.trim()
    }
    await postStore.editPost(post.value.id, updatedData)
    router.push('/')
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
        <p v-if="titleError" class="text-red-500 text-sm">{{ titleError }}</p>
      </div>

      <div class="mb-4">
        <label for="description" class="block text-sm font-medium text-gray-700">Описание</label>
        <textarea v-if="isTextarea" v-model="newDescription" id="description" rows="4"
          class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        </textarea>
        <input v-else v-model="newDescription" id="description" type="text"
          class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <p v-if="descriptionError" class="text-red-500 text-sm">{{ descriptionError }}</p>
      </div>

      <div class="flex justify-end">
        <button @click="saveChanges" :disabled="!!titleError || !!descriptionError"
          class="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">
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
