/*
 * NNIE theme behavior. Recreates what the Hydrogen/React app did on the client:
 * viewport height var, page fade-in, drawers, SHOP hover image, AJAX cart,
 * in-place variant switching, "Load more" on the shop page, and the
 * newsletter form without a page reload.
 */
(() => {
  const nnie = (window.nnie = window.nnie || {});
  const routes = nnie.routes || {
    root: '/',
    cartAdd: '/cart/add.js',
    cartChange: '/cart/change.js',
    cart: '/cart',
  };

  /* ---------- --vh (was useViewportHeight) ---------- */
  const setVh = () =>
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  setVh();
  window.addEventListener('resize', setVh);

  /* ---------- Fade in (was the 500ms timeout in root.jsx) ---------- */
  const delay = parseInt(document.body.dataset.fadeDelay || '500', 10);
  setTimeout(() => document.body.classList.add('nnie-faded-in'), isNaN(delay) ? 500 : delay);
  // Never leave the page dimmed inside the theme editor.
  if (window.Shopify && window.Shopify.designMode) document.body.classList.add('nnie-no-fade');

  /* ---------- Drawers (was Aside) ---------- */
  const overlays = () => document.querySelectorAll('.overlay[data-aside]');
  const openAside = (type) => {
    overlays().forEach((o) => o.classList.toggle('expanded', o.dataset.aside === type));
  };
  const closeAside = () => overlays().forEach((o) => o.classList.remove('expanded'));
  nnie.openAside = openAside;
  nnie.closeAside = closeAside;

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-aside-open]');
    if (opener) {
      event.preventDefault();
      openAside(opener.dataset.asideOpen);
      return;
    }
    if (event.target.closest('[data-aside-close]')) {
      event.preventDefault();
      closeAside();
      return;
    }
    if (event.target.closest('[data-aside-close-on-click]')) closeAside();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAside();
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      event.target.matches('[data-aside-close][role="button"]')
    ) {
      event.preventDefault();
      closeAside();
    }
  });

  /* ---------- SHOP hover image ---------- */
  const desktop = window.matchMedia('(min-width: 768px)');
  const isHome = document.body.classList.contains('home-background');
  document.querySelectorAll('[data-hover-image]').forEach((image) => {
    const nav = image.closest('nav');
    if (!nav) return;
    const homeOnly = image.hasAttribute('data-home-only');
    nav.querySelectorAll('[data-hover-trigger]').forEach((trigger) => {
      trigger.addEventListener('mouseenter', () => {
        if (desktop.matches && (!homeOnly || isHome)) image.hidden = false;
      });
      trigger.addEventListener('mouseleave', () => (image.hidden = true));
      trigger.addEventListener('click', () => (image.hidden = true));
    });
  });

  /* ---------- Cart ---------- */
  const updateCount = (count) =>
    document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = count));

  const renderCartDrawer = (sectionsHtml) => {
    const html = sectionsHtml && sectionsHtml['cart-drawer'];
    const target = document.getElementById('CartDrawer');
    if (!html || !target) return;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const fresh = doc.querySelector('[data-cart-main]');
    if (fresh) target.replaceChildren(fresh);
  };

  const refreshCart = async () => {
    const [cart, sections] = await Promise.all([
      fetch(`${routes.cart}.js`).then((r) => r.json()),
      fetch(`${routes.root}?sections=cart-drawer`).then((r) => r.json()),
    ]);
    updateCount(cart.item_count);
    renderCartDrawer(sections);
    return cart;
  };
  nnie.refreshCart = refreshCart;

  const setCartLoading = (on) => {
    const main = document.querySelector('#CartDrawer [data-cart-main]');
    if (main) main.classList.toggle('is-loading', on);
  };

  // Add to cart (product form). Opens the drawer right away like the original.
  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('form[data-product-form]');
    if (!form) return;
    event.preventDefault();
    const submitter = event.submitter;
    const goToCheckout = submitter && submitter.hasAttribute('data-checkout-after-add');
    if (!goToCheckout) openAside('cart');
    const buttons = form.querySelectorAll('button[type="submit"]');
    buttons.forEach((b) => (b.disabled = true));
    setCartLoading(true);
    try {
      const body = new FormData(form);
      body.append('sections', 'cart-drawer');
      body.append('sections_url', window.location.pathname);
      const response = await fetch(routes.cartAdd, {
        method: 'POST',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body,
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.description || data.message || 'Could not add to cart.');
      } else if (goToCheckout) {
        window.location.href = '/checkout';
        return;
      } else {
        renderCartDrawer(data.sections);
        const cart = await fetch(`${routes.cart}.js`).then((r) => r.json());
        updateCount(cart.item_count);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCartLoading(false);
      buttons.forEach((b) => (b.disabled = b.hasAttribute('data-sold-out')));
    }
  });

  // Quantity +/− and Remove inside the cart.
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-cart-change]');
    if (!button) return;
    event.preventDefault();
    const line = button.closest('[data-line-key]');
    if (!line) return;
    setCartLoading(true);
    try {
      const response = await fetch(routes.cartChange, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          id: line.dataset.lineKey,
          quantity: parseInt(button.dataset.cartChange, 10),
          sections: ['cart-drawer'],
          sections_url: window.location.pathname,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.description || data.message || 'Could not update the cart.');
        await refreshCart();
      } else {
        updateCount(data.item_count);
        renderCartDrawer(data.sections);
        if (document.querySelector('[data-cart-page]')) window.location.reload();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCartLoading(false);
    }
  });

  // Optional order note.
  document.addEventListener('change', (event) => {
    if (!event.target.matches('[data-cart-note]')) return;
    fetch(`${routes.cart}/update.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: event.target.value }),
    });
  });

  /* ---------- Variant options: swap in place (no scroll jump) ---------- */
  document.addEventListener('click', async (event) => {
    const link = event.target.closest('a[data-variant-link]');
    if (!link || event.metaKey || event.ctrlKey) return;
    const section = link.closest('[data-product-section]');
    if (!section) return;
    event.preventDefault();
    const url = new URL(link.href, window.location.origin);
    url.searchParams.set('section_id', section.dataset.sectionId);
    try {
      const html = await fetch(url).then((r) => r.text());
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fresh = doc.querySelector('[data-product-section]');
      if (!fresh) throw new Error('No product section in response');
      section.replaceWith(fresh);
      url.searchParams.delete('section_id');
      window.history.replaceState({}, '', url);
    } catch (error) {
      window.location.href = link.href;
    }
  });

  /* ---------- Shop page "Load more ↓" / "↑ Load previous" ---------- */
  document.addEventListener('click', async (event) => {
    const link = event.target.closest('a[data-load-more]');
    if (!link) return;
    const grid = document.querySelector('[data-products-grid]');
    if (!grid) return;
    event.preventDefault();
    const direction = link.dataset.loadMore;
    const label = link.innerHTML;
    link.textContent = link.dataset.loadingText || 'Loading...';
    try {
      const url = new URL(link.href, window.location.origin);
      url.searchParams.set('section_id', link.dataset.sectionId);
      const html = await fetch(url).then((r) => r.text());
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const items = doc.querySelectorAll('[data-products-grid] > *');
      const freshLink = doc.querySelector(`a[data-load-more="${direction}"]`);
      if (direction === 'next') {
        items.forEach((item) => grid.appendChild(item));
      } else {
        const first = grid.firstElementChild;
        items.forEach((item) => grid.insertBefore(item, first));
      }
      if (freshLink) {
        link.href = freshLink.href;
        link.innerHTML = label;
      } else {
        link.remove();
      }
    } catch (error) {
      window.location.href = link.href;
    }
  });

  /* ---------- Newsletter: submit without leaving the page ---------- */
  document.addEventListener('submit', async (event) => {
    const form = event.target.closest('form.subsribe-form');
    if (!form) return;
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[data-subscribe-status]');
    const original = button ? button.textContent : '';
    if (button) {
      button.disabled = true;
      button.textContent = button.dataset.loadingText || original;
    }
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      // Shopify sometimes asks for a captcha; hand off to its page if so.
      if (response.url.includes('/challenge')) {
        window.location.href = response.url;
        return;
      }
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const freshStatus = doc.querySelector(`#${CSS.escape(form.id)} [data-subscribe-status]`);
      if (status && freshStatus) status.innerHTML = freshStatus.innerHTML;
      if (response.url.includes('customer_posted=true')) form.reset();
    } catch (error) {
      form.submit();
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = original;
      }
    }
  });
})();
