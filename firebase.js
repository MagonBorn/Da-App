// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2FgxC1ykjt8o26ofl1HavzqD1rHQMJnY",
  authDomain: "dabackend-e72f7.firebaseapp.com",
  projectId: "dabackend-e72f7",
  storageBucket: "dabackend-e72f7.firebasestorage.app",
  messagingSenderId: "892294310337",
  appId: "1:892294310337:web:3c4ab150998847fe242740",
  measurementId: "G-3DEQ13YWTG"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);