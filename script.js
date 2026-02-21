// ===============================
// Firebase SDK Setup
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { 
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// 🔑 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCsZJviWYXZ-1Buclavnkk6P3gU43fCmtM",
  authDomain: "giftess-1119.firebaseapp.com",
  projectId: "giftess-1119",
  storageBucket: "giftess-1119.firebasestorage.app",
  messagingSenderId: "455652729219",
  appId: "1:455652729219:web:ce4cc662b1955a105796b6",
  measurementId: "G-FSBCLCJBJ6"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// =========================================
//  DATA
// =========================================
var products = [
  {id:1,name:'Crunch Munch',cat:'Birthday',emoji:'🍫🎁',img:null,desc:'A delightful mix of chocolates, cookies & sweets.',includes:['Assorted Chocolates','Chocolate Cookies','Wafers','Mini Cakes','Greeting Card'],orig:1399,sale:1299,bs:true,active:true},
  {id:2,name:'The Birthday Coffer',cat:'Birthday',emoji:'🎂✨',img:null,desc:'The ultimate birthday celebration hamper.',includes:['Personalized Mug','Chocolates','Teddy Bear','Birthday Banner','Scented Candle'],orig:1899,sale:1599,bs:true,active:true},
  {id:3,name:'You Are Special',cat:'Her',emoji:'💐🌸',img:null,desc:'Pampering hamper for the special lady.',includes:['Face Mask','Rose Tea','Scented Candle','Bath Salts','Moisturizer'],orig:2199,sale:1999,bs:true,active:true},
  {id:4,name:'Valentine Week Hamper',cat:'Valentine',emoji:'💝🌹',img:null,desc:'Seven days of love & surprises.',includes:['Rose Petals','Chocolates','Love Letter Kit','Candle','Couple Keychain'],orig:2499,sale:2199,bs:true,active:true},
  {id:5,name:'Chai Prem',cat:'Unique',emoji:'☕🫖',img:null,desc:'For the chai lover in your life.',includes:['Assorted Tea Bags','Ceramic Mug','Honey','Biscuits','Tea Coaster'],orig:1199,sale:999,bs:true,active:true},
  {id:6,name:'BFF Hamper',cat:'Her',emoji:'👯‍♀️💖',img:null,desc:'Celebrate friendship with this adorable hamper.',includes:['Friendship Band','Chocolates','Photo Frame','Candle','Personalized Note'],orig:1799,sale:1499,bs:true,active:true},
  {id:7,name:'Power Guy',cat:'Him',emoji:'💪⚡',img:null,desc:'The perfect hamper for him.',includes:['Coffee','Dark Chocolates','Notebook','Pen Set','Energy Bar'],orig:1499,sale:1299,bs:false,active:true},
  {id:8,name:'Anniversary Dream',cat:'Anniversary',emoji:'💍🥂',img:null,desc:'Celebrate love on your special day.',includes:['Wine Glasses','Rose Petals','Chocolates','Photo Frame','Candles'],orig:2799,sale:2499,bs:false,active:true}
];

var addons = [
  {name:'Ferrero Rocher',icon:'🍬',price:199},{name:'Scented Candle',icon:'🕯️',price:149},
  {name:'Face Mask',icon:'🧖',price:99},{name:'Chocolates Box',icon:'🍫',price:249},
  {name:'Rose Bouquet',icon:'🌹',price:199},{name:'Plush Teddy',icon:'🧸',price:299},
  {name:'Ceramic Mug',icon:'☕',price:149},{name:'Silk Ribbon',icon:'🎀',price:49},
  {name:'Notebook',icon:'📒',price:79},{name:'Bath Salts',icon:'🛁',price:179},
  {name:'Tea Set',icon:'🫖',price:199},{name:'Honey Jar',icon:'🍯',price:129}
];

var cart = [];
var currentProd = null;
var editId = null;
var currentImg = null;
var bStep = 1;
var bBox = {name:'',price:0};
var bPicked = [];

// =========================================
//  VIEW SWITCHING
// =========================================
function showView(id) {
  ['homeView','loginView','adminView'].forEach(function(v) {
    var el = document.getElementById(v);
    if (el) el.classList.remove('on');
  });
  var target = document.getElementById(id);
  if (target) target.classList.add('on');
  var isHome = (id === 'homeView');
  document.getElementById('hdr').style.display = isHome ? '' : 'none';
  document.getElementById('waFab').style.display = isHome ? '' : 'none';
  document.getElementById('mobBar').style.display = isHome ? '' : 'none';
  if (isHome) window.scrollTo(0, 0);
}

function goHome() {
  showView('homeView');
  document.getElementById('shopTitle').innerHTML = 'Best <em>Sellers</em>';
  renderGrid(products, 'shopGrid');
}

function goTo(secId) {
  showView('homeView');
  setTimeout(function() {
    var el = document.getElementById(secId);
    if (el) el.scrollIntoView({behavior:'smooth'});
  }, 60);
}

function gotoAdmin() { showView('loginView'); }
function doLogout() { showView('homeView'); }

function doLogin() {
  var u = document.getElementById('aUser').value.trim();
  var p = document.getElementById('aPass').value;
  if (u === 'admin' && p === 'giftess123') {
    showView('adminView');
    refreshDash();
    showTab('tDash', document.querySelector('.admin-nav a'));
  } else {
    toast('Wrong credentials — try: admin / giftess123');
  }
}

function openMobNav() { document.getElementById('mobNav').classList.add('on'); }
function closeMobNav() { document.getElementById('mobNav').classList.remove('on'); }

// =========================================
//  RENDER PRODUCTS
// =========================================
function makeImgHtml(p) {
  if (p.img) return '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy">';
  return p.emoji;
}

function renderGrid(list, containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;
  var active = list.filter(function(p) { return p.active; });
  if (!active.length) {
    el.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--light);padding:2rem">No products found.</p>';
    return;
  }
  el.innerHTML = active.map(function(p) {
    var save = p.orig - p.sale;
    return '<div class="prod-card">'
      + (p.bs ? '<span class="prod-badge">⭐ Best Seller</span>' : '')
      + '<div class="prod-img" onclick="openPM(' + p.id + ')">' + makeImgHtml(p) + '</div>'
      + '<div class="prod-info">'
      + '<div class="prod-name">' + p.name + '</div>'
      + '<div class="prod-desc">' + p.desc + '</div>'
      + '<div class="prod-price">'
      + '<span class="p-orig">₹' + p.orig.toLocaleString('en-IN') + '</span>'
      + '<span class="p-sale">₹' + p.sale.toLocaleString('en-IN') + '</span>'
      + '<span class="p-save">Save ₹' + save.toLocaleString('en-IN') + '</span>'
      + '</div>'
      + '<div class="prod-btns">'
      + '<button class="btn-cart" onclick="addToCart(' + p.id + ')"><i class="fas fa-cart-plus"></i> Add</button>'
      + '<button class="btn-view" onclick="openPM(' + p.id + ')">View</button>'
      + '<button class="btn-wabtn" onclick="waProduct(' + p.id + ')"><i class="fab fa-whatsapp"></i></button>'
      + '</div></div></div>';
  }).join('');
}

function filterCat(cat) {
  var f = products.filter(function(p) { return p.cat === cat; });
  document.getElementById('shopTitle').innerHTML = cat + ' <em>Gifts</em>';
  renderGrid(f.length ? f : products, 'shopGrid');
  goTo('shopSec');
}

function filterPrice(mn, mx, btn) {
  document.querySelectorAll('.pbtn').forEach(function(b) { b.classList.remove('act'); });
  btn.classList.add('act');
  var f = products.filter(function(p) { return p.sale >= mn && p.sale <= mx; });
  renderGrid(f, 'filtGrid');
  document.getElementById('filtGrid').scrollIntoView({behavior:'smooth'});
}

// =========================================
//  CART
// =========================================
function addToCart(id) {
  var p = products.find(function(x) { return x.id === id; });
  if (!p) return;
  var ex = cart.find(function(x) { return x.id === id; });
  if (ex) { ex.qty++; } else { cart.push({id:p.id,name:p.name,emoji:p.emoji,img:p.img,sale:p.sale,qty:1}); }
  updateBadge();
  toast(p.name + ' added to cart! 🛍️');
}

function removeFromCart(id) {
  cart = cart.filter(function(x) { return x.id !== id; });
  updateBadge();
  renderCartItems();
}

function changeQty(id, d) {
  var item = cart.find(function(x) { return x.id === id; });
  if (!item) return;
  item.qty += d;
  if (item.qty <= 0) { removeFromCart(id); return; }
  updateBadge();
  renderCartItems();
}

function updateBadge() {
  var n = cart.reduce(function(s, x) { return s + x.qty; }, 0);
  document.getElementById('cartBadge').textContent = n;
  document.getElementById('mobCount').textContent = n;
}

function openCart() {
  document.getElementById('cOverlay').classList.add('on');
  document.getElementById('cSidebar').classList.add('on');
  renderCartItems();
}

function closeCart() {
  document.getElementById('cOverlay').classList.remove('on');
  document.getElementById('cSidebar').classList.remove('on');
}

function renderCartItems() {
  var el = document.getElementById('cItems');
  var foot = document.getElementById('cFoot');
  if (!cart.length) {
    el.innerHTML = '<div class="cart-empty"><div style="font-size:3rem;margin-bottom:.8rem">🛍️</div><p>Your cart is empty</p></div>';
    foot.style.display = 'none';
    return;
  }
  foot.style.display = 'block';
  var total = cart.reduce(function(s, x) { return s + x.sale * x.qty; }, 0);
  document.getElementById('cTotal').textContent = '₹' + total.toLocaleString('en-IN');
  el.innerHTML = cart.map(function(item) {
    return '<div class="cart-item">'
      + '<div class="ci-img">' + (item.img ? '<img src="' + item.img + '" alt="' + item.name + '">' : item.emoji) + '</div>'
      + '<div class="ci-info">'
      + '<div class="ci-name">' + item.name + '</div>'
      + '<div class="ci-price">₹' + item.sale.toLocaleString('en-IN') + '</div>'
      + '<div class="ci-ctrl">'
      + '<button class="qty-btn" onclick="changeQty(' + item.id + ',-1)">−</button>'
      + '<span class="qty-n">' + item.qty + '</span>'
      + '<button class="qty-btn" onclick="changeQty(' + item.id + ',1)">+</button>'
      + '<button class="ci-del" onclick="removeFromCart(' + item.id + ')"><i class="fas fa-trash"></i></button>'
      + '</div></div></div>';
  }).join('');
}

function checkoutWA() {
  if (!cart.length) { toast('Your cart is empty!'); return; }
  var lines = cart.map(function(x) { return '• ' + x.name + ' x' + x.qty + ' = ₹' + (x.sale * x.qty).toLocaleString('en-IN'); }).join('\n');
  var total = cart.reduce(function(s, x) { return s + x.sale * x.qty; }, 0);
  var msg = 'Hello Giftess! 🎁 I want to order:\n\n' + lines + '\n\n*Total: ₹' + total.toLocaleString('en-IN') + '*\n\nMy Name:\nAddress:\nPayment Mode:';
  window.open('https://wa.me/916002698296?text=' + encodeURIComponent(msg), '_blank');
}

function waProduct(id) {
  var p = products.find(function(x) { return x.id === id; });
  if (!p) return;
  var msg = 'Hello Giftess! 🎁 Interested in:\n\n*' + p.name + '* – ₹' + p.sale.toLocaleString('en-IN') + '\n\nMy Name:\nAddress:\nPayment Mode:';
  window.open('https://wa.me/916002698296?text=' + encodeURIComponent(msg), '_blank');
}

// =========================================
//  PRODUCT MODAL
// =========================================
function openPM(id) {
  var p = products.find(function(x) { return x.id === id; });
  if (!p) return;
  currentProd = p;
  document.getElementById('pmName').textContent = p.name;
  var g = document.getElementById('pmGallery');
  if (p.img) {
    g.innerHTML = '<img src="' + p.img + '" alt="' + p.name + '">';
    g.style.cssText = 'padding:0;font-size:0';
  } else {
    g.innerHTML = p.emoji;
    g.style.cssText = 'padding:2rem;font-size:6rem';
  }
  document.getElementById('pmOrig').textContent = '₹' + p.orig.toLocaleString('en-IN');
  document.getElementById('pmSale').textContent = '₹' + p.sale.toLocaleString('en-IN');
  document.getElementById('pmDesc').textContent = p.desc;
  document.getElementById('pmIncludes').innerHTML = p.includes.map(function(i) { return '<li>' + i + '</li>'; }).join('');
  document.getElementById('prodModal').classList.add('on');
}

function closePM() { document.getElementById('prodModal').classList.remove('on'); }
function addFromPM() { if (currentProd) { addToCart(currentProd.id); closePM(); } }
function waPM() { if (currentProd) { waProduct(currentProd.id); closePM(); } }

// =========================================
//  BUILDER
// =========================================
function openBuilder() {
  bStep = 1; bBox = {name:'',price:0}; bPicked = [];
  document.querySelectorAll('.box-opt').forEach(function(o) { o.classList.remove('sel'); });
  document.getElementById('greetMsg').value = '';
  buildAddonGrid();
  updateBuilderUI();
  document.getElementById('builderModal').classList.add('on');
}

function closeBuilder() { document.getElementById('builderModal').classList.remove('on'); }

function buildAddonGrid() {
  document.getElementById('addonGrid').innerHTML = addons.map(function(a, i) {
    return '<div class="addon-item" id="ad' + i + '" onclick="toggleAddon(' + i + ')">'
      + '<div class="ai-icon">' + a.icon + '</div>'
      + '<div>' + a.name + '</div>'
      + '<div style="color:var(--rose);font-weight:700;font-size:.78rem">+₹' + a.price + '</div></div>';
  }).join('');
}

function toggleAddon(i) {
  var el = document.getElementById('ad' + i);
  var idx = bPicked.indexOf(i);
  if (idx > -1) { bPicked.splice(idx, 1); el.classList.remove('sel'); }
  else { bPicked.push(i); el.classList.add('sel'); }
  calcBTotal();
}

function pickBox(el, name, price) {
  document.querySelectorAll('.box-opt').forEach(function(o) { o.classList.remove('sel'); });
  el.classList.add('sel');
  bBox = {name:name, price:price};
  calcBTotal();
}

function calcBTotal() {
  var t = bBox.price + bPicked.reduce(function(s, i) { return s + addons[i].price; }, 0);
  document.getElementById('bTotalEl').textContent = 'Total: ₹' + t.toLocaleString('en-IN');
  return t;
}

function updateBuilderUI() {
  for (var i = 1; i <= 4; i++) {
    var el = document.getElementById('bS' + i);
    if (el) el.classList.toggle('on', i === bStep);
  }
  document.getElementById('bBack').style.display = bStep > 1 ? 'inline-flex' : 'none';
  document.getElementById('bNext').textContent = bStep < 4 ? 'Next →' : '🛍️ Add to Cart';
  document.getElementById('bDots').innerHTML = [1,2,3,4].map(function(n) {
    return '<div class="prog-dot' + (n <= bStep ? ' on' : '') + '"></div>';
  }).join('');
  calcBTotal();
  if (bStep === 4) {
    var prods = bPicked.map(function(i) { return addons[i].name; }).join(', ') || 'None selected';
    var msg = document.getElementById('greetMsg').value || 'No message';
    document.getElementById('bSum').innerHTML =
      '<strong>📦 Box:</strong> ' + (bBox.name || 'Not selected') + '<br>'
      + '<strong>🎁 Products:</strong> ' + prods + '<br>'
      + '<strong>💌 Message:</strong> ' + msg + '<br>'
      + '<strong>💰 Total: ₹' + calcBTotal().toLocaleString('en-IN') + '</strong>';
  }
}

function bNextStep() {
  if (bStep === 4) {
    var total = calcBTotal();
    var prods = bPicked.map(function(i) { return addons[i].name; }).join(', ');
    var msg = document.getElementById('greetMsg').value || '';
    var item = {id:9999, name:'Custom Hamper (' + bBox.name + ')', emoji:'🧺✨', img:null, sale:total, qty:1};
    var ex = cart.find(function(x) { return x.id === 9999; });
    if (ex) ex.qty++; else cart.push(item);
    updateBadge();
    closeBuilder();
    toast('Custom hamper added to cart! 🎁');
    var wa = 'Hello Giftess! 🎁 Custom Hamper:\n📦 Box: ' + bBox.name + '\n🎁 Products: ' + prods + '\n💌 Message: ' + msg + '\n💰 Total: ₹' + total.toLocaleString('en-IN') + '\n\nMy Name:\nAddress:';
    setTimeout(function() {
      if (confirm('Open WhatsApp to confirm your custom hamper?')) {
        window.open('https://wa.me/916002698296?text=' + encodeURIComponent(wa), '_blank');
      }
    }, 300);
    return;
  }
  bStep = Math.min(4, bStep + 1);
  updateBuilderUI();
}

function bPrev() { bStep = Math.max(1, bStep - 1); updateBuilderUI(); }

// =========================================
//  TESTIMONIALS
// =========================================
var testimonials = [
  {name:'Priya Sharma',loc:'Mumbai',txt:'Absolutely loved the hamper! The packaging was so beautiful and every product was thoughtfully chosen.',init:'P'},
  {name:'Arjun Mehta',loc:'Delhi',txt:"Ordered for my girlfriend's birthday. She was THRILLED! Custom option is fantastic. Arrived on time!",init:'A'},
  {name:'Sneha Kulkarni',loc:'Pune',txt:"The BFF Hamper was perfect for my best friend's birthday. Premium quality, 10/10!",init:'S'},
  {name:'Rohan Nair',loc:'Bangalore',txt:'Giftess never disappoints. Ordered 3 times. Always fresh, always beautiful.',init:'R'},
  {name:'Anjali Gupta',loc:'Hyderabad',txt:'The Valentine Hamper was magical! My husband was so surprised. Thank you Giftess ❤️',init:'A'},
  {name:'Vikram Singh',loc:'Chennai',txt:'Quick delivery, premium packaging. The Chai Prem hamper is a must-buy!',init:'V'}
];

function renderTestimonials() {
  document.getElementById('testTrack').innerHTML = testimonials.map(function(t) {
    return '<div class="test-card">'
      + '<div class="t-stars">★★★★★</div>'
      + '<p class="t-text">"' + t.txt + '"</p>'
      + '<div class="t-auth"><div class="t-av">' + t.init + '</div>'
      + '<div><div class="t-name">' + t.name + '</div><div class="t-loc">' + t.loc + '</div></div>'
      + '</div></div>';
  }).join('');
}

// =========================================
//  ADMIN
// =========================================
function showTab(tabId, linkEl) {
  ['tDash','tProds','tAdd','tCats','tOrders','tSettings'].forEach(function(t) {
    var el = document.getElementById(t);
    if (el) el.style.display = 'none';
  });
  var tab = document.getElementById(tabId);
  if (tab) tab.style.display = 'block';
  document.querySelectorAll('.admin-nav a').forEach(function(a) { a.classList.remove('on'); });
  if (linkEl) linkEl.classList.add('on');
  if (tabId === 'tProds') renderProdTable();
  if (tabId === 'tCats') renderCatTable();
  if (tabId === 'tDash') refreshDash();
}

function refreshDash() {
  document.getElementById('dProds').textContent = products.length;
  document.getElementById('dBS').textContent = products.filter(function(p) { return p.bs; }).length;
}

function renderProdTable() {
  document.getElementById('prodTbody').innerHTML = products.map(function(p) {
    var imgCell = p.img
      ? '<img class="tbl-img" src="' + p.img + '" alt="' + p.name + '">'
      : '<span style="font-size:1.5rem">' + p.emoji + '</span>';
    return '<tr>'
      + '<td>' + imgCell + '</td>'
      + '<td><strong>' + p.name + '</strong></td>'
      + '<td>' + p.cat + '</td>'
      + '<td>₹' + p.sale.toLocaleString('en-IN') + ' <span style="text-decoration:line-through;color:var(--light);font-size:.78rem">₹' + p.orig.toLocaleString('en-IN') + '</span></td>'
      + '<td>' + (p.active ? '<span class="tag tag-g">Active</span>' : '<span class="tag tag-r">Inactive</span>') + '</td>'
      + '<td>' + (p.bs ? '<span class="tag tag-y">⭐ Yes</span>' : '—') + '</td>'
      + '<td style="display:flex;gap:6px;flex-wrap:wrap">'
      + '<button class="tbtn tbtn-e" onclick="editProd(' + p.id + ')">Edit</button>'
      + '<button class="tbtn tbtn-d" onclick="deleteProd(' + p.id + ')">Delete</button>'
      + '<button class="tbtn tbtn-t" onclick="toggleActive(' + p.id + ')">' + (p.active ? 'Disable' : 'Enable') + '</button>'
      + '</td></tr>';
  }).join('');
}

function renderCatTable() {
  var cats = ['Birthday','Anniversary','Her','Him','Valentine','Unique'];
  var icons = {Birthday:'🎂',Anniversary:'💍',Her:'💐',Him:'🎯',Valentine:'💝',Unique:'✨'};
  document.getElementById('catTbody').innerHTML = cats.map(function(c) {
    return '<tr><td style="font-size:1.5rem">' + icons[c] + '</td><td><strong>' + c + '</strong></td>'
      + '<td>' + products.filter(function(p) { return p.cat === c; }).length + '</td>'
      + '<td><span class="tag tag-g">Active</span></td></tr>';
  }).join('');
}

// =========================================
//  IMAGE UPLOAD
// =========================================
function triggerUpload(e) {
  var box = document.getElementById('imgBox');
  if (box.classList.contains('has-img')) return;
  e.stopPropagation();
  document.getElementById('imgFile').click();
}

function onImgChange(e) {
  var file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('Image too large — max 5MB'); return; }
  var reader = new FileReader();
  reader.onload = function(ev) {
    currentImg = ev.target.result;
    var box = document.getElementById('imgBox');
    document.getElementById('imgPreview').src = currentImg;
    box.classList.add('has-img');
  };
  reader.readAsDataURL(file);
}

function removeImg(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  currentImg = null;
  var box = document.getElementById('imgBox');
  document.getElementById('imgPreview').src = '';
  document.getElementById('imgFile').value = '';
  box.classList.remove('has-img');
}

// =========================================
//  ADD / EDIT / SAVE / DELETE
// =========================================
function openAddProd() {
  editId = null;
  currentImg = null;
  document.getElementById('addTitle').textContent = 'Add New Product';
  resetForm();
  showTab('tAdd', null);
}

function resetForm() {
  document.getElementById('fName').value = '';
  document.getElementById('fCat').value = 'Birthday';
  document.getElementById('fOrig').value = '';
  document.getElementById('fSale').value = '';
  document.getElementById('fDesc').value = '';
  document.getElementById('fEmoji').value = '🎁';
  document.getElementById('fIncludes').value = '';
  document.getElementById('fBS').checked = false;
  document.getElementById('fActive').checked = true;
  removeImg(null);
}

function saveProd() {
  var name = document.getElementById('fName').value.trim();
  if (!name) { toast('Product name is required'); return; }
  var data = {
    name: name,
    cat: document.getElementById('fCat').value,
    orig: parseInt(document.getElementById('fOrig').value) || 0,
    sale: parseInt(document.getElementById('fSale').value) || 0,
    emoji: document.getElementById('fEmoji').value || '🎁',
    img: currentImg || null,
    desc: document.getElementById('fDesc').value,
    includes: document.getElementById('fIncludes').value.split(',').map(function(s) { return s.trim(); }).filter(Boolean),
    bs: document.getElementById('fBS').checked,
    active: document.getElementById('fActive').checked
  };
  if (editId !== null) {
    var idx = -1;
    for (var i = 0; i < products.length; i++) { if (products[i].id === editId) { idx = i; break; } }
    if (idx > -1) {
      products[idx] = Object.assign({}, products[idx], data);
    }
    toast('Product updated! ✅');
  } else {
    data.id = Date.now();
    products.push(data);
    toast('Product added! ✅');
  }
  editId = null;
  currentImg = null;
  renderGrid(products, 'shopGrid');
  renderGrid(products, 'filtGrid');
  showTab('tProds', null);
}

function editProd(id) {
  var p = null;
  for (var i = 0; i < products.length; i++) { if (products[i].id === id) { p = products[i]; break; } }
  if (!p) return;
  editId = id;
  document.getElementById('addTitle').textContent = 'Edit Product';
  showTab('tAdd', null);
  document.getElementById('fName').value = p.name;
  document.getElementById('fCat').value = p.cat;
  document.getElementById('fOrig').value = p.orig;
  document.getElementById('fSale').value = p.sale;
  document.getElementById('fDesc').value = p.desc;
  document.getElementById('fEmoji').value = p.emoji || '🎁';
  document.getElementById('fIncludes').value = p.includes.join(', ');
  document.getElementById('fBS').checked = p.bs;
  document.getElementById('fActive').checked = p.active;
  if (p.img) {
    currentImg = p.img;
    document.getElementById('imgPreview').src = p.img;
    document.getElementById('imgBox').classList.add('has-img');
  } else {
    currentImg = null;
    removeImg(null);
  }
}

function deleteProd(id) {
  if (!confirm('Delete this product?')) return;
  products = products.filter(function(x) { return x.id !== id; });
  renderProdTable();
  renderGrid(products, 'shopGrid');
  renderGrid(products, 'filtGrid');
  toast('Product deleted');
}

function toggleActive(id) {
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === id) { products[i].active = !products[i].active; break; }
  }
  renderProdTable();
  renderGrid(products, 'shopGrid');
  renderGrid(products, 'filtGrid');
}

// =========================================
//  TOAST
// =========================================
function toast(msg) {
  var el = document.getElementById('toastEl');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(window._tt);
  window._tt = setTimeout(function() { el.classList.remove('on'); }, 2800);
}

// =========================================
//  SCROLL + MODAL CLOSE
// =========================================
window.addEventListener('scroll', function() {
  document.getElementById('hdr').classList.toggle('sc', window.scrollY > 20);
});

document.getElementById('prodModal').addEventListener('click', function(e) {
  if (e.target === this) closePM();
});
document.getElementById('builderModal').addEventListener('click', function(e) {
  if (e.target === this) closeBuilder();
});

// =========================================
//  INIT
// =========================================
renderGrid(products, 'shopGrid');
renderGrid(products, 'filtGrid');
renderTestimonials();
