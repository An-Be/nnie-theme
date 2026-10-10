# NNIE Shopify theme

An Online Store 2.0 theme that rebuilds the NNIE Hydrogen storefront ([An-Be/NNIE](https://github.com/An-Be/NNIE)) in Liquid, so the store owner can edit the site in **Online Store → Themes → Customize** instead of asking for code changes.

The look and behavior match the Hydrogen app: same compiled Tailwind + SCSS, same markup and class names, same image sizing, and the same client behavior (per-page header colors, logo hover swap, SHOP hover image, fade-in, cart drawer, mobile menu, "Load more" on the shop page, in-place variant switching, newsletter signup without a reload).

## What she can edit without code

**Theme settings** (Customize → gear icon)
- Logo (keep the original recoloring SVG or upload images), hover logo, drawer logo, favicon, tab title prefix
- All brand colors, per-page header colors (home, shop, product, contact, info pages), shop/product backgrounds on desktop and phones
- Button colors, cart drawer colors and every cart label
- Fonts (CSS font lists or Shopify's font library)
- Fade-in on/off and delay

**Sections**
- Header: menu, MENU / CART text, which link shows the hover image and the image itself
- Footer: studio line, email, newsletter copy, footer menu, extra links (Instagram etc.), big logo
- Home: background photo (separate phone photo optional), how many times it repeats, optional text on top, plus any other section below it
- Shop: editorial vs grid layout, products per load, second photo + caption, price / sold-out display, Load more text
- Product: button labels, Buy now on/off and whether it goes straight to checkout, square crop on phones, extra text and expandable-info blocks (can be linked to metafields)
- Pages: background photo per page, or switch to the editable About / Contact / Info page sections
- Extra sections she can add anywhere: Text, Image banner, Featured products, Spacer

Menus live in **Online Store → Navigation** (`main-menu` and `footer`), page text in **Online Store → Pages**, product photo captions are the photos' alt text.

## Page styles

The body class (which drives header colors and backgrounds) follows the original routes:

| Page | Style |
| --- | --- |
| Home | `home-background` |
| `/collections/all` | `shop-background` |
| Product pages | `products-background` |
| Pages with handle `about` / template `page.about` | `about-background` |
| Pages with handle `contact` / template `page.contact` | `contact-background` |
| `terms`, `returns`, `care`, `privacy-policy` / template `page.legal` | `pages-background` |
| Everything else | `default-background` |

To give a new page one of these styles, pick its template on the page in the admin.

### About and Contact

Both are edited entirely in the theme editor: text, points and background photo, no HTML.

One-time setup: in **Online Store → Pages**, open About and set **Template** to `about`, then open Contact and set it to `contact`. After that, Customize → About page (or Contact page) shows the fields. They come prefilled with the live site's text and photos.

### Terms, Returns, Care, Privacy and other pages

Typed as plain text in **Online Store → Pages**. The page title becomes the small heading and the text sits in the narrow column. Pages that still contain the original hand-written HTML (`class="terms"` etc.) keep rendering exactly as before, so they can be cleaned up one at a time: open the page, click `<>`, replace the HTML with plain text, save.

Optional per-page background photo: create a page field in **Settings → Custom data → Pages** (name "Background image", key `custom.background_image`, type File). The old `custom.about_background_image` URL field still works.

## Setup

1. Connect this repo in **Online Store → Themes → Add theme → Connect from GitHub**, or run `shopify theme push --unpublished` from this folder.
2. Preview it, then publish.
3. Once it's live, the Hydrogen/Oxygen storefront can be retired.

The store uses new customer accounts (as the Hydrogen app did), so there are no `customers/*` templates.

## Development

```bash
npm install
npm run watch:css   # rebuilds assets/nnie.css from src/styles
shopify theme dev   # local preview against the store
shopify theme check
```

- `src/styles/` holds the original SCSS (with hard-coded colors/fonts swapped for CSS variables) plus `_theme.scss` for theme-specific glue. Edit there, not in `assets/nnie.css`.
- `assets/nnie-tailwind.css` is the Hydrogen build's compiled Tailwind output, kept as-is.
- `snippets/theme-styles.liquid` maps Theme settings to the CSS variables.
- `assets/nnie.js` is all client behavior (vanilla JS, no build step).
- `src/` and `package.json` are excluded from uploads via `.shopifyignore`.
