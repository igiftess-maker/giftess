import { auth, db } from "./firebase.js";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


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
// ================= PLACE ORDER =================

const placeOrderBtn = document.getElementById("placeOrderBtn");

if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", async () => {

    const name = document.getElementById("custName").value.trim();
    const email = document.getElementById("custEmail").value.trim();
    const password = document.getElementById("custPassword").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    const pin = document.getElementById("custPin").value.trim();

    if (!name || !email || !password || !phone || !address || !pin) {
      alert("Please fill all details.");
      return;
    }

    const cartData = JSON.parse(localStorage.getItem("cart")) || [];

    if (cartData.length === 0) {
      alert("Cart is empty.");
      return;
    }

    let subtotal = 0;
    let deliveryCharge = 0;

    cartData.forEach(item => {
      subtotal += item.price * item.quantity;
      deliveryCharge = Math.max(deliveryCharge, item.deliveryCharge || 0);
    });

    const total = subtotal + deliveryCharge;

    // Generate SKU
    const today = new Date();
    const datePart =
      today.getFullYear().toString() +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');

    const randomPart = Math.floor(1000 + Math.random() * 9000);

    const orderId = `GF-${datePart}-${randomPart}`;

    try {
      // Create account
      await createUserWithEmailAndPassword(auth, email, password);

      // Save order in Firestore
      await addDoc(collection(db, "orders"), {
        orderId,
        name,
        email,
        phone,
        address,
        pin,
        items: cartData,
        subtotal,
        deliveryCharge,
        total,
        status: "Pending",
        createdAt: new Date()
      });

      localStorage.removeItem("cart");

      // Prepare WhatsApp message
      let message = `Order ID: ${orderId}%0A`;
      message += `Name: ${name}%0A`;
      message += `Phone: ${phone}%0A`;
      message += `Address: ${address}, ${pin}%0A`;
      message += `Items:%0A`;

      cartData.forEach(item => {
        message += `- ${item.name} x ${item.quantity}%0A`;
      });

      message += `Subtotal: ₹${subtotal}%0A`;
      message += `Delivery: ₹${deliveryCharge}%0A`;
      message += `Total: ₹${total}`;

      window.location.href =
        `https://wa.me/916002698296?text=${message}`;

    } catch (error) {
      alert(error.message);
    }

  });
}
// ================= LOGIN PAGE =================



const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("authMessage");

    if (!email || !password) {
      message.innerText = "Please fill all fields.";
      message.style.color = "red";
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "index.html";
    } catch (error) {
      message.innerText = error.message;
      message.style.color = "red";
    }
  });
}
// ================= AUTH SESSION CHECK =================

const loginLink = document.getElementById("loginLink");
const userProfile = document.getElementById("userProfile");
const userAvatar = document.getElementById("userAvatar");
const userDropdown = document.getElementById("userDropdown");
const adminLink = document.getElementById("adminLink");
const logoutLink = document.getElementById("logoutLink");

if (loginLink && userProfile) {

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Show avatar
      const firstLetter = user.email.charAt(0).toUpperCase();
      const colors = ["#EA4335", "#FBBC05", "#34A853", "#4285F4", "#FF6D01"];
      const colorIndex = user.email.length % colors.length;

      userAvatar.textContent = firstLetter;
      userAvatar.style.backgroundColor = colors[colorIndex];

      userProfile.style.display = "flex";
      loginLink.style.display = "none";

      // Check if admin
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

  // Toggle dropdown
  userAvatar.addEventListener("click", () => {
    userDropdown.style.display =
      userDropdown.style.display === "flex" ? "none" : "flex";
  });

  // Logout
  if (logoutLink) {
    logoutLink.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!userProfile.contains(e.target)) {
      userDropdown.style.display = "none";
    }
  });
}
