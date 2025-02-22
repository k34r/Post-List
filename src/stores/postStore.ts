import { defineStore } from 'pinia'
import { db } from '@/firebase'
import { collection, query, orderBy, getDocs, startAfter, limit, doc, deleteDoc } from 'firebase/firestore'

interface Post {
  id: string
  title: string
  description: string
  createdAt: string
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


















