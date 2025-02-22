import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, query, orderBy, getDocs, startAfter, limit, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore'

interface Post {
  id: string
  title: string
  description: string
  createdAt: any // Изменить на timestamp, если Firestore использует тип timestamp
}

export const usePostStore = defineStore('postStore', {
  state: () => ({
    posts: [] as Post[], // Состояние с массивом постов
    lastVisible: null as any,
    hasMore: true,
    isLoading: false,
    sortOrder: 'desc' as 'asc' | 'desc',
    searchQuery: '',
  }),

  actions: {
    // Функция для загрузки постов
    async fetchPosts() {
      this.isLoading = true
      try {
        const q = query(
          collection(db, 'posts'),
          orderBy('createdAt', this.sortOrder),
          limit(10)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          this.posts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description,
            createdAt: doc.data().createdAt
          }))
          this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
        }
        this.hasMore = querySnapshot.size > 0
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error)
      } finally {
        this.isLoading = false
      }
    },

    async createPost(post: { title: string; description: string; createdAt: string }) {
      try {
        const newPostRef = doc(collection(db, 'posts')) // Создание нового документа с авто-сгенерированным ID
        await setDoc(newPostRef, post) // Запись данных в Firestore
    
        // Добавление поста в локальный массив
        this.posts.unshift({ id: newPostRef.id, ...post })
      } catch (error) {
        console.error('Ошибка при создании поста:', error)
      }
    },

    // Функция для подгрузки дополнительных постов
    async loadMorePosts() {
      if (!this.lastVisible || this.isLoading || !this.hasMore) return

      this.isLoading = true
      try {
        const q = query(
          collection(db, 'posts'),
          orderBy('createdAt', this.sortOrder),
          startAfter(this.lastVisible),
          limit(10)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          this.posts.push(...querySnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description,
            createdAt: doc.data().createdAt
          })))
          this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
        }

        this.hasMore = querySnapshot.size > 0
      } catch (error) {
        console.error('Ошибка при загрузке дополнительных постов:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Удаление поста
    async deletePost(id: string) {
      try {
        const postRef = doc(db, 'posts', id)
        await deleteDoc(postRef)
        this.posts = this.posts.filter(post => post.id !== id)
      } catch (error) {
        console.error('Ошибка при удалении поста:', error)
      }
    },

    // Сортировка по дате
    changeSortOrder(order: 'asc' | 'desc') {
      this.sortOrder = order
      this.fetchPosts() // Перезагружаем посты с новым порядком сортировки
    },

    // Фильтрация постов по поисковому запросу
    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    // Обновление данных поста
    async editPost(id: string, updatedData: { title: string; description: string }) {
      try {
        const postRef = doc(db, 'posts', id)
        await updateDoc(postRef, {
          title: updatedData.title,
          description: updatedData.description
        })

        // Обновляем данные в локальном хранилище после изменения на сервере
        const postIndex = this.posts.findIndex(post => post.id === id)
        if (postIndex !== -1) {
          this.posts[postIndex] = { ...this.posts[postIndex], ...updatedData }
        }
      } catch (error) {
        console.error('Ошибка при редактировании поста:', error)
      }
    }
  },

  getters: {
    // Геттер для фильтрации постов по запросу
    filteredPosts(state): Post[] {
      return state.posts.filter(post =>
        post.title.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    },

    // Геттер для всех постов
    getPosts(state): Post[] {
      return state.posts
    }
  },
})



















