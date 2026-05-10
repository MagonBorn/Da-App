// app.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const userEmailEl = document.getElementById("user-email");

// Protect page
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./Dashboard/dashboard.html";
  } else {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      userEmailEl.innerText = docSnap.data().email;
    }
  }
});