import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBu4kcvmi5kBi83Y48JjvzwlwFbB_6M3vU",
  authDomain: "finances---dami.firebaseapp.com",
  projectId: "finances---dami",
  storageBucket: "finances---dami.firebasestorage.app",
  messagingSenderId: "743847840054",
  appId: "1:743847840054:web:fb702c517ad9afc1884b97"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
