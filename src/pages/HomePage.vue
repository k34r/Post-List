<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePostStore } from '@/stores/postStore'
import { useRouter } from 'vue-router'


const postStore = usePostStore()
const loading = ref(true)
const showForm = ref(false)
const editingPostId = ref<string | null>(null)
const newTitle = ref('')
const newDescription = ref('')
const searchQuery = ref('')
const router = useRouter()

onMounted(async () => {
    await postStore.fetchPosts()
    loading.value = false
})

const createOrUpdatePost = async () => {
    if (!newTitle.value || newTitle.value.length > 12 || !newDescription.value || newDescription.value.length > 50) return

    if (editingPostId.value) {
        await postStore.updatePost(editingPostId.value, newTitle.value, newDescription.value)
    } else {
        await postStore.createPost(newTitle.value, newDescription.value)
    }

    newTitle.value = ''
    newDescription.value = ''
    editingPostId.value = null
    showForm.value = false
}

const editPost = (post: { id: string, title: string, description: string, createdAt: string }) => {
    newTitle.value = post.title
    newDescription.value = post.description
    editingPostId.value = post.id
    showForm.value = true
}

const deletePost = async (id: string) => {
    await postStore.deletePost(id)
}

const goToPost = (id: string) => {
    router.push({ name: 'post', params: { id } })
}

const filteredPosts = computed(() => {
    return postStore.posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
})

// Функция для форматирования даты и времени
const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
    const formattedDate = new Date(date).toLocaleDateString('ru-RU', options)

    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
    const formattedTime = new Date(date).toLocaleTimeString('ru-RU', timeOptions)

    return `${formattedDate}, ${formattedTime}`
}
</script>

<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4 text-center">Блог</h1>

        <div class="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <button @click="showForm = !showForm; editingPostId = null; newTitle = ''; newDescription = ''"
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                {{ showForm ? 'Отменить' : 'Создать пост' }}
            </button>
            <input v-model="searchQuery" type="text" placeholder="Поиск по заголовку"
                class="w-full md:w-1/3 p-2 border rounded-md" />
        </div>

        <div v-if="showForm" class="mb-4 p-4 border rounded-lg shadow-md">
            <input v-model="newTitle" type="text" placeholder="Заголовок (до 12 символов)"
                class="w-full p-2 border rounded-md mb-2" />
            <textarea v-model="newDescription" placeholder="Описание (до 50 символов)"
                class="w-full p-2 border rounded-md mb-2"></textarea>
            <button @click="createOrUpdatePost" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                :disabled="newTitle.length > 12 || newDescription.length > 50">
                {{ editingPostId ? 'Сохранить изменения' : 'Сохранить' }}
            </button>
            <p v-if="newTitle.length > 12" class="text-red-500 text-sm">Заголовок не должен превышать 12 символов.</p>
            <p v-if="newDescription.length > 50" class="text-red-500 text-sm">Описание не должно превышать 50 символов.
            </p>
        </div>

        <div v-if="loading" class="text-center text-gray-500">Загрузка...</div>
        <div v-else class="flex flex-col gap-4">
            <div v-for="post in filteredPosts" :key="post.id"
                class="relative p-4 border rounded-lg shadow-md hover:shadow-lg hover:bg-gray-100">
                <h2 class="text-xl font-semibold cursor-pointer" @click="goToPost(String(post.id))">
                    <span class="text-sm text-gray-500">{{ formatDate(post.createdAt) }} &nbsp;</span>
                    {{ post.title }}
                </h2>
                <div class="absolute top-2 right-2 flex gap-2">
                    <button @click="editPost(post)"
                        class="bg-yellow-500 text-white px-2 py-1 rounded-md hover:bg-yellow-600">✏️</button>
                    <button @click="deletePost(post.id)"
                        class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">🗑️</button>
                </div>
            </div>
        </div>
    </div>
</template>
