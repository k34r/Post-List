import { defineStore } from 'pinia'
import { db } from '@/firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

export const usePostStore = defineStore('postStore', {
  state: () => ({
    posts: [] as Array<{ id: string; title: string; description: string; createdAt: string }>
  }),

  actions: {
    async fetchPosts() {
      try {
        const querySnapshot = await getDocs(collection(db, 'posts'))
        this.posts = querySnapshot.docs
          .map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              title: data.title,
              description: data.description,
              createdAt: data.createdAt instanceof Timestamp
                ? data.createdAt.toDate().toISOString()
                : '' // Если нет createdAt, подставляем пустую строку
            }
          })
          .filter(post => post.title && post.description)
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error)
      }
    },

    async createPost(title: string, description: string) {
      try {
        const docRef = await addDoc(collection(db, 'posts'), {
          title,
          description,
          createdAt: serverTimestamp() // Firestore сам установит время сервера
        })

        this.posts.push({
          id: docRef.id,
          title,
          description,
          createdAt: new Date().toISOString() // Отображаем текущую дату сразу
        })
      } catch (error) {
        console.error('Ошибка при создании поста:', error)
      }
    },

    async updatePost(id: string, title: string, description: string) {
      try {
        const postRef = doc(db, 'posts', id)
        await updateDoc(postRef, { title, description })

        const index = this.posts.findIndex(post => post.id === id)
        if (index !== -1) {
          this.posts[index].title = title
          this.posts[index].description = description
        }
      } catch (error) {
        console.error('Ошибка при обновлении поста:', error)
      }
    },

    async deletePost(id: string) {
      try {
        await deleteDoc(doc(db, 'posts', id))
        this.posts = this.posts.filter(post => post.id !== id)
      } catch (error) {
        console.error('Ошибка при удалении поста:', error)
      }
    }
  }
})




