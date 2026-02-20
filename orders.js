import { auth, db } from "./firebase.js";

import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const ordersContainer = document.getElementById("ordersContainer");

// ================= CHECK LOGIN =================

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadUserOrders(user.email);
});

// ================= LOAD USER ORDERS =================

async function loadUserOrders(email) {

  const q = query(
    collection(db, "orders"),
    where("email", "==", email)
  );

  const querySnapshot = await getDocs(q);

  ordersContainer.innerHTML = "";

  if (querySnapshot.empty) {
    ordersContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  querySnapshot.forEach((docSnap) => {
    const order = docSnap.data();

    let itemsHTML = "";

    order.items.forEach(item => {
      itemsHTML += `
        <div>
          ${item.name} x ${item.quantity}
        </div>
      `;
    });

    let trackingHTML = "";

    if (order.trackingLink) {
      trackingHTML = `
        <p><strong>Tracking:</strong> 
          <a href="${order.trackingLink}" target="_blank">
            Track Shipment
          </a>
        </p>
      `;
    }

    ordersContainer.innerHTML += `
      <div class="product-card" style="margin-bottom:20px;">
        <div class="product-info">
          <h3>Order ID: ${order.orderId}</h3>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Total:</strong> ₹${order.total}</p>
          <div><strong>Items:</strong>${itemsHTML}</div>
          ${trackingHTML}
        </div>
      </div>
    `;
  });
}
