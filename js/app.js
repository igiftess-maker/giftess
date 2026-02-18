import { auth } from "./firebase.js";
import { 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// LOGIN LOGIC
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("authMessage");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      message.style.color = "green";
      message.innerText = "Login successful!";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);

    } catch (error) {
      message.style.color = "red";
      message.innerText = error.message;
    }
  });
}

// SESSION CHECK (Navbar Login → Logout)
const loginLink = document.querySelector(".nav-icons a");

if (loginLink) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginLink.innerText = "Logout";
      loginLink.href = "#";

      loginLink.addEventListener("click", () => {
        signOut(auth);
        window.location.reload();
      });
    }
  });
}
