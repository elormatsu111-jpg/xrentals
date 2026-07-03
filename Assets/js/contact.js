/**
 * js/contact.js — Form validation and submission for contact.html
 * To connect to a real backend: replace the setTimeout simulation
 * with a fetch() POST to php/contact.php
 */

/**
 * Shows a success or error message below the form
 * @param {string} msg     - message text
 * @param {boolean} isError - red for error, green for success
 */
function showFeedback(msg, isError) {
  const el = document.getElementById('formFeedback');
  el.textContent = msg;
  el.style.color = isError ? '#e74c3c' : '#2c7a4d';
}

// ---- Form submit handler ----
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Collect field values
    const name    = document.getElementById('cfName').value.trim();
    const email   = document.getElementById('cfEmail').value.trim();
    const subject = document.getElementById('cfSubject').value;
    const message = document.getElementById('cfMessage').value.trim();
    const btn     = document.getElementById('submitBtn');

    // Clear previous feedback
    showFeedback('', false);

    // ---- Client-side validation ----
    if (!name || name.length < 2) {
      showFeedback('Please enter your full name.', true); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFeedback('Please enter a valid email address.', true); return;
    }
    if (!subject) {
      showFeedback('Please select a subject.', true); return;
    }
    if (!message || message.length < 10) {
      showFeedback('Message must be at least 10 characters.', true); return;
    }

    // Disable button while submitting
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';

    // ---- TODO: replace simulation with real fetch to php/contact.php ----
    // const formData = new FormData();
    // formData.append('name', name);
    // formData.append('email', email);
    // formData.append('subject', subject);
    // formData.append('message', message);
    // const response = await fetch('../php/contact.php', { method: 'POST', body: formData });
    // const data = await response.json();

    // Simulated response for now
    await new Promise(r => setTimeout(r, 1400));

    showFeedback("✅ Message sent! We'll get back to you within 24 hours.", false);
    form.reset();
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
  });
});