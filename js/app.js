import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
      <button class="primary-btn add-to-cart" 
        data-name="${product.name}" 
        data-price="${product.price}">
        Add to Cart
      </button>
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
// ================= CART DRAWER TOGGLE =================

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");

// Select the Cart link in navbar
const cartLink = document.querySelectorAll(".nav-icons a")[1];

if (cartLink) {
  cartLink.addEventListener("click", (e) => {
    e.preventDefault();
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
  });
}

if (closeCart) {
  closeCart.addEventListener("click", () => {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
  });
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", () => {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
  });
}
