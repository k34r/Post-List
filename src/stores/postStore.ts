import { defineStore } from 'pinia'
import { db } from '@/firebase'
import {
  collection,
  query,
  orderBy,
  getDocs,
  startAfter,
  limit,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  Timestamp
} from 'firebase/firestore'

interface Post {
  id: string
  title: string
  description: string
  createdAt: Timestamp
}

export const usePostStore = defineStore('postStore', {
  state: () => ({
    posts: [] as Post[],
    lastVisible: null as any,
    hasMore: true,
    isLoading: false,
    sortOrder: 'desc' as 'asc' | 'desc',
    searchQuery: '',
  }),

  actions: {
    async fetchPosts() {
      this.isLoading = true
      try {
        const q = query(
          collection(db, 'posts'),
          orderBy('createdAt', this.sortOrder), // Сортируем по дате и времени
          limit(10)
        )
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          this.posts = querySnapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              title: data.title,
              description: data.description,
              createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt
                : Timestamp.fromDate(new Date(data.createdAt))
            }
          }).sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()) // Учитываем миллисекунды
          
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
        const newPostRef = doc(collection(db, 'posts'))
        const newPost = {
          ...post,
          createdAt: Timestamp.fromDate(new Date(post.createdAt)),
        }
        await setDoc(newPostRef, newPost)
        this.posts.unshift({ id: newPostRef.id, ...newPost })
        this.posts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()) // Пересортировка
      } catch (error) {
        console.error('Ошибка при создании поста:', error)
      }
    },

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
          const newPosts = querySnapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              title: data.title,
              description: data.description,
              createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt
                : Timestamp.fromDate(new Date(data.createdAt))
            }
          })

          this.posts.push(...newPosts)
          this.posts.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()) // Пересортировка
          this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
        }

        this.hasMore = querySnapshot.size > 0
      } catch (error) {
        console.error('Ошибка при загрузке дополнительных постов:', error)
      } finally {
        this.isLoading = false
      }
    },

    async deletePost(id: string) {
      try {
        await deleteDoc(doc(db, 'posts', id))
        this.posts = this.posts.filter(post => post.id !== id)
      } catch (error) {
        console.error('Ошибка при удалении поста:', error)
      }
    },

    changeSortOrder(order: 'asc' | 'desc') {
      this.sortOrder = order
      this.posts.sort((a, b) => 
        order === 'asc'
          ? a.createdAt.toMillis() - b.createdAt.toMillis()
          : b.createdAt.toMillis() - a.createdAt.toMillis()
      )
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    async editPost(id: string, updatedData: { title: string; description: string }) {
      try {
        await updateDoc(doc(db, 'posts', id), updatedData)
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
    filteredPosts(state): Post[] {
      return state.posts.filter(post =>
        post.title.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    },

    getPosts(state): Post[] {
      return state.posts
    }
  },
})




















