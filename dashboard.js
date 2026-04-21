import { logout } from './auth.js';

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
  label.innerHTML = `<input type="checkbox" data-group="${group}" value="${value}">${value}`;

  container.appendChild(label);
  input.value = "";
}

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