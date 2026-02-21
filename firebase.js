import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsZJviWYXZ-1Buclavnkk6P3gU43fCmtM",
  authDomain: "giftess-1119.firebaseapp.com",
  projectId: "giftess-1119",
  storageBucket: "giftess-1119.firebasestorage.app",
  messagingSenderId: "455652729219",
  appId: "1:455652729219:web:ce4cc662b1955a105796b6",
  measurementId: "G-FSBCLCJBJ6"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

window.auth = auth;
window.db = db;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.onAuthStateChanged = onAuthStateChanged;
window.signOutUser = signOut;

console.log("Firebase Connected");
