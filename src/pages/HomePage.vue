<template>
    <div class="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <button @click="goToCreatePostPage" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Создать пост
        </button>

        <input v-model="searchQuery" type="text" placeholder="Поиск по заголовку"
            class="w-full md:w-1/3 p-2 border rounded-md" />

        <!-- Поле сортировки по дате -->
        <select v-model="sortOrder" @change="changeSortOrder" class="w-full md:w-1/3 p-2 border rounded-md">
            <option value="desc">Сначала новые</option>
            <option value="asc">Сначала старые</option>
        </select>
    </div>

    <!-- Список постов -->
    <div v-for="post in filteredPosts" :key="post.id" class="post-card p-4 mb-4 border rounded-lg shadow-md">
        <h2 class="text-xl font-semibold" @click="goToPostPage(post.id)">
            {{ post.title }}
        </h2>
        <small class="text-gray-500">{{ formatDate(post.createdAt) }}</small>

        <!-- Кнопки "Редактировать" и "Удалить" -->
        <div class="mt-4 flex gap-4">
            <button @click="goToEditPage(post.id)"
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Редактировать
            </button>
            <button @click="deletePost(post.id)" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePostStore } from '@/stores/postStore'
import { useRouter } from 'vue-router'

const postStore = usePostStore()
const router = useRouter()

const searchQuery = ref('') // Поисковый запрос
const sortOrder = ref(postStore.sortOrder) // Порядок сортировки

// Фильтрация постов по заголовку
const filteredPosts = computed(() => {
    return postStore.filteredPosts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) // Фильтруем по заголовку
    )
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

// Сортировка постов
const changeSortOrder = () => {
    postStore.changeSortOrder(sortOrder.value)
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

// Форматирование даты
const formatDate = (date: string | { seconds: number }) => {
    let dateObj: Date;

    if (typeof date === 'string') {
        // Если дата строка (например, ISO-формат), используем её напрямую
        dateObj = new Date(date);
    } else if (date && date.seconds) {
        // Если дата объект с полем seconds, преобразуем в дату
        dateObj = new Date(date.seconds * 1000);
    } else {
        // Если данных нет или формат некорректный
        return 'Неизвестная дата';
    }

    return dateObj.toLocaleString(); // Преобразуем в строку в локальном формате
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