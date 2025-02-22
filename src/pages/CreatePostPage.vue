<template>
    <div class="container mx-auto p-4">
        <button @click="$router.push('/')" class="bg-gray-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-gray-600">
            Назад
        </button>

        <h1 class="text-2xl font-bold mb-4">Создать пост</h1>

        <form @submit.prevent="createPost" class="space-y-4">
            <div>
                <label for="title" class="block text-sm font-semibold text-gray-700">Название</label>
                <input v-model="title" @input="validateTitle" type="text" id="title"
                    class="border px-4 py-2 rounded-md w-full" placeholder="Введите название поста" required />
                <p v-if="titleError" class="text-red-500 text-sm">{{ titleError }}</p>
            </div>

            <div>
                <label for="description" class="block text-sm font-semibold text-gray-700">Описание</label>
                <textarea v-model="description" @input="validateDescription" id="description" rows="4"
                    class="border px-4 py-2 rounded-md w-full" placeholder="Введите описание поста" required></textarea>
                <p v-if="descriptionError" class="text-red-500 text-sm">{{ descriptionError }}</p>
            </div>

            <button type="submit"
                class="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                :disabled="Boolean(titleError) || Boolean(descriptionError)">
                Создать
            </button>

        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/postStore'

const title = ref('')
const description = ref('')
const titleError = ref<string | null>(null)
const descriptionError = ref<string | null>(null)
const router = useRouter()
const postStore = usePostStore()

const validateTitle = () => {
    if (title.value.length > 12) {
        titleError.value = 'Название не должно превышать 12 символов'
    } else {
        titleError.value = null
    }
}

const validateDescription = () => {
    const maxLength = description.value.includes('\n') ? 50 : 25
    if (description.value.length > maxLength) {
        descriptionError.value = `Описание не должно превышать ${maxLength} символов`
    } else {
        descriptionError.value = null
    }
}

const createPost = async () => {
    if (titleError.value || descriptionError.value) return

    const newPost = {
        title: title.value,
        description: description.value,
        createdAt: new Date().toISOString(),
    }

    await postStore.createPost(newPost)
    router.push('/')  // Перенаправление на главную страницу после создания поста
}
</script>

<style scoped>
.container {
    max-width: 800px;
}
</style>
