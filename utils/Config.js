import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7rv60sN3D9h9vKt2Swy8azdihtivpMBs",
  authDomain: "habits2-b1e68.firebaseapp.com",
  projectId: "habits2-b1e68",
  storageBucket: "habits2-b1e68.appspot.com",
  messagingSenderId: "675312494295",
  appId: "1:675312494295:web:270133ce025f7c978bf292"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);