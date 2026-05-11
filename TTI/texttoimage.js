import { logout } from "../auth.js";
import { auth, db } from "../firebase.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const COLLECTION = "textToImage";

const output = document.getElementById("output");
const customInput = document.getElementById("customTTI");
const checkboxGroup = document.querySelector(".checkbox-group");
const logoutBtn = document.getElementById("logoutBtn");


/* ==========================
   SAVE TO FIRESTORE
========================== */

async function savePreferences() {
    const user = auth.currentUser;
    if (!user) return;

    const comments = [];

    checkboxGroup.querySelectorAll("label")
        .forEach(label => {
            const cb = label.querySelector("input");

            comments.push({
                text: cb.value,
                checked: cb.checked
            });
        });

    await setDoc(
        workflowRef(user),
        { comments }
    );
}


/* ==========================
   LOAD FROM FIRESTORE
========================== */

async function loadPreferences() {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(
        workflowRef(user)
    );

    if (!snap.exists()) return;

    checkboxGroup.innerHTML = "";

    snap.data().comments.forEach(item => {
        addCheckbox(item.text, item.checked);
    });

    updateOutput();
}


/* ==========================
   UPDATE OUTPUT TEXTAREA
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

function addCheckbox(text, checked = false) {
    const label = document.createElement("label");

    label.innerHTML = `
        <input type="checkbox"
               value="${text}"
               ${checked ? "checked" : ""}>
        ${text}
        <span class="remove">✕</span>
    `;

    checkboxGroup.appendChild(label);
}


/* ==========================
   ADD CUSTOM COMMENT
========================== */

async function handleAdd() {
    const value = customInput.value.trim();

    if (!value) return;

    addCheckbox(value, false);

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
   CHECK / REMOVE EVENTS
========================== */

document.addEventListener("click", async e => {

    /* REMOVE COMMENT */
    if (e.target.classList.contains("remove")) {
        e.target.parentElement.remove();

        updateOutput();
        await savePreferences();
    }

});

document.addEventListener("change", async e => {

    /* CHECKBOX CHANGE */
    if (e.target.matches('.checkbox-group input[type="checkbox"]')) {
        updateOutput();
        await savePreferences();
    }

});


/* ==========================
   COLLAPSE GROUP
========================== */

document.querySelectorAll(".section-header")
    .forEach(header => {

        header.addEventListener("click", () => {
            header.parentElement.classList.toggle("collapsed");
        });

    });


/* ==========================
   COPY / CLEAR
========================== */

document.querySelector(".copy")
    .addEventListener("click", () => {
        navigator.clipboard.writeText(output.value);
    });

document.querySelector(".clear")
    .addEventListener("click", () => {
        output.value = "";
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

// Debugging - Delete after testing:
function workflowRef(user) {
    return doc(
        db,
        "users",
        user.uid,
        "workflows",
        COLLECTION
    );
}