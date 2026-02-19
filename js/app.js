import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ================= LOGIN LOGIC =================

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


// ================= SESSION CHECK =================

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


// ================= LOAD PRODUCTS =================

const productContainer = document.getElementById("productContainer");

if (productContainer) {
  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      productContainer.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const product = doc.data();

        productContainer.innerHTML += `
          <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>${product.description}</p>
              <div class="product-price">₹${product.price}</div>
            </div>
          </div>
        `;
      });

    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  loadProducts();
}
