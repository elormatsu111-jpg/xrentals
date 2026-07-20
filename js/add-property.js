/**
 * js/add-property.js — dynamics for Assets/Dashboard/addProperty.html
 * All markup lives in the HTML; this file only handles behavior.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('propertyForm');
  const imagesInput = document.getElementById('images');
  const previewContainer = document.getElementById('imagePreview');
  const messageEl = document.getElementById('formMessage');
  const submitBtn = document.getElementById('submitBtn');

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'form-message' + (type ? ' ' + type : '');
  }

  // ---- Live image preview ----
  imagesInput.addEventListener('change', () => {
    previewContainer.innerHTML = '';
    const files = Array.from(imagesInput.files || []).slice(0, 8);

    if (imagesInput.files.length > 8) {
      showMessage('Only the first 8 images will be uploaded.', 'error');
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = file.name;
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showMessage('', null);

    const description = document.getElementById('description').value.trim();
    if (description.length < 20) {
      showMessage('Description must be at least 20 characters.', 'error');
      return;
    }

    const formData = new FormData(form);
    formData.append('csrf_token', window.__csrfToken || '');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Publishing...';

    try {
      const res = await fetch('../php/properties_create.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      const data = await res.json();

      if (data.success) {
        showMessage('Listing published! Redirecting to your properties...', 'success');
        setTimeout(() => { window.location.href = 'myProperties.html'; }, 1000);
      } else {
        showMessage(data.message || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showMessage('Network error. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Publish Listing';
    }
  });
});
