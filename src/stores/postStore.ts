// store/postStore.ts
import { defineStore } from 'pinia'
import { db } from '@/firebase'
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore'

export const usePostStore = defineStore('postStore', {
  state: () => ({
    posts: [] as Array<{ id: string; title: string; description: string; createdAt: string }>,
    lastVisible: null as any,
    hasMore: true,
    isLoading: false
  }),

  actions: {
    async fetchPosts() {
      try {
        this.isLoading = true
        const firstQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10))
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
          orderBy('createdAt', 'desc'),
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
    }
  }
})






