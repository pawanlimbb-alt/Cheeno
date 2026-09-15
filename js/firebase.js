// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC92e6CsuYb42AMFGEfECueQBA900kVxNw",
  authDomain: "newweb-df656.firebaseapp.com",
  projectId: "newweb-df656",
  storageBucket: "newweb-df656.firebasestorage.app",
  messagingSenderId: "740623178130",
  appId: "1:740623178130:web:36ecc3683d0170db3c894b",
  measurementId: "G-Z9J110EQHL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the pieces we need
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();