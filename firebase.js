// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyB9ThIDs4hNy_IUTHmIwGPYjhbS-rbmGYM",
  authDomain: "cambridge-school-e4a8f.firebaseapp.com",
  databaseURL: "https://cambridge-school-e4a8f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cambridge-school-e4a8f",
  storageBucket: "cambridge-school-e4a8f.firebasestorage.app", // shu holicha qoldirdim
  messagingSenderId: "586644599616",
  appId: "1:586644599616:web:ef120c3f3448ca65a180a5",
  measurementId: "G-L6QFTR85TC",
};

// ❗ har safar bitta app instance
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth: RN persist mavjud bo‘lsa yoqamiz (mavjud bo‘lmasa fallback)
let auth;
if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    const { initializeAuth, getReactNativePersistence } = require("firebase/auth/react-native");
    auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    auth = getAuth(app);
  }
}

// Firestore: Hermes’da ishonchli bo‘lishi uchun aniq init
let firestore;
try {
  firestore = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
} catch {
  // agar allaqachon init qilingan bo‘lsa
  firestore = getFirestore(app);
}

const storage = getStorage(app);

export { app, auth, firestore, storage };
