<template>
    <div>
        <!-- Кнопка "Создать" -->
        <div class="mb-4 text-right">
            <button @click="goToCreatePostPage"
                class="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition duration-200">
                Создать
            </button>
        </div>

        <!-- Поле поиска по заголовку -->
        <div class="mb-4">
            <input v-model="searchQuery" type="text" placeholder="Поиск по заголовку..."
                class="border px-4 py-2 rounded-md w-full" />
        </div>

        <!-- Кнопка "Сортировка по дате" с предыдущим дизайном -->
        <div class="mb-4">
            <button @click="toggleSortMenu"
                class="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition duration-200">
                Сортировка по дате
            </button>
            <div v-if="isSortMenuVisible" class="mt-2 bg-white border rounded-md shadow-md">
                <button @click="sortPosts('desc')" class="block w-full text-left px-4 py-2 hover:bg-gray-200">
                    Сначала новые
                </button>
                <button @click="sortPosts('asc')" class="block w-full text-left px-4 py-2 hover:bg-gray-200">
                    Сначала старые
                </button>
            </div>
        </div>

        <!-- Список постов -->
        <div v-for="post in filteredPosts" :key="post.id" class="post-card p-4 mb-4 border rounded-lg shadow-md">
            <h2 class="text-xl font-semibold" @click="goToPostPage(post.id)">
                {{ post.title }}
            </h2>
            <small class="text-gray-500">{{ new Date(post.createdAt).toLocaleString() }}</small>

            <!-- Кнопки "Редактировать" и "Удалить" -->
            <div class="mt-4 flex gap-4">
                <button @click="goToEditPage(post.id)"
                    class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    Редактировать
                </button>
                <button @click="deletePost(post.id)"
                    class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                    Удалить
                </button>
            </div>
        </div>

        <!-- Спиннер загрузки -->
        <div v-if="postStore.isLoading" class="text-center text-gray-500 py-4">Загрузка...</div>

        <!-- Сообщение о том, что больше постов нет -->
        <div v-if="!postStore.hasMore" class="text-center mt-4 text-gray-500">
            Больше постов нет
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePostStore } from '@/stores/postStore'
import { useRouter } from 'vue-router'

const postStore = usePostStore()
const router = useRouter()

const searchQuery = ref('')
const isSortMenuVisible = ref(false)

// Фильтрация постов по заголовку
const filteredPosts = computed(() => {
    let posts = postStore.posts
    if (searchQuery.value) {
        posts = posts.filter(post =>
            post.title.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
    }
    return posts
})

// Переход на страницу редактирования
const goToEditPage = (id: string) => {
    router.push(`/post/${id}/edit`)
}

// Переход на страницу с подробным постом
const goToPostPage = (id: string) => {
    router.push(`/post/${id}`)
}

// Переход на страницу создания нового поста
const goToCreatePostPage = () => {
    router.push('/create-post')
}

// Удаление поста
const deletePost = async (id: string) => {
    await postStore.deletePost(id)
}

// Отображение или скрытие подменю сортировки
const toggleSortMenu = () => {
    isSortMenuVisible.value = !isSortMenuVisible.value
}

// Сортировка постов по дате
const sortPosts = (order: 'asc' | 'desc') => {
    isSortMenuVisible.value = false
    postStore.posts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return order === 'asc' ? dateA - dateB : dateB - dateA
    })
}

// Загрузка постов при монтировании компонента
onMounted(async () => {
    await postStore.fetchPosts()
    window.addEventListener('scroll', handleScroll)
})

// Обработка скроллинга для автоподгрузки
const handleScroll = () => {
    if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        !postStore.isLoading &&
        postStore.hasMore
    ) {
        postStore.loadMorePosts()
    }
}

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.post-card {
    background: white;
    padding: 16px;
    margin: 8px 0;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2:hover {
    cursor: pointer;
    text-decoration: underline;
}
</style>