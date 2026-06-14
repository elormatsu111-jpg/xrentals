// Property dataset based on the design from the image
// Includes Most Viewed listings: Villa, Ocean Breeze Villa, Jackson House, Lakeside Cottage, plus one extra
const propertiesData = [
  {
    id: 1,
    title: "Ocean Breeze Villa",
    location: "City Street, 123 Street",
    price: 950000.00,
    formattedPrice: "950.000,00",
    views: 1843,
    icon: "fas fa-water",
    type: "Villa"
  },
  {
    id: 2,
    title: "Jackson House",
    location: "Maple Avenue, Downtown",
    price: 750000.00,
    formattedPrice: "750.000,00",
    views: 1256,
    icon: "fas fa-house-chimney",
    type: "House"
  },
  {
    id: 3,
    title: "Lakeside Cottage",
    location: "Lakeview Drive, 45 North",
    price: 540000.00,
    formattedPrice: "540.000,00",
    views: 982,
    icon: "fas fa-tree",
    type: "Cottage"
  },
  {
    id: 4,
    title: "The Royal Villa",
    location: "Palm Jumeirah, 123 Street",
    price: 1150000.00,
    formattedPrice: "1.150.000,00",
    views: 2430,
    icon: "fas fa-crown",
    type: "Villa"
  },
  {
    id: 5,
    title: "Sunset Mansion",
    location: "Hillcrest Road, Bel Air",
    price: 890000.00,
    formattedPrice: "890.000,00",
    views: 1104,
    icon: "fas fa-mountain-sun",
    type: "Mansion"
  }
];

// Helper to format currency with commas and decimals (matches design: 950.000.00 style but display friendly)
function formatPrice(price) {
  // Format: 950.000,00 like in description
  return price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Render property cards dynamically
function renderProperties() {
  const grid = document.getElementById('propertiesGrid');
  if (!grid) return;

  let cardsHTML = '';
  propertiesData.forEach(prop => {
    // Determine background style based on property type
    let bgIconClass = prop.icon;
    let bgColorStyle = 'linear-gradient(145deg, #e1efea, #d0e2d9)';
    
    cardsHTML += `
      <div class="property-card" data-id="${prop.id}">
        <div class="card-img" style="background: ${bgColorStyle};">
          <i class="${bgIconClass}"></i>
          <div class="views-badge"><i class="fas fa-eye"></i> ${prop.views.toLocaleString()}</div>
        </div>
        <div class="card-content">
          <div class="property-title">${prop.title}</div>
          <div class="property-location"><i class="fas fa-map-marker-alt" style="font-size: 0.7rem;"></i> ${prop.location}</div>
          <div class="property-price">${formatPrice(prop.price)} <span class="price-suffix">USD</span></div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <span style="font-size:0.7rem; background:#ecfdf3; padding:3px 10px; border-radius: 50px;">${prop.type}</span>
            <i class="fas fa-heart" style="color:#aac7bb; transition:0.2s; cursor:pointer;"></i>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = cardsHTML;

  // Add click event listeners for each card (interactivity)
  document.querySelectorAll('.property-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // avoid triggering when clicking on heart (stop propagation to not conflict)
      if(e.target.classList.contains('fa-heart')) {
        e.stopPropagation();
        heartInteraction(e.target);
        return;
      }
      const propertyId = card.getAttribute('data-id');
      alert(`✨ You clicked on property #${propertyId}. More details will be available soon!`);
    });
  });

  // Attach heart like interactions
  const hearts = document.querySelectorAll('.fa-heart');
  hearts.forEach(heart => {
    heart.addEventListener('click', (e) => {
      e.stopPropagation();
      heartInteraction(heart);
    });
  });
}

// Heart like animation and storage (simple local like toggle)
function heartInteraction(heartElement) {
  if (heartElement.style.color === 'rgb(231, 76, 60)' || heartElement.style.color === '#e74c3c') {
    heartElement.style.color = '#aac7bb';
    heartElement.style.transform = 'scale(1)';
    // optional: show unlike toast (just subtle)
  } else {
    heartElement.style.color = '#e74c3c';
    heartElement.style.transform = 'scale(1.15)';
    setTimeout(() => {
      if(heartElement) heartElement.style.transform = 'scale(1)';
    }, 200);
    // Simple feedback (can be extended)
    const card = heartElement.closest('.property-card');
    if(card) {
      const title = card.querySelector('.property-title')?.innerText;
      console.log(`❤️ Liked: ${title}`);
    }
  }
}

// Smooth scroll and explore button interaction
function setupHeroActions() {
  const exploreBtn = document.getElementById('exploreBtn');
  if(exploreBtn) {
    exploreBtn.addEventListener('click', () => {
      const propertiesSection = document.querySelector('.properties-grid');
      if(propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // subtle highlight effect
        propertiesSection.style.transition = 'all 0.3s';
        propertiesSection.style.background = 'rgba(44, 122, 77, 0.05)';
        setTimeout(() => {
          propertiesSection.style.background = '';
        }, 800);
      } else {
        window.scrollTo({ top: document.body.scrollHeight * 0.4, behavior: 'smooth' });
      }
    });
  }

  // Search icon interaction: show a small console message + mini alert demo
  const searchIcon = document.querySelector('.search-icon');
  if(searchIcon) {
    searchIcon.addEventListener('click', () => {
      alert('🔍 Search feature coming soon! Start typing neighborhood or property name.');
    });
  }
  
  // Sign in button redirecting
  const signBtn = document.querySelector('.btn-outline');
  if(signBtn) {
    signBtn.addEventListener('click', () => {
      setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
    });
  } 

  // App badge click
  const appBadge = document.querySelector('.app-badge');
  if(appBadge) {
    appBadge.addEventListener('click', () => {
      alert('📲 Download our mobile app: Get real-time alerts & virtual tours.');
    });
  }
}

// Additional step icons hover effect, and counters for 3 steps (optional)
function enhanceSteps() {
  const steps = document.querySelectorAll('.step-card');
  steps.forEach((step, idx) => {
    step.addEventListener('mouseenter', () => {
      step.style.borderLeft = `4px solid #2c7a4d`;
    });
    step.addEventListener('mouseleave', () => {
      step.style.borderLeft = 'none';
    });
  });
}

// Show property view count hover info on most viewed
function addViewInteraction() {
  // just to reflect textual behavior: we already have views badge
  const viewBadges = document.querySelectorAll('.views-badge');
  viewBadges.forEach(badge => {
    badge.setAttribute('title', 'Total views this month');
  });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  renderProperties();      // inject most viewed listings
  setupHeroActions();      // cta and nav actions
  enhanceSteps();          // step cards micro-interactions
  addViewInteraction();    // tooltip style for views

  // Console greeting as per requirement (JS interaction)
  console.log('🏡 Xrentals — Find your new home, simplified. Dynamic Most Viewed + 3-step process loaded.');
});