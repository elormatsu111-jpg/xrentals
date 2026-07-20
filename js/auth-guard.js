/**
 * js/auth-guard.js
 * Include on any page under Assets/Dashboard/. On load it:
 *   1. Calls php/session_check.php to verify the visitor is logged in.
 *   2. Redirects to the right login page if not (or if their account
 *      type doesn't match window.XRENTALS_REQUIRED_ROLE, when set).
 *   3. Fills in [data-user-firstname] / [data-user-email] placeholders.
 *   4. Wires up any [data-logout] button to call php/logout.php.
 *
 * Set before this script runs, e.g.:
 *   <script>
 *     window.XRENTALS_LOGIN_PAGE = '../auth/propertyOwnerLogin.html';
 *     window.XRENTALS_REQUIRED_ROLE = 'owner'; // optional
 *   </script>
 */

(function () {
  const loginPage = window.XRENTALS_LOGIN_PAGE || '../auth/clientLogin.html';
  const requiredRole = window.XRENTALS_REQUIRED_ROLE || null;

  fetch('../php/session_check.php', { credentials: 'same-origin' })
    .then(res => res.json())
    .then(data => {
      if (!data.loggedIn || (requiredRole && data.accountType !== requiredRole)) {
        window.location.href = loginPage;
        return;
      }

      document.querySelectorAll('[data-user-firstname]').forEach(el => {
        el.textContent = data.firstName;
      });
      document.querySelectorAll('[data-user-email]').forEach(el => {
        el.textContent = data.email;
      });

      window.__csrfToken = data.csrfToken;

      document.querySelectorAll('[data-logout]').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            await fetch('../php/logout.php', { method: 'POST', credentials: 'same-origin' });
          } finally {
            window.location.href = loginPage;
          }
        });
      });
    })
    .catch(() => {
      // If the check itself fails (e.g. server down), fail safe by
      // sending the visitor back to login rather than showing a
      // half-loaded dashboard.
      window.location.href = loginPage;
    });
})();
