<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePostStore } from '@/stores/postStore'

const postStore = usePostStore()
const loading = ref(true)
const showForm = ref(false)
const newTitle = ref('')
const newDescription = ref('')

onMounted(async () => {
    await postStore.fetchPosts();
    loading.value = false;
});

const createPost = async () => {
    if (!newTitle.value || !newDescription.value) return;
    await postStore.createPost(newTitle.value, newDescription.value)
    newTitle.value = ''
    newDescription.value = ''
    showForm.value = false
};
</script>

<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4 text-center">Блог</h1>

        <button @click="showForm = !showForm"
            class="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600">
            {{ showForm ? 'Отменить' : 'Создать пост' }}
        </button>

        <div v-if="showForm" class="mb-4 p-4 border rounded-lg shadow-md">
            <input v-model="newTitle" type="text" placeholder="Заголовок" class="w-full p-2 border rounded-md mb-2" />
            <textarea v-model="newDescription" placeholder="Описание"
                class="w-full p-2 border rounded-md mb-2"></textarea>
            <button @click="createPost" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                Сохранить
            </button>
        </div>

        <div v-if="loading" class="text-center text-gray-500">Загрузка...</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="post in postStore.posts" :key="post.id"
                class="p-4 border rounded-lg shadow-md cursor-pointer hover:shadow-lg">
                <h2 class="text-xl font-semibold">{{ post.title }}</h2>
                <p class="text-gray-600">{{ post.description }}</p>
            </div>
        </div>
    </div>
</template>
