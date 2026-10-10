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

## Optional extras

Everything below is **off by default**, so the site looks exactly like the Hydrogen version until you turn it on.

| Feature | Where to turn it on |
| --- | --- |
| Announcement bar | Header area → Announcement bar (hidden, click the eye icon) |
| Search link in the menu | Header → "Add a search link after the menu" |
| Shop caption field | Shop page → Product list → "Caption comes from" (needs the `shop_caption` field below) |
| Low stock label on the shop page | Shop page → Product list → "Show a low stock label" |
| Collection intro / per-collection pages | Product list → "Show collection intro", or assign the `collection.editorial` template to a collection |
| Product details from fields | Product → Product detail blocks (already added for material, details, measurements; empty fields are hidden) |
| Low stock message | Product → Stock → "Show low stock message" |
| "Email me when it's back" | Product → Stock → turn it on. Requests arrive as contact form emails |
| Size guide drawer | Product → Size guide → pick a page (or set a product's own `size_guide` field) |
| Photo dots on phones | Product → "Show photo dots on phones" |
| Recommendations | Product page → Product recommendations (hidden, click the eye icon) |
| Free shipping progress | Theme settings → Cart → Free shipping message |
| Roboto Mono | Theme settings → Typography → "Load Roboto Mono for visitors" (changes the look) |
| Smooth fade | Theme settings → Animation → Smooth fade |

### Product custom fields to create

In **Settings → Custom data → Products → Add definition**, namespace `custom`:

| Name | Key | Type |
| --- | --- | --- |
| Shop caption | `custom.shop_caption` | Single line text |
| Material | `custom.material` | Single line or multi-line text |
| Details | `custom.details` | Multi-line text |
| Measurements | `custom.measurements` | Multi-line text |
| Size guide | `custom.size_guide` | Page (reference) |

When a product uses the detail fields, take that text out of its description so it doesn't show twice. More detail blocks can use any other `custom.*` key.

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

The About / Contact / Info templates ship with an editable section already added but **hidden** (eye icon in the editor). The page's existing HTML keeps rendering exactly as before until she turns it on and hides "Page content". Check the prefilled copy in the hidden About section before enabling it.

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
