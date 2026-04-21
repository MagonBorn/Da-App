import { logout } from './auth.js';
import { db } from './firebase.js';
import { auth } from './firebase.js';
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const output = document.getElementById("output");

// UPDATE OUTPUT
function updateOutput() {
  const grouped = { A: [], B: [] };

  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    if (cb.checked) {
      grouped[cb.dataset.group].push(cb.value);
    }
  });

  let result = "";

  if (grouped.A.length) {
    result += "Response A:\n";
    grouped.A.forEach(i => result += "- " + i + "\n");
    result += "\n";
  }

  if (grouped.B.length) {
    result += "Response B:\n";
    grouped.B.forEach(i => result += "- " + i + "\n");
  }

  output.value = result.trim();
}

// ADD CUSTOM
function addCustom(group) {
  const input = document.getElementById("custom" + group);
  const value = input.value.trim();
  if (!value) return;

  const container = document.querySelector(`#response${group} .checkbox-group`);

  const label = document.createElement("label");
  label.innerHTML = `
    <input type="checkbox" data-group="${group}" value="${value}">
    ${value}
    <span class="remove" data-group="${group}" data-value="${value}">✕</span>
  `;

  container.appendChild(label);
  input.value = "";

  savePreferences(); // ✅ persist
}

// REMOVE CUSTOM
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove")) {
    const label = e.target.parentElement;
    label.remove();
    savePreferences();
  }
});

// COPY
function copyText() {
  output.select();
  document.execCommand("copy");
}

// CLEAR
function clearAll() {
  output.value = "";
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
}

// EVENTS
document.addEventListener("change", e => {
  if (e.target.type === "checkbox") updateOutput();
});

document.querySelectorAll(".add-btn").forEach(btn => {
  btn.addEventListener("click", () => addCustom(btn.dataset.group));
});

document.querySelector(".copy").addEventListener("click", copyText);
document.querySelector(".clear").addEventListener("click", clearAll);
document.getElementById("logoutBtn").addEventListener("click", logout);

// LOAD USER PREF ON LOGIN
async function loadPreferences() {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data();

  renderCheckboxes("A", data.responseA || []);
  renderCheckboxes("B", data.responseB || []);
}

// RENDER CHECKBOXES DYNAMICALLY
function renderCheckboxes(group, items) {
  const container = document.querySelector(`#response${group} .checkbox-group`);
  container.innerHTML = "";

  items.forEach(value => {
    const label = document.createElement("label");

    label.innerHTML = `
      <input type="checkbox" data-group="${group}" value="${value}">
      ${value}
      <span class="remove" data-value="${value}" data-group="${group}">✕</span>
    `;

    container.appendChild(label);
  });
}

// SAVE PREFERENCES
async function savePreferences() {
  const user = auth.currentUser;
  if (!user) return;

  const grouped = { A: [], B: [] };

  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    grouped[cb.dataset.group].push(cb.value);
  });

  await setDoc(doc(db, "users", user.uid), {
    responseA: grouped.A,
    responseB: grouped.B
  });
}

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadPreferences();
  }
});