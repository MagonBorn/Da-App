import { auth, db } from './firebase.js';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// REGISTER
document.getElementById("registerBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      createdAt: new Date()
    });

    alert("Registered!");
  } catch (err) {
    alert(err.message);
  }
});

// LOGIN
document.getElementById("loginBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "./Dashboard/dashboard.html";
  } catch (err) {
    alert(err.message);
  }
});

// RESET PASSWORD
document.getElementById("resetBtn")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value;

  if (!email) return alert("Enter email first");

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Reset email sent!");
  } catch (err) {
    alert(err.message);
  }
});

// LOGOUT (used in dashboard)
export function logout() {
  signOut(auth).then(() => {
    window.location.href = "./index.html";
  });
}