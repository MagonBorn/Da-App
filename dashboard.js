import { logout } from './auth.js';
import { db } from './firebase.js';
import { auth } from './firebase.js';
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const output = document.getElementById("output");

// DEFAULTS
const DEFAULTS = {
    A: [
        "Better range in pitch variation",
        "Better emphasis on words",
        "Better voice consistency"
    ],
    B: [
        "Better range in pitch variation",
        "Better emphasis on words",
        "Better voice consistency"
    ],
    C: [] // Comments start empty
};

// UPDATE OUTPUT
function updateOutput() {
    const grouped = { A: [], B: [], C: [] };

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
        result += "\n";
    }

    if (grouped.C.length) {
        result += "Comments:\n";
        grouped.C.forEach(i => result += "- " + i + "\n");
    }

    document.getElementById("output").value = result.trim();
}

// ADD CUSTOM
function addCustom(group) {
    const input = document.getElementById("custom" + group);
    const value = input.value.trim();

    if (!value) return;

    const container = document.querySelector(`#response${group} .checkbox-group`);

    const label = document.createElement("label");
    label.innerHTML = `
    <input type="checkbox" data-group="${group}" value="${value}" checked>
    ${value}
    <span class="remove" data-group="${group}" data-value="${value}">✕</span>
  `;

    container.appendChild(label);

    input.value = "";
    input.focus(); // ✅ keeps typing flow smooth

    savePreferences();
    updateOutput(); // ✅ ensures it appears immediately
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

    let data;

    if (!snap.exists()) {
        // ✅ First-time user → use defaults
        data = {
            responseA: DEFAULTS.A,
            responseB: DEFAULTS.B
        };

        // Save defaults for future use
        await setDoc(ref, data);
    } else {
        data = snap.data();
    }

    renderCheckboxes("A", data.responseA || DEFAULTS.A);
    renderCheckboxes("B", data.responseB || DEFAULTS.B);
    renderCheckboxes("C", data.responseC || DEFAULTS.C);
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

    const grouped = { A: [], B: [], C: [] };

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        grouped[cb.dataset.group].push(cb.value);
    });

    await setDoc(doc(db, "users", user.uid), {
        responseA: grouped.A,
        responseB: grouped.B,
        responseC: grouped.C
    });
}

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        loadPreferences();
    }
});

// ADD TEXT USING ENTER
document.addEventListener("keydown", (e) => {
    // Only trigger inside text inputs
    if (e.target.matches('input[type="text"]') && e.key === "Enter") {
        e.preventDefault(); // stop form-like behaviour

        const inputId = e.target.id;

        // Extract group from input ID (customA, customB, customC)
        const group = inputId.replace("custom", "");

        addCustom(group);
    }
});