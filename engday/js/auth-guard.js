// js/auth-guard.js
// Shared auth guard — import from any page that requires a logged-in user with a complete profile.
//
// Usage:
//   import { getCurrentUser, logOut } from "./auth-guard.js";
//   const { user, profile } = await getCurrentUser();

import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

/**
 * Returns a Promise that resolves with { user, profile } once we have
 * a signed-in user whose Firestore profile is complete.
 *
 * If the user is not signed in → redirects to login.html.
 * If signed in but profile is incomplete → redirects to complete-profile.html.
 */
export function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // we only need the first emission

      if (!user) {
        window.location.href = "login.html";
        return; // never resolves — page is navigating away
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (!snap.exists() || !snap.data().profileComplete) {
          window.location.href = "complete-profile.html";
          return; // never resolves — page is navigating away
        }

        resolve({ user, profile: snap.data() });
      } catch (err) {
        console.error("Auth guard: failed to fetch profile", err);
        reject(err);
      }
    });
  });
}

/**
 * Sign the current user out and redirect to login.html.
 */
export async function logOut() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Sign-out failed", err);
  }
  window.location.href = "login.html";
}
