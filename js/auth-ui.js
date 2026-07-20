/**
 * auth-ui.js
 * Shared UI helpers for auth pages (client login/register + owner login/register).
 * - Fetch CSRF token
 * - Render accessible alerts
 * - Provide consistent loading/disabled button behavior
 */

(function () {
  'use strict';

  function setAlert(el, message, type) {
    if (!el) return;
    el.textContent = message || '';
    el.setAttribute('role', 'status');
    el.className = '';

    // Keep compatibility with existing CSS classes used in the auth pages.
    if (!type) return;
    if (type === 'success') el.classList.add('form-success');
    else if (type === 'danger') el.classList.add('form-error');
    else if (type === 'info') el.classList.add('form-info');
    else el.classList.add('form-error');
  }

  async function fetchCsrfToken() {
    const res = await fetch('../php/csrf.php', { credentials: 'same-origin' });
    const data = await res.json();
    return data.csrfToken || '';
  }

  async function withCsrfToken(onToken) {
    try {
      const token = await fetchCsrfToken();
      return await onToken(token);
    } catch (e) {
      // If CSRF fetch fails, the server will reject; still allow the caller to show an error.
      return await onToken('');
    }
  }

  window.__XRENTALS_AUTH_UI__ = {
    setAlert,
    fetchCsrfToken,
    withCsrfToken,
  };
})();

