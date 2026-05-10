import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with actual config
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForNow",
  authDomain: "edutrack-dummy.firebaseapp.com",
  projectId: "edutrack-dummy",
  storageBucket: "edutrack-dummy.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
