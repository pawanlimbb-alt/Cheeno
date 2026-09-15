// js/complete-profile.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const form = document.getElementById("profile-form");
const firstNameEl = document.getElementById("first-name");
const lastNameEl = document.getElementById("last-name");
const emailDisplay = document.getElementById("email-display");
const deptEl = document.getElementById("department");
const semEl = document.getElementById("semester");
const industryEl = document.getElementById("industry");
const errorBox = document.getElementById("profile-error");
const submitBtn = document.getElementById("profile-submit");

const SEM_COUNT = {
  BTECH: 8,
  BCA: 6,
  BBA: 6
};

let currentUser = null;

function populateSemesters(dept) {
  const maxSem = SEM_COUNT[dept] || 0;
  semEl.innerHTML = "";

  if (!maxSem) {
    semEl.innerHTML = `<option value="">Select department first</option>`;
    semEl.disabled = true;
    return;
  }

  semEl.disabled = false;
  semEl.innerHTML = `<option value="">Select semester</option>` +
    Array.from({ length: maxSem }, (_, i) => i + 1)
      .map((n) => `<option value="${n}">Sem ${n}</option>`)
      .join("");
}

deptEl.addEventListener("change", () => populateSemesters(deptEl.value));
// initial state
populateSemesters(deptEl.value);

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("show");
}

// Auth guard: must be signed in. If a completed profile already exists, skip this page.
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  emailDisplay.textContent = user.email || "";

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists() && snap.data().profileComplete) {
      window.location.href = "index.html";
      return;
    }
  } catch (err) {
    console.error(err);
  }

  // Prefill names from the Google account as a starting point (still editable)
  if (user.displayName) {
    const parts = user.displayName.trim().split(/\s+/);
    firstNameEl.value = firstNameEl.value || parts[0] || "";
    lastNameEl.value = lastNameEl.value || parts.slice(1).join(" ") || "";
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.remove("show");

  const firstName = firstNameEl.value.trim();
  const lastName = lastNameEl.value.trim();
  const department = deptEl.value;
  const semester = semEl.value;
  const industryIntegrated = industryEl.value;

  if (!firstName || !lastName || !department || !semester || !industryIntegrated) {
    showError("Please fill in every field before continuing.");
    return;
  }

  if (!currentUser) {
    showError("You're not signed in. Please log in again.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Saving…";

  try {
    await setDoc(doc(db, "users", currentUser.uid), {
      uid: currentUser.uid,
      email: currentUser.email,
      role: "STUDENT",
      firstName,
      lastName,
      photoUrl: currentUser.photoURL || null,
      department,
      semester: Number(semester),
      section: null,
      bio: null,
      industryIntegrated,
      skills: [],
      hobbies: [],
      interests: [],
      verified: false,
      profileComplete: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    showError("Couldn't save your details. Please try again.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Finish setup";
  }
});