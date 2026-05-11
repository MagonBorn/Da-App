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

    const comments = [];

    document.querySelectorAll(".checkbox-group label")
        .forEach(label => {
            const cb = label.querySelector("input");

            comments.push({
                text: cb.value,
                checked: cb.checked
            });
        });

    await setDoc(
        doc(db, "users", user.uid, "workflows", COLLECTION),
        { comments }
    );
}

/* --------------------------
   LOAD
-------------------------- */

async function loadPreferences() {
    const user = auth.currentUser;
    if (!user) return;

    const snap = await getDoc(
        doc(db, "users", user.uid, "workflows", COLLECTION)
    );

    if (!snap.exists()) return;

    const data = snap.data();

    document.querySelector(".checkbox-group").innerHTML = "";

    data.comments.forEach(item => {
        addCheckbox(item.text, item.checked);
    });

    updateOutput();
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

document.addEventListener("change", async (e) => {
    if (e.target.matches('.checkbox-group input[type="checkbox"]')) {
        updateOutput();
        await savePreferences();
    }
});

/* --------------------------
   ADD CUSTOM
-------------------------- */

function addCheckbox(text, checked = false) {
    const label = document.createElement("label");

    label.innerHTML = `
        <input type="checkbox"
               value="${text}"
               ${checked ? "checked" : ""}>
        ${text}
    `;

    document.querySelector(".checkbox-group")
        .appendChild(label);
}

document.querySelector(".add-btn")
    .addEventListener("click", async () => {
        const value = customInput.value.trim();

        if (!value) return;

        addCheckbox(value, false);

        customInput.value = "";

        await savePreferences();
        updateOutput();
    });

customInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        document.querySelector(".add-btn").click();
    }
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