<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePostStore } from '@/stores/postStore'

const route = useRoute()
const postStore = usePostStore()

const post = ref<{ id: string; title: string; description: string } | null>(null);
const loading = ref(true);

onMounted(async () => {
  loading.value = true
  if (postStore.posts.length === 0) {
    await postStore.fetchPosts()
  }
  post.value = postStore.posts.find(p => String(p.id) === route.params.id) || null;
  loading.value = false;
});
</script>

<template>
  <div class="container mx-auto p-4">
    <button @click="$router.push('/')" class="bg-gray-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-gray-600">
      Назад
    </button>

    <div v-if="loading" class="text-center text-gray-500">Загрузка...</div>
    <div v-else-if="post" class="p-4 border rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-2">{{ post.title }}</h1>
      <p class="text-gray-600">{{ post.description }}</p>
    </div>
    <div v-else class="text-center text-red-500">Пост не найден</div>
  </div>
</template>