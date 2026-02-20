import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ================= LOAD PRODUCTS =================

const productContainer = document.getElementById("productContainer");
const addonContainer = document.getElementById("addonProducts");

if (productContainer || addonContainer) {
  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));

      if (productContainer) productContainer.innerHTML = "";
      if (addonContainer) addonContainer.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const product = doc.data();

        // NORMAL PRODUCTS
        if (!product.isAddon && productContainer) {
          productContainer.innerHTML += `
            <div class="product-card">
              <img src="${product.image}" alt="${product.name}">
              <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
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
  };

  loadProducts();
}

// ================= CART SYSTEM =================

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartLink = document.querySelectorAll(".nav-icons a")[1];

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

  cartTotal.innerText = "Total: ₹" + total;
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

// ================= GO TO CHECKOUT =================

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

const checkoutItems = document.getElementById("checkoutItems");

if (checkoutItems) {
  const cartData = JSON.parse(localStorage.getItem("cart")) || [];

  let subtotal = 0;
  let deliveryCharge = 0;

  checkoutItems.innerHTML = "";

  cartData.forEach(item => {
    subtotal += item.price * item.quantity;

    deliveryCharge = Math.max(deliveryCharge, item.deliveryCharge || 0);

    checkoutItems.innerHTML += `
      <div class="cart-item">
        <span>${item.name} x ${item.quantity}</span>
        <span>₹${item.price * item.quantity}</span>
      </div>
    `;
  });

  const total = subtotal + deliveryCharge;

  document.getElementById("checkoutSubtotal").innerText =
    "Subtotal: ₹" + subtotal;

  if (deliveryCharge > 0) {
    document.getElementById("checkoutTotal").innerText =
      "Total (incl. ₹" + deliveryCharge + " delivery): ₹" + total;
  } else {
    document.getElementById("checkoutTotal").innerText =
      "Total: ₹" + total + " (Free Shipping)";
  }
}
