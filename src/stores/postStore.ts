import { defineStore } from 'pinia'
import { db } from '@/firebase'
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
  addDoc
} from 'firebase/firestore'

import type { OrderByDirection } from 'firebase/firestore'

export const usePostStore = defineStore('postStore', {
  state: () => ({
    posts: [] as Array<{ id: string; title: string; description: string; createdAt: string }>,
    lastVisible: null as any,
    hasMore: true,
    isLoading: false,
    sortOrder: 'desc' as OrderByDirection,
    searchQuery: '' as string
  }),

  actions: {
    async fetchPosts() {
      try {
        this.isLoading = true
        const firstQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', this.sortOrder),
          limit(10)
        )
        const querySnapshot = await getDocs(firstQuery)

        if (!querySnapshot.empty) {
          this.posts = querySnapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              title: data.title,
              description: data.description,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : ''
            }
          })
          this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
        } else {
          this.hasMore = false
        }
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error)
      } finally {
        this.isLoading = false
      }
    },

    async loadMorePosts() {
      if (!this.hasMore || !this.lastVisible || this.isLoading) return
      
      try {
        this.isLoading = true
        const nextQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', this.sortOrder),
          startAfter(this.lastVisible),
          limit(5)
        )
        
        const querySnapshot = await getDocs(nextQuery)
        
        if (!querySnapshot.empty) {
          const newPosts = querySnapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              title: data.title,
              description: data.description,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : ''
            }
          })
          this.posts.push(...newPosts)
          this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1]
        } else {
          this.hasMore = false
        }
      } catch (error) {
        console.error('Ошибка при подгрузке постов:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Метод для создания нового поста и сохранения в Firestore
    async createPost(post: { title: string; description: string; createdAt: string }) {
      try {
        const docRef = await addDoc(collection(db, 'posts'), {
          title: post.title,
          description: post.description,
          createdAt: Timestamp.fromDate(new Date(post.createdAt)),
        })

        // После добавления поста можно обновить локальное состояние
        this.posts.push({
          id: docRef.id,  // Получаем id нового документа в Firebase
          title: post.title,
          description: post.description,
          createdAt: post.createdAt,
        })
      } catch (error) {
        console.error("Ошибка при создании поста:", error)
      }
    },

    async deletePost(postId: string) {
      try {
        await deleteDoc(doc(db, 'posts', postId))
        // Убираем удаленный пост из локального состояния
        this.posts = this.posts.filter(post => post.id !== postId)
      } catch (error) {
        console.error('Ошибка при удалении поста:', error)
      }
    },

    async editPost(postId: string, updatedData: { title: string; description: string }) {
      try {
        const postRef = doc(db, 'posts', postId)
        await updateDoc(postRef, updatedData)
        // Обновляем локальное состояние с новым значением
        const postIndex = this.posts.findIndex(post => post.id === postId)
        if (postIndex !== -1) {
          this.posts[postIndex] = { ...this.posts[postIndex], ...updatedData }
        }
      } catch (error) {
        console.error('Ошибка при редактировании поста:', error)
      }
    }
  },

  getters: {
    filteredPosts(state) {
      if (!state.searchQuery) return state.posts
      return state.posts.filter(post => 
        post.title.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    }
  }
})












