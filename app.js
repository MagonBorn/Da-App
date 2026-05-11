// app.js
import { auth, db } from './firebase.js';

import { onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  doc,
  getDoc
}
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("app.js loaded");

const userEmailEl =
  document.getElementById("user-email");


onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "/Da-App/index.html";
    return;
  }

  try {

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (
      docSnap.exists() &&
      userEmailEl
    ) {
      userEmailEl.innerText =
        docSnap.data().email || user.email;
    }

  } catch (err) {
    console.error("App init error:", err);
  }

});