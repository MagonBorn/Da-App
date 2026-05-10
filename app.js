// app.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("app.js is loaded");

const userEmailEl = document.getElementById("user-email");

// Protect page
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      userEmailEl.innerText = docSnap.data().email;
    }
  }
});


document.addEventListener("DOMContentLoaded", () => {
    const navToggle = document.getElementById("navToggle");
    const dropdownMenu = document.getElementById("dropdownMenu");

    if (navToggle && dropdownMenu) {
        navToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (
                !navToggle.contains(e.target) &&
                !dropdownMenu.contains(e.target)
            ) {
                dropdownMenu.classList.remove("show");
            }
        });
    }
});