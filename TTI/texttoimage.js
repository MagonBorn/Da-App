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

/* ==========================
   EVENTS
========================== */

function bindEvents() {

    const addBtn = document.querySelector(".add-btn");
    const clearBtn = document.querySelector(".clear");
    const copyBtn = document.querySelector(".copy");

    if (addBtn) {
        addBtn.addEventListener("click", handleAdd);
    }

    if (customInput) {
        customInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
            }
        });
    }

    document.addEventListener("change", e => {
        if (e.target.matches(".checkbox-group input")) {
            updateOutput();
        }
    });

    document.addEventListener("click", async e => {

        if (e.target.classList.contains("remove")) {
            e.target.parentElement.remove();

            updateOutput();
            await savePreferences();
        }

    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {

            checkboxGroup
                ?.querySelectorAll("input")
                .forEach(cb => cb.checked = false);

            output.value = "";

        });
    }

    if (copyBtn) {
        copyBtn.addEventListener("click", async () => {

            await navigator.clipboard.writeText(output.value);

            output.select();

            setTimeout(() => {
                output.setSelectionRange(0, 0);
            }, 400);

        });
    }

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

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

}

/* ==========================
   INIT
========================== */

auth.onAuthStateChanged(async user => {

    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    bindEvents();
    lockInputSecurity();

    await loadPreferences();

});