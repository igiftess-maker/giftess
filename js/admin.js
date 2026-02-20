import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ordersContainer = document.getElementById("ordersContainer");

// ================= AUTH + ROLE CHECK =================

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const adminRef = doc(db, "admins", user.email);
  const adminSnap = await getDoc(adminRef);

  if (!adminSnap.exists()) {
    alert("Access Denied");
    window.location.href = "index.html";
    return;
  }

  loadOrders();
});

// ================= LOAD ORDERS =================

async function loadOrders() {
  const querySnapshot = await getDocs(collection(db, "orders"));

  ordersContainer.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const order = docSnap.data();
    const docId = docSnap.id;

    let itemsHTML = "";

    order.items.forEach(item => {
      itemsHTML += `
        <div>
          ${item.name} x ${item.quantity}
        </div>
      `;
    });

    ordersContainer.innerHTML += `
      <div class="product-card" style="margin-bottom:20px;">
        <div class="product-info">
          <h3>Order ID: ${order.orderId}</h3>
          <p><strong>Name:</strong> ${order.name}</p>
          <p><strong>Phone:</strong> ${order.phone}</p>
          <p><strong>Total:</strong> ₹${order.total}</p>

          <div><strong>Items:</strong>${itemsHTML}</div>

          <label>Status:</label>
          <select onchange="updateStatus('${docId}', this.value)">
            <option ${order.status === "Pending" ? "selected" : ""}>Pending</option>
            <option ${order.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
            <option ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
            <option ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>

          <br><br>

          <input type="text" placeholder="Tracking Link"
            id="track-${docId}"
            value="${order.trackingLink || ""}">

          <button onclick="saveTracking('${docId}')">
            Save Tracking
          </button>

        </div>
      </div>
    `;
  });
}

// ================= UPDATE STATUS =================

window.updateStatus = async function (docId, newStatus) {
  const orderRef = doc(db, "orders", docId);
  await updateDoc(orderRef, {
    status: newStatus
  });
  alert("Status Updated");
};

// ================= SAVE TRACKING =================

window.saveTracking = async function (docId) {
  const trackingInput = document.getElementById(`track-${docId}`);
  const trackingLink = trackingInput.value;

  const orderRef = doc(db, "orders", docId);
  await updateDoc(orderRef, {
    trackingLink
  });

  alert("Tracking Saved");
};
