// js/login.js
import { auth, db, googleProvider } from "./firebase.js";
import {
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const googleBtn = document.getElementById("google-signin-btn");
const errorBox = document.getElementById("login-error");
const statusText = document.getElementById("login-status");

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.add("show");
}

function setLoading(isLoading) {
  googleBtn.disabled = isLoading;
  statusText.textContent = isLoading ? "Signing you in…" : "";
}

// Decide where a signed-in user should land:
// - Has a completed profile doc in Firestore -> straight to the homepage
// - No profile doc yet (first time signing in) -> details form
async function routeUser(user) {
  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists() && snap.data().profileComplete) {
      window.location.href = "index.html";
    } else {
      window.location.href = "complete-profile.html";
    }
  } catch (err) {
    console.error(err);
    showError("Couldn't check your account. Please try again.");
    setLoading(false);
  }
}

googleBtn.addEventListener("click", async () => {
  errorBox.classList.remove("show");
  setLoading(true);
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await routeUser(result.user);
  } catch (err) {
    console.error(err);
    setLoading(false);
    if (err.code === "auth/popup-closed-by-user") {
      // user just closed the popup, no need to show a scary error
      return;
    }
    showError("Sign-in failed. Please try again.");
  }
});

// If someone is already signed in and lands back on the login page
// (e.g. pressed back), route them automatically instead of showing the button spin.
onAuthStateChanged(auth, (user) => {
  if (user) {
    routeUser(user);
  }
});