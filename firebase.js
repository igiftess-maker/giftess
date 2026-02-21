import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

window.auth = getAuth(app);
window.db = getFirestore(app);

console.log("Firebase Connected");
