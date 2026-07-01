import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAc6lviQDF2Kf4TE0EkTUAadB76Xpijb9Q",
  authDomain: "zilan-todo.firebaseapp.com",
  projectId: "zilan-todo",
  storageBucket: "zilan-todo.appspot.com",
  messagingSenderId: "102644427423",
  appId: "1:102644427423:web:be9a70d2a67000e15e10aa",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();