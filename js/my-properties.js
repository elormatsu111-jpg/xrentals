/**
 * js/my-properties.js — dynamics for Assets/Dashboard/myProperties.html
 * Fetches the logged-in owner's real listings from properties_list_mine.php
 * and renders them into #propertyList. No mock/hardcoded data.
 */

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function formatPrice(price) {
  return Number(price).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function propertyCardHtml(p) {
  const thumb = p.thumbnail
    ? `<img class="property-card-thumb" src="../${escapeHtml(p.thumbnail)}" alt="${escapeHtml(p.title)}">`
    : `<div class="property-card-thumb-placeholder"><i class="fas fa-house"></i></div>`;

  return `
    <div class="property-card" data-property-id="${p.id}">
      ${thumb}
      <div class="property-card-body">
        <div class="property-card-title">${escapeHtml(p.title)}</div>
        <div class="property-card-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(p.city)}</div>
        <div class="property-card-price">GHS ${formatPrice(p.price)}${p.listing_type === 'rent' ? ' / mo' : ''}</div>
        <div class="property-card-meta">
          <i class="fas fa-bed"></i> ${p.bedrooms} &nbsp; <i class="fas fa-bath"></i> ${p.bathrooms}
        </div>
        <div class="property-card-footer">
          <span class="property-status">${escapeHtml(p.status)}</span>
          <button class="property-delete-btn" data-delete-id="${p.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>`;
}

async function loadProperties() {
  const container = document.getElementById('propertyList');

  try {
    const res = await fetch('../php/properties_list_mine.php', { credentials: 'same-origin' });
    const data = await res.json();

    if (!data.success) {
      container.innerHTML = `<div class="dash-empty-state">Couldn't load your properties. Please refresh.</div>`;
      return;
    }

    if (data.properties.length === 0) {
      container.innerHTML = `
        <div class="dash-empty-state">
          <i class="fas fa-house-circle-xmark" style="font-size:2rem; margin-bottom:0.5rem; display:block;"></i>
          You haven't listed any properties yet.
        </div>`;
      return;
    }

    container.innerHTML = data.properties.map(propertyCardHtml).join('');
    attachDeleteHandlers();
  } catch (err) {
    container.innerHTML = `<div class="dash-empty-state">Network error loading your properties.</div>`;
  }
}

function attachDeleteHandlers() {
  document.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const propertyId = btn.getAttribute('data-delete-id');
      if (!confirm('Delete this property? This cannot be undone.')) return;

      btn.disabled = true;

      const formData = new FormData();
      formData.append('property_id', propertyId);
      formData.append('csrf_token', window.__csrfToken || '');

      try {
        const res = await fetch('../php/properties_delete.php', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        });
        const data = await res.json();

        if (data.success) {
          btn.closest('.property-card').remove();
        } else {
          alert(data.message || 'Could not delete property.');
          btn.disabled = false;
        }
      } catch (err) {
        alert('Network error. Please try again.');
        btn.disabled = false;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', loadProperties);
