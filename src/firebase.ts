import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'; // Импортируем Firestore

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDUVIVcOvOzPbYUq8zdQn9LPmmMMsfA_eE",
  authDomain: "blog-test-973fc.firebaseapp.com",
  projectId: "blog-test-973fc",
  storageBucket: "blog-test-973fc.firebasestorage.app",
  messagingSenderId: "227530398996",
  appId: "1:227530398996:web:f7b82da50d42dd4d7f3601"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Получение Firestore
const db = getFirestore(app);

// Экспортируем db для использования в других частях приложения
export { db };
