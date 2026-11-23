/**
 * ==============================================================================
 * JMC ESTATE LAW — CLIENT-SIDE JAVASCRIPT (main.js)
 * ==============================================================================
 * Welcome to the client script for JMC Estate Law!
 * 
 * This file is designed with vanilla JavaScript (no complex build tools, frameworks,
 * or libraries required). It runs directly in all modern web browsers.
 *
 * TABLE OF CONTENTS:
 * 1. Safe HTML Escaping (Security Helper)
 * 2. Mobile Navigation Toggle (Responsive Drawer & Accessibility)
 * 3. Dynamic Article Loader (Fetch API + Graceful Local Fallback)
 * 4. Consultation Contact Form Handler (Validation & Friendly Confirmation)
 * 5. Application Initialization (DOMContentLoaded Event)
 * ==============================================================================
 */

'use strict';

/**
 * ------------------------------------------------------------------------------
 * 1. HELPER: SAFE HTML ESCAPING
 * ------------------------------------------------------------------------------
 * Beginner Note: Whenever you display text from an external data source (like
 * a JSON file or user input) into HTML, you should "escape" special characters
 * (&, <, >, ", ') to prevent Cross-Site Scripting (XSS) attacks.
 *
 * @param {string} str - Raw input string
 * @returns {string} - Escaped string safe for HTML insertion
 */
function escapeHTML(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * ------------------------------------------------------------------------------
 * 2. MOBILE NAVIGATION TOGGLE
 * ------------------------------------------------------------------------------
 * Beginner Note: On smartphones and tablets, screen width is limited. We hide
 * the full navigation list behind a hamburger menu button. When the user taps
 * the toggle:
 *   1. We update the `aria-expanded` attribute ("true" or "false") so screen
 *      readers and assistive technologies know if the menu is open.
 *   2. We toggle the CSS class `is-open` to show or hide the menu drawer.
 *   3. We close the menu automatically if the user clicks a link or presses Escape.
 */
function initMobileNav() {
  // Query for the toggle button and navigation menu elements
  const toggleBtn = document.getElementById('nav-toggle') || 
                    document.querySelector('.nav-toggle') || 
                    document.querySelector('.mobile-nav-toggle');

  const navMenu = document.getElementById('primary-nav') || 
                  document.querySelector('.primary-nav') || 
                  document.querySelector('.main-nav');

  // If this page does not have a navigation toggle, exit safely
  if (!toggleBtn || !navMenu) {
    return;
  }

  /**
   * Helper function to open or close the mobile navigation menu
   * @param {boolean} shouldOpen - true to open, false to close
   */
  function setNavState(shouldOpen) {
    // 1. Update accessibility attribute for screen readers
    toggleBtn.setAttribute('aria-expanded', String(shouldOpen));

    // 2. Toggle active classes for visual presentation
    if (shouldOpen) {
      navMenu.classList.add('is-open', 'nav-open');
      toggleBtn.classList.add('is-active');
      document.body.classList.add('nav-drawer-open');
    } else {
      navMenu.classList.remove('is-open', 'nav-open');
      toggleBtn.classList.remove('is-active');
      document.body.classList.remove('nav-drawer-open');
    }
  }

  // Toggle open/close when clicking the hamburger button
  toggleBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    const isCurrentlyExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    setNavState(!isCurrentlyExpanded);
  });

  // Automatically close mobile menu when clicking any navigation link inside it
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setNavState(false);
    });
  });

  // Accessibility: Close menu if user presses the "Escape" key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
      setNavState(false);
      toggleBtn.focus(); // Return focus to the button for keyboard navigation
    }
  });

  // Close menu if user clicks anywhere outside the navigation menu and toggle
  document.addEventListener('click', (event) => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded && !navMenu.contains(event.target) && !toggleBtn.contains(event.target)) {
      setNavState(false);
    }
  });
}

/**
 * ------------------------------------------------------------------------------
 * 3. DYNAMIC ARTICLE LOADER
 * ------------------------------------------------------------------------------
 * Beginner Note:
 * Modern websites often pull articles or news from a central data file
 * (like `./data/articles.json`).
 *
 * How this works:
 * 1. We locate the `#articles-grid` container on the page.
 * 2. We use the browser's built-in `fetch()` function to request `articles.json`.
 * 3. IF THE FETCH SUCCEEDS: We parse the articles and dynamically build cards.
 * 4. IF THE FETCH FAILS (e.g., when viewing locally via `file:///` without a web server,
 *    or when the user is offline): We SAFELY RETAIN the existing static HTML
 *    fallback cards that were already written into `index.html`. This ensures
 *    the website never looks broken or empty!
 */
function initArticleLoader() {
  const articlesGrid = document.getElementById('articles-grid');

  // If this page doesn't have an articles grid (e.g. privacy.html), exit cleanly
  if (!articlesGrid) {
    return;
  }

  // Path to our dynamic articles JSON data file
  const articlesDataUrl = './data/articles.json';

  // Attempt to fetch dynamic article data
  fetch(articlesDataUrl)
    .then((response) => {
      // Check if HTTP response status is successful (status in range 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((articles) => {
      // Validate that articles is a non-empty array
      if (!Array.isArray(articles) || articles.length === 0) {
        console.info(
          'JMC Estate Law: articles.json returned empty data. Retaining static fallback cards.'
        );
        return; // Retains existing static fallback cards
      }

      // Render the fetched articles into the grid
      renderArticles(articles, articlesGrid);
      console.info(`JMC Estate Law: Successfully loaded ${articles.length} dynamic articles.`);
    })
    .catch((error) => {
      /**
       * Graceful Degradation / Fallback Explanation:
       * When someone opens an HTML file by double-clicking it in Windows/macOS (file:// URL),
       * browsers block `fetch()` due to local security/CORS policies.
       *
       * By wrapping this in catch(), we safely leave the static fallback cards in place!
       * Website visitors will still see rich, helpful estate planning articles.
       */
      console.info(
        'JMC Estate Law: Dynamic article fetch bypassed (standard behavior under file:// or offline mode). ' +
        'Static fallback article cards safely preserved in #articles-grid.',
        error.message
      );
    });
}

/**
 * Helper function to generate HTML cards for an array of articles
 * @param {Array<Object>} articles - List of article objects from articles.json
 * @param {HTMLElement} container - The #articles-grid DOM element
 */
function renderArticles(articles, container) {
  // Clear existing fallback cards now that we have fresh dynamic data
  container.innerHTML = '';

  // Loop through each article object and create a semantic card
  articles.forEach((article) => {
    const card = document.createElement('article');
    card.className = 'article-card';
    card.setAttribute('data-article-id', article.id || '');

    // Safely escape all values to prevent injection
    const safeTitle = escapeHTML(article.title);
    const safeSource = escapeHTML(article.source);
    const safeUrl = escapeHTML(article.url || '#contact');
    const safeDate = escapeHTML(article.date);
    const safeSummary = escapeHTML(article.summary);
    const safeReadTime = escapeHTML(article.readTime || '5 min read');

    card.innerHTML = `
      <div class="article-header article-meta">
        <span class="source-badge article-source article-category">${safeSource}</span>
        <div class="article-meta-right" style="display:inline-flex; align-items:center; gap:6px;">
          <time class="article-date">${safeDate}</time>
          <span class="article-read-time" aria-label="Estimated read time: ${safeReadTime}">&bull; ${safeReadTime}</span>
        </div>
      </div>

      <h3 class="article-title">
        <a href="${safeUrl}" class="article-title-link" target="_blank" rel="noopener noreferrer">
          ${safeTitle}
        </a>
      </h3>

      <p class="article-excerpt article-summary">
        ${safeSummary}
      </p>

      <div class="article-footer">
        <a href="${safeUrl}" class="editorial-link article-link article-read-more" target="_blank" rel="noopener noreferrer" aria-label="Read full article at ${safeSource}: ${safeTitle}">
          <span>Read at ${safeSource}</span>
          <span class="arrow" aria-hidden="true">&rarr;</span>
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}

/**
 * ------------------------------------------------------------------------------
 * 4. CONSULTATION CONTACT FORM HANDLER
 * ------------------------------------------------------------------------------
 * Beginner Note:
 * When a visitor submits the consultation form:
 * 1. `event.preventDefault()` stops the browser from doing a default full-page reload.
 * 2. We validate that required fields (Name, Email, Phone, Service, Message) are filled.
 * 3. We check for a valid email address structure.
 * 4. If any field is missing or invalid, we highlight it and show clear guidance.
 * 5. When valid, we display a reassuring confirmation message:
 *    "Thank you for reaching out. We have received your inquiry and will respond within one business day."
 * 6. We reset the form fields so the user knows their submission completed.
 */
function initContactForm() {
  const form = document.getElementById('consultation-form') || 
               document.querySelector('form.inquiry-form') ||
               document.querySelector('#contact form');

  // If no contact form is on this page (e.g. privacy.html), exit cleanly
  if (!form) {
    return;
  }

  // Look for existing status container or create one if missing
  let statusContainer = document.getElementById('form-status') || 
                        form.querySelector('.form-status-message');

  if (!statusContainer) {
    statusContainer = document.createElement('div');
    statusContainer.id = 'form-status';
    statusContainer.className = 'form-status-message';
    statusContainer.setAttribute('role', 'status');
    statusContainer.setAttribute('aria-live', 'polite');
    form.prepend(statusContainer);
  }

  /**
   * Helper function to show status banner
   * @param {string} type - 'success' or 'error'
   * @param {string} message - Message text to display
   */
  function showStatus(type, message) {
    statusContainer.textContent = message;
    statusContainer.className = `form-status-message is-visible status-${type}`;
    statusContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Helper function to mark an input field with an error state
   * @param {HTMLElement} inputElement - Form input/select/textarea
   * @param {string} errorMessage - Description of what went wrong
   */
  function markFieldError(inputElement, errorMessage) {
    const parentGroup = inputElement.closest('.form-group') || inputElement.parentElement;
    if (parentGroup) {
      parentGroup.classList.add('has-error');

      // Check if error message span already exists
      let errorSpan = parentGroup.querySelector('.field-error-message');
      if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'field-error-message';
        parentGroup.appendChild(errorSpan);
      }
      errorSpan.textContent = errorMessage;
    }
    inputElement.setAttribute('aria-invalid', 'true');
  }

  /**
   * Helper function to clear error state from an input field
   * @param {HTMLElement} inputElement
   */
  function clearFieldError(inputElement) {
    const parentGroup = inputElement.closest('.form-group') || inputElement.parentElement;
    if (parentGroup) {
      parentGroup.classList.remove('has-error');
      const errorSpan = parentGroup.querySelector('.field-error-message');
      if (errorSpan) {
        errorSpan.remove();
      }
    }
    inputElement.removeAttribute('aria-invalid');
  }

  // Clear errors when the user begins typing or changing values
  const allInputs = form.querySelectorAll('input, select, textarea');
  allInputs.forEach((input) => {
    input.addEventListener('input', () => {
      clearFieldError(input);
      if (!form.querySelector('.has-error')) {
        statusContainer.className = 'form-status-message';
        statusContainer.textContent = '';
      }
    });
    input.addEventListener('change', () => {
      clearFieldError(input);
    });
  });

  // Handle Form Submission
  form.addEventListener('submit', (event) => {
    // 1. Prevent default HTTP POST page reload
    event.preventDefault();

    // 2. Extract input values
    const nameInput = form.querySelector('[name="fullName"]') || document.getElementById('full-name');
    const emailInput = form.querySelector('[name="email"]') || document.getElementById('email');
    const phoneInput = form.querySelector('[name="phone"]') || document.getElementById('phone');
    const serviceInput = form.querySelector('[name="serviceNeeded"]') || document.getElementById('service-needed');
    const messageInput = form.querySelector('[name="message"]') || document.getElementById('message');

    let isValid = true;
    let firstInvalidElement = null;

    // Reset previous errors
    allInputs.forEach(clearFieldError);

    // Validate Full Name
    if (nameInput) {
      const nameVal = nameInput.value.trim();
      if (!nameVal || nameVal.length < 2) {
        markFieldError(nameInput, 'Please provide your full name.');
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = nameInput;
      }
    }

    // Validate Email Address
    if (emailInput) {
      const emailVal = emailInput.value.trim();
      // Standard email regex format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal || !emailRegex.test(emailVal)) {
        markFieldError(emailInput, 'Please provide a valid email address (e.g. name@example.com).');
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = emailInput;
      }
    }

    // Validate Phone Number
    if (phoneInput && phoneInput.hasAttribute('required')) {
      const phoneVal = phoneInput.value.trim();
      // Basic phone check: digits, dashes, parentheses
      const cleanPhone = phoneVal.replace(/[\s\-\(\)\.]/g, '');
      if (!phoneVal || cleanPhone.length < 7) {
        markFieldError(phoneInput, 'Please provide a valid contact telephone number.');
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = phoneInput;
      }
    }

    // Validate Service Dropdown
    if (serviceInput && serviceInput.hasAttribute('required')) {
      const serviceVal = serviceInput.value.trim();
      if (!serviceVal || serviceVal === '') {
        markFieldError(serviceInput, 'Please select the legal service you are inquiring about.');
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = serviceInput;
      }
    }

    // Validate Message Field
    if (messageInput) {
      const messageVal = messageInput.value.trim();
      if (!messageVal || messageVal.length < 5) {
        markFieldError(messageInput, 'Please briefly describe your inquiry or estate planning goals.');
        isValid = false;
        if (!firstInvalidElement) firstInvalidElement = messageInput;
      }
    }

    // If validation fails, focus the first error and notify user
    if (!isValid) {
      showStatus('error', 'Please correct the highlighted fields above before submitting.');
      if (firstInvalidElement) {
        firstInvalidElement.focus();
      }
      return;
    }

    // 3. SUCCESS STATE
    // Show friendly confirmation message specified in requirements:
    const confirmationMessage = 
      'Thank you for reaching out. We have received your inquiry and will respond within one business day.';

    showStatus('success', confirmationMessage);

    // Reset form fields
    form.reset();

    // Log confirmation for debugging
    console.info('JMC Estate Law: Consultation inquiry submitted successfully.');
  });
}

/**
 * ------------------------------------------------------------------------------
 * 5. APPLICATION INITIALIZATION
 * ------------------------------------------------------------------------------
 * Beginner Note: We attach our initialization code to the `DOMContentLoaded`
 * event. This ensures that HTML elements (buttons, grids, forms) are fully
 * parsed and ready before JavaScript attempts to attach click listeners or
 * render cards.
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize mobile hamburger navigation toggle
  initMobileNav();

  // 2. Initialize dynamic third-party educational articles loader
  initArticleLoader();

  // 3. Initialize consultation inquiry contact form handler
  initContactForm();
});
