/**
 * js/contact.js — Form validation and submission for xrentals_contact_us.html
 * Submits to Assets/php/contact.php.
 */

function showFeedback(msg, isError) {
  const el = document.getElementById('formFeedback');
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? '#e74c3c' : '#2c7a4d';
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // Fetch a CSRF token as soon as the page loads.
  let csrfToken = '';
  fetch('../php/csrf.php', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(data => { csrfToken = data.csrfToken; })
    .catch(() => { /* form will still submit; server will just reject without a token */ });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name    = document.getElementById('cfName').value.trim();
    const email   = document.getElementById('cfEmail').value.trim();
    const subject = document.getElementById('cfSubject').value.trim();
    const message = document.getElementById('cfMessage').value.trim();
    const website = document.getElementById('cfWebsite').value; // honeypot, should stay empty
    const btn     = document.getElementById('submitBtn');

    showFeedback('', false);

    // ---- Client-side validation (server re-validates everything) ----
    if (!name || name.length < 2) {
      showFeedback('Please enter your full name.', true); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback('Please enter a valid email address.', true); return;
    }
    if (!subject) {
      showFeedback('Please enter a subject.', true); return;
    }
    if (!message || message.length < 10) {
      showFeedback('Message must be at least 10 characters.', true); return;
    }

    btn.disabled = true;
    const originalLabel = btn.innerHTML;
    btn.innerHTML = 'Sending…';

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('subject', subject);
    formData.append('message', message);
    formData.append('website', website); // honeypot — real users leave this blank
    formData.append('csrf_token', csrfToken);

    try {
      const response = await fetch('../php/contact.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      const data = await response.json();

      if (data.success) {
        showFeedback("✅ Message sent! We'll get back to you within 24 hours.", false);
        form.reset();
      } else {
        showFeedback(data.message || 'Something went wrong. Please try again.', true);
      }
    } catch (err) {
      showFeedback('Network error. Please try again.', true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalLabel;
    }
  });
});
