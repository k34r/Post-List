import { defineStore } from 'pinia';
import { db } from '@/firebase'; // Импортируем конфигурацию Firebase
import { collection, getDocs, addDoc } from 'firebase/firestore'; // Импортируем функции Firestore

export const usePostStore = defineStore('postStore', {
  state: () => ({
    posts: [] as Array<{ id: string, title: string, description: string }> // типизация состояния
  }),
  actions: {
    // Функция для загрузки постов из Firestore
    async fetchPosts() {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        this.posts = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description,
          }))
          .filter(post => post.title && post.description); // Фильтруем пустые посты
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
      }
    },

    // Функция для создания нового поста
    async createPost(title: string, description: string) {
      try {
        // Добавляем новый пост в Firestore
        const docRef = await addDoc(collection(db, "posts"), {
          title,
          description
        });

        // Обновляем состояние с новым постом, который был добавлен в Firestore
        this.posts.push({
          id: docRef.id, // получаем id из Firestore
          title,
          description
        });
      } catch (error) {
        console.error('Ошибка при создании поста:', error);
      }
    }
  }
});


