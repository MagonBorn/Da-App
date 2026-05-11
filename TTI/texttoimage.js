import { auth, db } from "../firebase.js";
import { logout } from "../auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const COLLECTION = "textToImage";

const output = document.getElementById("output");
const customInput = document.getElementById("customTTI");
const checkboxGroup = document.querySelector(".checkbox-group");
const logoutBtn = document.getElementById("logoutBtn");


/* ==========================
   FIRESTORE REF
========================== */

function workflowRef(user) {
    return doc(
        db,
        "users",
        user.uid,
        "workflows",
        COLLECTION
    );
}


/* ==========================
   SAVE (TEXT ONLY)
========================== */

async function savePreferences() {
    const user = auth.currentUser;
    if (!user) return;

    const comments = [];

    checkboxGroup.querySelectorAll("label").forEach(label => {
        const cb = label.querySelector("input");
        comments.push(cb.value);
    });

    await setDoc(
        workflowRef(user),
        { comments }
    );
}


/* ==========================
   LOAD
========================== */

async function loadPreferences() {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(workflowRef(user));

    if (!snap.exists()) return;

    checkboxGroup.innerHTML = "";

    snap.data().comments.forEach(comment => {

        if (typeof comment === "string") {
            addCheckbox(comment);
        } else if (comment.text) {
            addCheckbox(comment.text);
        }

    });

    updateOutput();
}


/* ==========================
   OUTPUT
========================== */

function updateOutput() {
    const selected = [];

    checkboxGroup
        .querySelectorAll("input:checked")
        .forEach(cb => selected.push(cb.value));

    output.value = selected.join("\n");
}


/* ==========================
   ADD CHECKBOX
========================== */

function addCheckbox(text) {
    const label = document.createElement("label");

    label.innerHTML = `
        <input type="checkbox" value="${text}">
        ${text}
        <span class="remove">✕</span>
    `;

    checkboxGroup.appendChild(label);
}


/* ==========================
   ADD CUSTOM
========================== */

async function handleAdd() {
    const value = customInput.value.trim();

    if (!value) return;

    addCheckbox(value);

    customInput.value = "";

    await savePreferences();
}

document.querySelector(".add-btn")
    .addEventListener("click", handleAdd);

customInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        handleAdd();
    }
});


/* ==========================
   CHECKBOX CHANGES
========================== */

document.addEventListener("change", e => {
    if (e.target.matches(".checkbox-group input")) {
        updateOutput();
    }
});


/* ==========================
   REMOVE COMMENTS
========================== */

document.addEventListener("click", async e => {

    if (e.target.classList.contains("remove")) {
        e.target.parentElement.remove();

        updateOutput();
        await savePreferences();
    }

});


/* ==========================
   CLEAR
========================== */

document.querySelector(".clear")
    .addEventListener("click", () => {

        checkboxGroup
            .querySelectorAll("input")
            .forEach(cb => cb.checked = false);

        output.value = "";

    });


/* ==========================
   COPY
========================== */

document.querySelector(".copy")
    .addEventListener("click", () => {
        navigator.clipboard.writeText(output.value);
    });


/* ==========================
   COLLAPSE
========================== */

document.querySelectorAll(".section-header")
    .forEach(header => {

        header.addEventListener("click", () => {

            const section = header.closest(".section");
            const toggle = header.querySelector(".toggle");

            section.classList.toggle("collapsed");

            if (toggle) {
                toggle.textContent =
                    section.classList.contains("collapsed")
                        ? "+"
                        : "−";
            }

        });

    });


/* ==========================
   LOGOUT
========================== */

logoutBtn.addEventListener("click", logout);


/* ==========================
   INIT
========================== */

auth.onAuthStateChanged(async user => {

    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    await loadPreferences();

});

// DISABLE PASTING IN TEXT AREAS
function disablePaste(el) {
    el.addEventListener("paste", (e) => {
        e.preventDefault();
    });
}

document.getElementById("logoutBtn").addEventListener("click", () => {
    document.getElementById("notepad").value = "";
});

document.addEventListener("paste", (e) => {
    if (e.target.tagName === "TEXTAREA") {
        e.preventDefault();
    }
});

// BLOCK PASTE IN LEFT PANEL INPUTS
document.addEventListener("paste", (e) => {
    const target = e.target;

    // Only block if it's inside the LEFT panel and is a text input
    if (
        target.closest(".left") &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
    ) {
        e.preventDefault();
    }
});

// PREVENT TEXT DRAG AND DROP
document.addEventListener("drop", (e) => {
    const target = e.target;

    if (
        (target.closest(".left") && target.tagName === "INPUT") ||
        (target.closest(".right") && target.tagName === "TEXTAREA")
    ) {
        e.preventDefault();
    }
});

document.addEventListener("dragover", (e) => {
    const target = e.target;

    if (
        (target.closest(".left") && target.tagName === "INPUT") ||
        (target.closest(".right") && target.tagName === "TEXTAREA")
    ) {
        e.preventDefault();
    }
});

disablePaste(output);
disablePaste(notepad);