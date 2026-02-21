// ================= IMPORTS =================

import { auth, db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// =====================================================
// ================= LOAD CATEGORIES ===================
// =====================================================

const categoriesContainer = document.getElementById("categoriesContainer");

if (categoriesContainer) {
  loadCategories();
}

async function loadCategories() {
  try {
    const snapshot = await getDocs(collection(db, "categories"));
    categoriesContainer.innerHTML = "";

    snapshot.forEach(docSnap => {
      const category = docSnap.data();

      categoriesContainer.innerHTML += `
        <div class="category-card" data-category="${category.name}">
          <img src="${category.image}" alt="${category.name}">
          <p>${category.name}</p>
        </div>
      `;
    });

  } catch (error) {
    console.error("Error loading categories:", error);
  }
}


// =====================================================
// ================= LOAD PRODUCTS =====================
// =====================================================

const productContainer = document.getElementById("productContainer");
const addonContainer = document.getElementById("addonProducts");

if (productContainer || addonContainer) {
  loadProducts();
}

async function loadProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));

    if (productContainer) productContainer.innerHTML = "";
    if (addonContainer) addonContainer.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const product = docSnap.data();

      // NORMAL PRODUCTS
      if (!product.isAddon && productContainer) {
        productContainer.innerHTML += `
          <div class="product-card" data-category="${product.category || ""}">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
              <h3>${product.name}</h3>
              <p>${product.description || ""}</p>
              <div class="product-price">₹${product.price}</div>
              <button class="primary-btn add-to-cart"
                data-name="${product.name}"
                data-price="${product.price}"
                data-delivery="${product.deliveryCharge || 0}">
                Add to Cart
              </button>
            </div>
          </div>
        `;
      }

      // ADDON PRODUCTS
      if (product.isAddon && addonContainer) {
        addonContainer.innerHTML += `
          <div class="cart-item">
            <span>${product.name} - ₹${product.price}</span>
            <button class="primary-btn add-to-cart"
              data-name="${product.name}"
              data-price="${product.price}"
              data-delivery="${product.deliveryCharge || 0}">
              Add
            </button>
          </div>
        `;
      }
    });

  } catch (error) {
    console.error("Error loading products:", error);
  }
}


// =====================================================
// ================= CATEGORY FILTER ===================
// =====================================================

document.addEventListener("click", function (e) {
  if (e.target.closest(".category-card")) {
    const card = e.target.closest(".category-card");
    const selectedCategory = card.dataset.category;

    filterProductsByCategory(selectedCategory);
  }
});

function filterProductsByCategory(categoryName) {
  const allProducts = document.querySelectorAll(".product-card");

  allProducts.forEach(card => {
    if (card.dataset.category === categoryName) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}


// =====================================================
// ================= CART SYSTEM =======================
// =====================================================

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartLink = document.getElementById("cartLink");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

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

function updateCartUI() {
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    cartItemsContainer.innerHTML += `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong><br>
          ₹${item.price} x ${item.quantity}
        </div>
        <div>
          <button onclick="changeQty(${index}, -1)">−</button>
          <button onclick="changeQty(${index}, 1)">+</button>
        </div>
      </div>
    `;
  });

  if (cartTotal) cartTotal.innerText = "Total: ₹" + total;
  localStorage.setItem("cart", JSON.stringify(cart));
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("add-to-cart")) {
    const name = e.target.dataset.name;
    const price = parseInt(e.target.dataset.price);
    const deliveryCharge = parseInt(e.target.dataset.delivery || 0);

    const existing = cart.find(item => item.name === name);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1, deliveryCharge });
    }

    updateCartUI();
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
  }
});

window.changeQty = function(index, change) {
  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  updateCartUI();
};

updateCartUI();


// =====================================================
// ================= GO TO CHECKOUT ====================
// =====================================================

const goCheckoutBtn = document.getElementById("goCheckoutBtn");

if (goCheckoutBtn) {
  goCheckoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    window.location.href = "checkout.html";
  });
}


// =====================================================
// ================= AUTH SESSION ======================
// =====================================================

const loginLink = document.getElementById("loginLink");
const userProfile = document.getElementById("userProfile");
const userAvatar = document.getElementById("userAvatar");
const userDropdown = document.getElementById("userDropdown");
const adminLink = document.getElementById("adminLink");
const logoutLink = document.getElementById("logoutLink");

if (loginLink && userProfile) {

  onAuthStateChanged(auth, async (user) => {
    if (user) {

      const firstLetter = user.email.charAt(0).toUpperCase();
      const colors = ["#d98a9b", "#c77d92", "#e7a5b4", "#b86b7d"];
      const colorIndex = user.email.length % colors.length;

      userAvatar.textContent = firstLetter;
      userAvatar.style.backgroundColor = colors[colorIndex];

      userProfile.style.display = "flex";
      loginLink.style.display = "none";

      // Admin Check
      const adminRef = doc(db, "admins", user.email);
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists()) {
        adminLink.style.display = "block";
      } else {
        adminLink.style.display = "none";
      }

    } else {
      userProfile.style.display = "none";
      loginLink.style.display = "block";
    }
  });

  // Dropdown Toggle
  userAvatar.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("show");
  });

  // Close dropdown outside click
  document.addEventListener("click", (e) => {
    if (!userProfile.contains(e.target)) {
      userDropdown.classList.remove("show");
    }
  });

  // Logout
  if (logoutLink) {
    logoutLink.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }
}
// ================= PRICE FILTER =================

document.querySelectorAll(".price-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const value = btn.dataset.price;
    const products = document.querySelectorAll(".product-card");

    products.forEach(product => {
      const price = parseInt(product.dataset.price);

      if (value === "all") {
        product.style.display = "block";
      } else if (value === "above") {
        product.style.display = price > 2099 ? "block" : "none";
      } else {
        product.style.display = price <= parseInt(value) ? "block" : "none";
      }
    });
  });
});
