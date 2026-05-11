import {
    auth,
    db,
    logout
} from "../auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const output = document.getElementById("output");
const notepad = document.getElementById("notepad");
const customInput = document.getElementById("customTTI");

const COLLECTION = "textToImage";

/* --------------------------
   SAVE
-------------------------- */

async function savePreferences() {
    const user = auth.currentUser;
    if (!user) return;

    const customComments = [];

    document.querySelectorAll(".checkbox-group label").forEach(label => {
        const input = label.querySelector("input");
        customComments.push(input.value);
    });

    await setDoc(
        doc(db, "users", user.uid, "workflows", COLLECTION),
        {
            comments: customComments
        }
    );
}

/* --------------------------
   LOAD
-------------------------- */

async function loadPreferences() {
    const user = auth.currentUser;
    if (!user) return;

    const docSnap = await getDoc(
        doc(db, "users", user.uid, "workflows", COLLECTION)
    );

    if (!docSnap.exists()) return;

    const data = docSnap.data();

    data.comments.forEach(comment => {
        addCheckbox(comment);
    });
}

/* --------------------------
   CHECKBOX
-------------------------- */

function updateOutput() {
    const selected = [];

    document.querySelectorAll(
        '.checkbox-group input:checked'
    ).forEach(cb => selected.push(cb.value));

    output.value = selected.join("\n");
}

document.addEventListener("change", e => {
    if (e.target.type === "checkbox") {
        updateOutput();
    }
});

/* --------------------------
   ADD CUSTOM
-------------------------- */

function addCheckbox(text) {
    const label = document.createElement("label");

    label.innerHTML = `
        <input type="checkbox" value="${text}">
        ${text}
    `;

    document.querySelector(".checkbox-group")
        .appendChild(label);
}

document.querySelector(".add-btn")
.addEventListener("click", async () => {
    const value = customInput.value.trim();

    if (!value) return;

    addCheckbox(value);

    customInput.value = "";

    await savePreferences();
});

/* --------------------------
   COPY / CLEAR
-------------------------- */

document.querySelector(".copy")
.addEventListener("click", () => {
    navigator.clipboard.writeText(output.value);
});

document.querySelector(".clear")
.addEventListener("click", () => {
    output.value = "";
});

document.getElementById("logoutBtn")
.addEventListener("click", logout);

/* --------------------------
   INIT
-------------------------- */

auth.onAuthStateChanged(async user => {
    if (!user) {
        window.location.href = "../index.html";
        return;
    }

    await loadPreferences();
});