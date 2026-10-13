// Illustrative prices convert the original USD samples at approximately KSh 130 per USD.
const products = [
  { id: "sunday-midi", name: "Sunday Midi Dress", category: "Dresses", price: 8840, tag: "Bestseller", color: "Soft sage", image: "photo-1539008835657-9e8e9680c956" },
  { id: "city-heel", name: "The City Heel", category: "Shoes", price: 9620, tag: "Just in", color: "Classic black", image: "photo-1543163521-1bf539c55dd2" },
  { id: "garden-wrap", name: "Garden Wrap Dress", category: "Dresses", price: 10660, tag: "A favorite", color: "A little floral", image: "photo-1496747611176-843222e1e57c" },
  { id: "everyday-flat", name: "Everyday Ballet Flat", category: "Shoes", price: 7280, tag: "Easy does it", color: "Warm neutral", image: "photo-1535043934128-cf0b28d52f95" },
  { id: "evening-slip", name: "After Hours Slip Dress", category: "Dresses", price: 11960, tag: "New arrival", color: "Midnight navy", image: "photo-1595777457583-95e059d581b8" },
  { id: "weekend-sandal", name: "Weekend Sandal", category: "Shoes", price: 8060, tag: "Made for sunshine", color: "Soft tan", image: "photo-1562273138-f46be4ebdf33" },
  { id: "little-black-dress", name: "The Little Black Dress", category: "Dresses", price: 10140, tag: "A forever piece", color: "Always black", image: "photo-1509631179647-0177331693ae" },
  { id: "day-to-night", name: "Day-to-Night Pump", category: "Shoes", price: 10270, tag: "A little lift", color: "Deep navy", image: "photo-1515347619252-60a4bf4fff4f" }
].map(product => ({
  ...product,
  imageUrl: `https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=720&q=80`
}));

const shopEmail = "edwinmwenda252@gmail.com";
const web3FormsConfig = window.WEB3FORMS_CONFIG || {};
const kesFormatter = new Intl.NumberFormat("en-KE", {
  maximumFractionDigits: 0
});
const formatPrice = amount => `KSh ${kesFormatter.format(amount)}`;
const productGrid = document.querySelector(".product-grid");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const cartDrawer = document.querySelector(".cart-drawer");
const drawerBackdrop = document.querySelector(".drawer-backdrop");
const cartItemsElement = document.querySelector(".cart-items");
const cartCount = document.querySelector(".cart-count");
const drawerCount = document.querySelector(".drawer-count");
const cartTotal = document.querySelector(".cart-total strong");
const emptyMessage = document.querySelector(".cart-empty");
const orderForm = document.querySelector(".order-form");
const orderButton = document.querySelector(".email-order");
const orderStatus = document.querySelector(".order-status");
const orderFallback = document.querySelector(".order-fallback");
const manualEmailLink = document.querySelector(".manual-email");
const customerPhoneInput = document.querySelector("#customer-phone");
const confirmationPage = document.querySelector("#order-confirmation");
const confirmationReference = document.querySelector("#confirmation-reference");
const confirmationCustomer = document.querySelector("#confirmation-customer");
const confirmationItems = document.querySelector("#confirmation-items");
const confirmationTotal = document.querySelector("#confirmation-total");
const emailOrderLink = document.querySelector("#email-order");
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");
const toast = document.querySelector(".toast");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let activeFilter = "All";
let cart = readCart();
let toastTimeout;

function readCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("cg-collections-cart") || "[]");
    if (!Array.isArray(saved)) {
      console.error("Saved shopping bag data is not a list; starting with an empty bag.");
      return [];
    }
    return saved.filter(id => products.some(product => product.id === id));
  } catch (error) {
    console.error("Could not read the saved shopping bag; starting with an empty bag.", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem("cg-collections-cart", JSON.stringify(cart));
  } catch {
    showToast("Your bag will reset when you leave this page.");
  }
}

function renderProducts() {
  const visibleProducts = activeFilter === "All"
    ? products
    : products.filter(product => product.category === activeFilter);

  productGrid.innerHTML = visibleProducts.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.imageUrl}" alt="${product.name}, ${product.color}" loading="lazy">
        <span class="product-tag">${product.tag}</span>
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to bag">Add to bag +</button>
      </div>
      <div class="product-info">
        <div><h3>${product.name}</h3><p>${product.color}</p></div>
        <span class="product-price">${formatPrice(product.price)}</span>
      </div>
    </article>
  `).join("");
}

function setFilter(category) {
  if (!["All", "Dresses", "Shoes"].includes(category)) return;
  activeFilter = category;
  filterButtons.forEach(button => {
    const isActive = button.dataset.filter === category;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderProducts();
}

function renderCart() {
  const items = cart.map(id => products.find(product => product.id === id)).filter(Boolean);
  const count = items.length;
  cartCount.textContent = String(count);
  drawerCount.textContent = `(${count})`;
  cartTotal.textContent = formatPrice(items.reduce((sum, product) => sum + product.price, 0));
  orderButton.disabled = count === 0;
  orderStatus.textContent = count === 0 ? "Add something to your bag to place an order." : "";
  orderFallback.hidden = true;
  emptyMessage.hidden = count > 0;
  cartItemsElement.innerHTML = items.map(product => `
    <article class="cart-item">
      <img src="${product.imageUrl}" alt="" loading="lazy">
      <div><h3>${product.name}</h3><p>${formatPrice(product.price)}</p></div>
      <button class="remove-item" type="button" data-remove="${product.id}" aria-label="Remove ${product.name} from bag">Remove</button>
    </article>
  `).join("");
}

function buildOrderEmailText(order, reference = "Pending") {
  return [
    "Hello Chris George Collections! I'd like to place an order.",
    "",
    `Order reference: ${reference}`,
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    "",
    "Order:",
    ...order.items.map((product, index) =>
      `${index + 1}. ${product.name} (${product.color}) — ${formatPrice(product.price)}\nPhoto: ${product.imageUrl}`
    ),
    "",
    `Subtotal: ${formatPrice(order.items.reduce((sum, product) => sum + product.price, 0))}`,
    "Please contact me to confirm availability and delivery."
  ].join("\n");
}

function showOrderConfirmation(order, reference) {
  confirmationReference.textContent = reference;
  confirmationCustomer.textContent = `${order.name} · ${order.phone} · ${order.email}`;
  confirmationItems.innerHTML = order.items.map(product => `
    <div class="confirmation-item">
      <img src="${product.imageUrl}" alt="${product.name}, ${product.color}">
      <div><strong>${product.name}</strong><span>${product.color}</span></div>
      <strong>${formatPrice(product.price)}</strong>
    </div>
  `).join("");
  confirmationTotal.textContent = formatPrice(
    order.items.reduce((sum, product) => sum + product.price, 0)
  );
  const emailText = buildOrderEmailText(order, reference);
  emailOrderLink.href = `mailto:${shopEmail}?subject=${encodeURIComponent(`Order ${reference} - Chris George Collections`)}&body=${encodeURIComponent(emailText)}`;
  closeCart();
  document.querySelector("#main").hidden = true;
  document.querySelector(".site-footer").hidden = true;
  confirmationPage.hidden = false;
  document.title = `Order ${reference} — Chris George Collections`;
  window.scrollTo(0, 0);
  confirmationPage.querySelector("h1").focus();
}

orderForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (cart.length === 0 || !orderForm.reportValidity()) return;

  const formData = new FormData(orderForm);
  const items = cart.map(id => products.find(product => product.id === id)).filter(Boolean);
  const enteredPhone = String(formData.get("phone")).replace(/[\s()-]/g, "");
  const customerPhone = enteredPhone.startsWith("0")
    ? `+254${enteredPhone.slice(1)}`
    : `+${enteredPhone.replace(/^\+/, "")}`;
  const order = {
    name: String(formData.get("name")).trim(),
    phone: customerPhone,
    email: String(formData.get("email")).trim(),
    items
  };
  orderStatus.textContent = "Sending your order to the shop…";
  orderFallback.hidden = true;
  orderButton.disabled = true;
  const reference = `CG-${Date.now().toString(36).toUpperCase()}`;
  try {
    if (!web3FormsConfig.accessKey) {
      throw new Error("Automatic email is not set up yet. Use the email fallback below or add your Web3Forms access key to web3forms-config.js.");
    }
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        access_key: web3FormsConfig.accessKey,
        subject: `New Chris George Collections order ${reference}`,
        from_name: "Chris George Collections",
        name: order.name,
        phone: order.phone,
        email: order.email,
        replyto: order.email,
        message: buildOrderEmailText(order, reference)
      })
    });
    const result = await response.json();
    if (!response.ok) {
      console.error(`Web3Forms rejected the order with HTTP ${response.status}.`, result);
      throw new Error(result.message || "The email service could not accept this order. Please try again or use the email fallback.");
    }
    if (result.success !== true) {
      console.error("Web3Forms did not report a successful order submission.", result);
      throw new Error(result.message || "The email service could not confirm this order. Please try again or use the email fallback.");
    }
    orderStatus.textContent = "";
    showOrderConfirmation(order, reference);
  } catch (error) {
    orderStatus.textContent = error instanceof TypeError
      ? "Could not reach Web3Forms. Your order was not sent."
      : error.message;
    const manualMessage = buildOrderEmailText(order);
    manualEmailLink.href =
      `mailto:${shopEmail}?subject=${encodeURIComponent("Order - Chris George Collections")}&body=${encodeURIComponent(manualMessage)}`;
    orderFallback.hidden = false;
  } finally {
    orderButton.disabled = cart.length === 0;
  }
});

document.querySelector(".return-home").addEventListener("click", () => {
  confirmationPage.hidden = true;
  document.querySelector("#main").hidden = false;
  document.querySelector(".site-footer").hidden = false;
  document.title = "Chris George Collections — Find your next favorite";
  cart = [];
  saveCart();
  renderCart();
  orderForm.reset();
  customerPhoneInput.setCustomValidity("");
  orderFallback.hidden = true;
  orderStatus.textContent = "";
  window.scrollTo(0, 0);
});

customerPhoneInput.addEventListener("input", () => {
  const phone = customerPhoneInput.value.replace(/[\s()-]/g, "");
  const isValidKenyanMobile = /^(?:\+?254|0)[17]\d{8}$/.test(phone);
  customerPhoneInput.setCustomValidity(
    !phone || isValidKenyanMobile
      ? ""
      : "Enter a valid Kenyan mobile number, for example 0712 345 678 or +254712345678."
  );
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 2300);
}

function openCart() {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartDrawer.removeAttribute("inert");
  drawerBackdrop.hidden = false;
  document.body.classList.add("drawer-open");
  cartDrawer.querySelector(".drawer-close").focus();
}

function closeCart() {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.setAttribute("inert", "");
  drawerBackdrop.hidden = true;
  document.body.classList.remove("drawer-open");
  document.querySelector(".cart-trigger").focus();
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const removeButton = event.target.closest("[data-remove]");
  const filterLink = event.target.closest("[data-filter-link]");

  if (addButton) {
    const product = products.find(item => item.id === addButton.dataset.add);
    if (!product) return;
    cart.push(product.id);
    saveCart();
    renderCart();
    showToast(`${product.name} added to your bag`);
  }

  if (removeButton) {
    const index = cart.indexOf(removeButton.dataset.remove);
    if (index !== -1) cart.splice(index, 1);
    saveCart();
    renderCart();
  }

  if (filterLink) {
    setFilter(filterLink.dataset.filterLink);
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

document.querySelector(".cart-trigger").addEventListener("click", openCart);
document.querySelector(".drawer-close").addEventListener("click", closeCart);
document.querySelector(".continue-shopping").addEventListener("click", closeCart);
drawerBackdrop.addEventListener("click", closeCart);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer.classList.contains("is-open")) closeCart();
  if (event.key === "Escape" && primaryNav.classList.contains("is-open")) {
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    menuToggle.focus();
  }
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
  primaryNav.classList.toggle("is-open", !isOpen);
});

document.querySelector(".newsletter-form").addEventListener("submit", event => {
  event.preventDefault();
  const emailInput = document.querySelector("#newsletter-email");
  if (!emailInput.reportValidity()) return;
  document.querySelector(".newsletter-message").textContent =
    "Thanks for your interest! Newsletter sign-ups are coming soon.";
  emailInput.value = "";
});

const slides = [...document.querySelectorAll(".hero-slide")];
const slideDots = [...document.querySelectorAll(".slide-dot")];
let currentSlide = 0;
let slideTimer;

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === currentSlide;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
    slide.inert = !isActive;
  });
  slideDots.forEach((dot, dotIndex) => {
    const isActive = dotIndex === currentSlide;
    dot.classList.toggle("is-active", isActive);
    if (isActive) dot.setAttribute("aria-current", "true");
    else dot.removeAttribute("aria-current");
  });
}

function resetSlideshow() {
  window.clearInterval(slideTimer);
  if (!reducedMotion.matches) {
    slideTimer = window.setInterval(() => showSlide(currentSlide + 1), 5500);
  }
}

document.querySelector(".slide-prev").addEventListener("click", () => {
  showSlide(currentSlide - 1);
  resetSlideshow();
});
document.querySelector(".slide-next").addEventListener("click", () => {
  showSlide(currentSlide + 1);
  resetSlideshow();
});
slideDots.forEach((dot, index) => dot.addEventListener("click", () => {
  showSlide(index);
  resetSlideshow();
}));
reducedMotion.addEventListener?.("change", resetSlideshow);

showSlide(currentSlide);
renderProducts();
renderCart();
resetSlideshow();
