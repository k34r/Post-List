<template>
    <div>
        <div v-for="post in postStore.posts" :key="post.id" class="post-card">
            <h2>{{ post.title }}</h2>
            <p>{{ post.description }}</p>
            <small>{{ new Date(post.createdAt).toLocaleString() }}</small>
        </div>

        <div v-if="postStore.isLoading" class="loading">Загрузка...</div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { usePostStore } from '@/stores/postStore'

const postStore = usePostStore()

const handleScroll = () => {
    if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
        !postStore.isLoading &&
        postStore.hasMore
    ) {
        postStore.loadMorePosts()
    }
}

onMounted(async () => {
    await postStore.fetchPosts()
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
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
</style>
