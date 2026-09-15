// js/complete-profile.js
import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

import { fetchLeetCodeStats } from "./leetcode.js";
import { uploadToCloudinary } from "./cloudinary.js";

const form = document.getElementById("profile-form");
const firstNameEl = document.getElementById("first-name");
const lastNameEl = document.getElementById("last-name");
const emailDisplay = document.getElementById("email-display");
const deptEl = document.getElementById("department");
const semEl = document.getElementById("semester");
const industryEl = document.getElementById("industry");
const leetcodeEl = document.getElementById("leetcode-handle");
const bioEl = document.getElementById("bio");
const photoUrlVal = document.getElementById("photo-url-val");
const avatarInput = document.getElementById("avatar-input");
const avatarPreviewImg = document.getElementById("avatar-preview-img");
const avatarPlaceholder = document.getElementById("avatar-preview-placeholder");
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

// Handle avatar photo upload
avatarInput?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    submitBtn.disabled = true;
    const res = await uploadToCloudinary(file, { folder: "cheeno/avatars" });
    if (res && res.url) {
      if (photoUrlVal) photoUrlVal.value = res.url;
      if (avatarPreviewImg) {
        avatarPreviewImg.src = res.url;
        avatarPreviewImg.style.display = "block";
      }
      if (avatarPlaceholder) avatarPlaceholder.style.display = "none";
    }
  } catch (err) {
    console.error("Avatar upload failed:", err);
    showError("Could not upload avatar: " + err.message);
  } finally {
    submitBtn.disabled = false;
  }
});

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

  if (user.photoURL && !photoUrlVal.value) {
    photoUrlVal.value = user.photoURL;
    if (avatarPreviewImg) {
      avatarPreviewImg.src = user.photoURL;
      avatarPreviewImg.style.display = "block";
    }
    if (avatarPlaceholder) avatarPlaceholder.style.display = "none";
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
  const leetcodeHandle = leetcodeEl ? leetcodeEl.value.trim() : "";
  const bio = bioEl ? bioEl.value.trim() : "";

  if (!firstName || !lastName || !department || !semester || !industryIntegrated) {
    showError("Please fill in every required field before continuing.");
    return;
  }

  if (!currentUser) {
    showError("You're not signed in. Please log in again.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Setting up your profile…";

  let leetcodeStats = null;
  if (leetcodeHandle) {
    try {
      submitBtn.textContent = "Fetching LeetCode stats…";
      leetcodeStats = await fetchLeetCodeStats(leetcodeHandle);
    } catch (lcErr) {
      console.warn("Could not fetch LeetCode stats during setup:", lcErr);
      // Create minimal leetcodeStats placeholder
      leetcodeStats = {
        username: leetcodeHandle,
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        ranking: 0,
        profileUrl: `https://leetcode.com/u/${leetcodeHandle}/`,
        lastSyncedAt: new Date().toISOString()
      };
    }
  }

  submitBtn.textContent = "Saving…";

  try {
    const links = {};
    if (leetcodeHandle) {
      links.leetcode = `https://leetcode.com/u/${leetcodeHandle}/`;
    }

    await setDoc(doc(db, "users", currentUser.uid), {
      uid: currentUser.uid,
      email: currentUser.email,
      role: "STUDENT",
      firstName,
      lastName,
      photoUrl: photoUrlVal?.value || currentUser.photoURL || null,
      department,
      semester: Number(semester),
      section: null,
      bio: bio || null,
      industryIntegrated,
      skills: [],
      hobbies: [],
      interests: [],
      links: links,
      leetcodeUsername: leetcodeHandle || null,
      leetcodeStats: leetcodeStats || null,
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