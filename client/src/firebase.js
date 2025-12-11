// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDB-2JMbsdZmTPe8JGd-63FcwBERdWagFU",
  authDomain: "learning-platform-aabbf.firebaseapp.com",
  projectId: "learning-platform-aabbf",
  storageBucket: "learning-platform-aabbf.firebasestorage.app",
  messagingSenderId: "997706445618",
  appId: "1:997706445618:web:efd414e99bb55ee6d65d2b",
  measurementId: "G-QJ0LN6EVVB",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
