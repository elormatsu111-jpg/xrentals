/**
 * js/property.js — Logic for property.html
 * Handles rendering, filtering, heart toggle, and WhatsApp enquiry
 */

// Property dataset — replace with a fetch() to php/properties.php once DB is live
const allProperties = [
  { id:1,  title:'Ocean Breeze Villa',    location:'Koforidua, Eastern Region', price:950000,  views:1843, icon:'fas fa-water',         type:'Villa',     beds:4, baths:3, sqft:3200 },
  { id:2,  title:'Jackson House',          location:'Accra, Greater Accra',      price:750000,  views:1256, icon:'fas fa-house-chimney', type:'House',     beds:3, baths:2, sqft:2400 },
  { id:3,  title:'Lakeside Cottage',       location:'Cape Coast, Central Region',price:540000,  views:982,  icon:'fas fa-tree',          type:'Cottage',   beds:2, baths:1, sqft:1200 },
  { id:4,  title:'The Royal Villa',        location:'Accra, Greater Accra',      price:1150000, views:2430, icon:'fas fa-crown',          type:'Villa',     beds:5, baths:4, sqft:4800 },
  { id:5,  title:'Sunset Mansion',         location:'Kumasi, Ashanti Region',    price:890000,  views:1104, icon:'fas fa-mountain-sun',  type:'Mansion',   beds:6, baths:5, sqft:6100 },
  { id:6,  title:'Garden Apartment',       location:'Tema, Greater Accra',       price:320000,  views:741,  icon:'fas fa-leaf',          type:'Apartment', beds:2, baths:1, sqft:980  },
  { id:7,  title:'Downtown Studio',        location:'Accra, Greater Accra',      price:185000,  views:603,  icon:'fas fa-city',          type:'Studio',    beds:1, baths:1, sqft:520  },
  { id:8,  title:'Hillcrest Family Home',  location:'Kumasi, Ashanti Region',    price:680000,  views:874,  icon:'fas fa-house',         type:'House',     beds:4, baths:3, sqft:2900 },
  { id:9,  title:'Riverside Bungalow',     location:'Koforidua, Eastern Region', price:410000,  views:519,  icon:'fas fa-water',         type:'Cottage',   beds:2, baths:2, sqft:1400 },
  { id:10, title:'Luxury Penthouse',       location:'Accra, Greater Accra',      price:1380000, views:3120, icon:'fas fa-building',      type:'Apartment', beds:3, baths:3, sqft:2200 },
];

// Replace with the real agent WhatsApp number before going live
const LANDLORD_WHATSAPP = '233241234567';

/**
 * Formats a number as price string: 950,000.00
 * @param {number} price
 * @returns {string}
 */
function formatPrice(price) {
  return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Renders property cards into #propertiesGrid and updates results count
 * @param {Array} data - array of property objects
 */
function renderProperties(data) {
  const grid = document.getElementById('propertiesGrid');
  document.getElementById('resultsCount').textContent = data.length;

  if (data.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-house-crack"></i>
        <p>No properties match your filters.</p>
        <p style="font-size:0.8rem; margin-top:4px;">Try broadening your search.</p>
      </div>`;
    return;
  }

  grid.innerHTML = data.map(p => `
    <div class="property-card" data-id="${p.id}">
      <div class="card-img" style="background: linear-gradient(145deg, #e1efea, #d0e2d9);">
        <i class="${p.icon}"></i>
        <div class="views-badge"><i class="fas fa-eye"></i> ${p.views.toLocaleString()}</div>
      </div>
      <div class="card-content">
        <div class="property-title">${p.title}</div>
        <div class="property-location">
          <i class="fas fa-map-marker-alt" style="font-size:0.7rem;"></i> ${p.location}
        </div>
        <div class="property-price">${formatPrice(p.price)} <span class="price-suffix">USD</span></div>
        <div class="card-meta">
          <span><i class="fas fa-bed"></i> ${p.beds} Beds</span>
          <span><i class="fas fa-bath"></i> ${p.baths} Baths</span>
          <span><i class="fas fa-ruler-combined"></i> ${p.sqft.toLocaleString()} sqft</span>
        </div>
        <div class="card-footer-row">
          <span class="type-badge">${p.type}</span>
          <i class="fas fa-heart heart-icon" onclick="toggleHeart(this, event)" aria-label="Save property"></i>
        </div>
        <button class="enquire-btn" onclick="enquire(${p.id}, event)">
          <i class="fab fa-whatsapp"></i> Enquire via WhatsApp
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Reads all filter inputs and re-renders the matching properties
 */
function applyFilters() {
  const search = document.getElementById('searchInput').value.trim().toLowerCase();
  const type   = document.getElementById('typeFilter').value;
  const beds   = document.getElementById('bedsFilter').value;
  const price  = document.getElementById('priceFilter').value;

  const result = allProperties.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search) || p.location.toLowerCase().includes(search);
    const matchType   = !type  || p.type === type;
    const matchBeds   = !beds  || (beds === '4' ? p.beds >= 4 : p.beds === parseInt(beds));
    const matchPrice  = !price || p.price <= parseInt(price);
    return matchSearch && matchType && matchBeds && matchPrice;
  });

  renderProperties(result);
}

/**
 * Resets all filter inputs and shows all properties
 */
function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('typeFilter').value  = '';
  document.getElementById('bedsFilter').value  = '';
  document.getElementById('priceFilter').value = '';
  renderProperties(allProperties);
}

/**
 * Toggles the heart/save icon on a property card
 * @param {HTMLElement} el - the heart icon element
 * @param {Event} e - click event (stopped from bubbling)
 */
function toggleHeart(el, e) {
  e.stopPropagation();
  const liked = el.style.color === 'rgb(231, 76, 60)';
  el.style.color     = liked ? '#aac7bb' : '#e74c3c';
  el.style.transform = liked ? 'scale(1)' : 'scale(1.2)';
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
}

/**
 * Opens WhatsApp with property details pre-filled in the message
 * @param {number} id - property ID
 * @param {Event} e - click event
 */
function enquire(id, e) {
  e.stopPropagation();
  const prop = allProperties.find(p => p.id === id);
  if (!prop) return;

  const msg = encodeURIComponent(
    `Hello! I'm interested in: *${prop.title}*\nLocation: ${prop.location}\nPrice: $${formatPrice(prop.price)}\nCould you share more details?`
  );
  window.open(`https://wa.me/${LANDLORD_WHATSAPP}?text=${msg}`, '_blank');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  // Check for ?location= param passed from location.html
  const params = new URLSearchParams(window.location.search);
  const loc = params.get('location');

  if (loc) {
    document.getElementById('searchInput').value = loc;
    applyFilters();
  } else {
    renderProperties(allProperties);
  }

  // Live search as user types
  document.getElementById('searchInput').addEventListener('keyup', applyFilters);
});