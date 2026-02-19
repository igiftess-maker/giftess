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
// ================= CART FUNCTIONALITY =================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

function updateCartUI() {
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    cartItemsContainer.innerHTML += `
      <div class="cart-item">
        <span>${item.name}</span>
        <span>₹${item.price}</span>
      </div>
    `;
  });

  cartTotal.innerText = "Total: ₹" + total;
  localStorage.setItem("cart", JSON.stringify(cart));
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("add-to-cart")) {
    const name = e.target.dataset.name;
    const price = parseInt(e.target.dataset.price);

    cart.push({ name, price });
    updateCartUI();

    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
  }
});

updateCartUI();
