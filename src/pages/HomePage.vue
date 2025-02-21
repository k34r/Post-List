<template>
    <div>
        <!-- Поле поиска -->
        <div>
            <input v-model="searchQuery" @input="searchPosts(searchQuery)" type="text"
                placeholder="Поиск по заголовку" />
        </div>

        <!-- Выбор сортировки -->
        <div>
            <select v-model="sortOrder" @change="changeSortOrder(sortOrder)">
                <option value="desc">По дате (новые сначала)</option>
                <option value="asc">По дате (старые сначала)</option>
            </select>
        </div>

        <!-- Отображение постов -->
        <div v-for="post in postStore.filteredPosts" :key="post.id" class="post-card">
            <h2>{{ post.title }}</h2>
            <p>{{ post.description }}</p>
            <small>{{ new Date(post.createdAt).toLocaleString() }}</small>
        </div>

        <!-- Индикатор загрузки -->
        <div v-if="postStore.isLoading" class="loading">Загрузка...</div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePostStore } from '@/stores/postStore'

// Получаем доступ к хранилищу
const postStore = usePostStore()

// Локальные переменные для поиска и сортировки
const searchQuery = ref('')
const sortOrder = ref(postStore.sortOrder)

// Методы для поиска и сортировки
const searchPosts = (query) => {
    postStore.searchPosts(query)
}

const changeSortOrder = (order) => {
    postStore.changeSortOrder(order)
}

// Подгружаем посты при монтировании компонента
onMounted(async () => {
    await postStore.fetchPosts()
    window.addEventListener('scroll', handleScroll)
})

// Убираем обработчик события при размонтировании компонента
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})

// Обработчик прокрутки страницы для подгрузки новых постов
const handleScroll = () => {
    if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        !postStore.isLoading &&
        postStore.hasMore
    ) {
        postStore.loadMorePosts()
    }
}
</script>

<style scoped>
.post-card {
    padding: 16px;
    margin: 8px 0;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
}

.loading {
    text-align: center;
    padding: 20px;
}

input {
    padding: 8px;
    margin: 10px;
}

select {
    padding: 8px;
    margin: 10px;
}
</style>