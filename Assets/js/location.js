/**
 * js/location.js — Logic for location.html
 * Handles rendering location cards, live search, and navigation to property page
 */

// Ghana-focused location dataset
const locationsData = [
  { id: 1, name: 'Koforidua',  region: 'Eastern Region',  listings: 34,  icon: '🌳', tags: ['Villas', 'Apartments', 'Studios'] },
  { id: 2, name: 'Accra',      region: 'Greater Accra',    listings: 182, icon: '🏙️', tags: ['Luxury', 'Apartments', 'Offices'] },
  { id: 3, name: 'Kumasi',     region: 'Ashanti Region',   listings: 97,  icon: '🏘️', tags: ['Houses', 'Shops', 'Bedsitters'] },
  { id: 4, name: 'Tema',       region: 'Greater Accra',    listings: 61,  icon: '🏗️', tags: ['Industrial', 'Apartments'] },
  { id: 5, name: 'Cape Coast', region: 'Central Region',   listings: 28,  icon: '🌊', tags: ['Cottages', 'Villas', 'Houses'] },
  { id: 6, name: 'Takoradi',   region: 'Western Region',   listings: 45,  icon: '⛽', tags: ['Expat Homes', 'Apartments'] },
  { id: 7, name: 'Sunyani',    region: 'Bono Region',      listings: 19,  icon: '🌾', tags: ['Houses', 'Shops'] },
  { id: 8, name: 'Ho',         region: 'Volta Region',     listings: 22,  icon: '🏔️', tags: ['Studios', 'Houses'] },
];

/**
 * Renders location cards into #locationsGrid
 * @param {Array} data - filtered or full locationsData array
 */
function renderLocations(data) {
  const grid = document.getElementById('locationsGrid');

  if (data.length === 0) {
    grid.innerHTML = '<p class="no-results">No locations found. Try a different search.</p>';
    return;
  }

  grid.innerHTML = data.map(loc => `
    <div class="location-card" onclick="browseLocation(${loc.id})" role="button" tabindex="0"
         aria-label="Browse properties in ${loc.name}">
      <div class="location-card-img">
        <span>${loc.icon}</span>
        <span class="listing-count">${loc.listings} listings</span>
      </div>
      <div class="location-card-body">
        <div class="location-name">${loc.name}</div>
        <div class="location-region">
          <i class="fas fa-map-marker-alt" style="font-size:0.7rem;"></i>
          ${loc.region}
        </div>
        <div class="location-tags">
          ${loc.tags.map(t => `<span class="loc-tag">${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');

  // Allow keyboard activation of cards (Enter key)
  grid.querySelectorAll('.location-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') card.click();
    });
  });
}

/**
 * Filters locations based on the search input value
 */
function filterLocations() {
  const query = document.getElementById('locationSearch').value.trim().toLowerCase();
  const filtered = locationsData.filter(l =>
    l.name.toLowerCase().includes(query) || l.region.toLowerCase().includes(query)
  );
  renderLocations(filtered);
}

/**
 * Navigates to property.html pre-filtered by the selected city
 * @param {number} id - location ID from locationsData
 */
function browseLocation(id) {
  const loc = locationsData.find(l => l.id === id);
  if (loc) {
    window.location.href = `property.html?location=${encodeURIComponent(loc.name)}`;
  }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderLocations(locationsData);

  // Live search as the user types
  document.getElementById('locationSearch').addEventListener('keyup', filterLocations);
});