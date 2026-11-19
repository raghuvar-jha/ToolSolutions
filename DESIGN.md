# DESIGN.md — Tools Solutions storefront

Source of truth for UI work. Read this before creating or changing any component.

## 0. Reference files

| File | What it is | How to use it |
|---|---|---|
| `docs/design/reference/HomePageLaptop.png` (2336×6082, 2× → **1168px** CSS viewport) | **Our own homepage mock (Tools Solutions), desktop** | Primary reference. Match it. |
| `docs/design/reference/HomePageMobile.png` (750×7552, 2× → **375px** CSS viewport) | **Our own homepage mock, mobile** | Primary reference for mobile. |
| `docs/design/reference/HomePage.png` | Third-party marketplace homepage | Layout ideas only (dense card rows, footer structure). Do not copy branding, colors or assets. |
| `docs/design/reference/productPage.png` | Third-party product detail page | Layout reference for the future PDP (gallery left, info center, buy box right). |
| `docs/design/reference/Cart.png` | Third-party cart page | Layout reference for the future cart (line items left, sticky summary right). |

All measurements below are in CSS px, converted from the 2× mocks and rounded to the nearest Tailwind step.
The mock uses Tailwind's default palette (blue / gray / green / yellow), so most values map 1:1 to Tailwind colors.

---

## 1. Page structure (top to bottom)

### Desktop
1. **Header bar**: gradient navy → blue. Logo · category select + search · Allow Location · Login · Register · Cart.
2. **Category nav bar**: white. "Shop All Tools" pill · the category list (§5) · "Today's Deals" (right).
3. **Hero**: a rotating main banner on the left (~66%) and two stacked banners on the right (~34%).
4. **Trust strip**: 4 items (Fast Delivery · Genuine Products · Expert Assistance · Bulk Orders).
5. **Popular Products**: light-blue panel, 4 product cards in one row.
6. **Featured Products**: white bordered panel with "View All", 5-column grid (12 items in the mock).
7. **Our Certifications**: full-width light-gray band, 4 certificate cards.
8. **Customer Reviews**: light-blue panel, overall rating, horizontally scrolling review cards.
9. **Footer**: navy. Address · Contact Us · Quick Links, then a divider and the copyright.
10. **Floating help button** (fixed, bottom-right): "Need help? Message us!" chip and a green round chat button with a Lucide chat icon.

### Mobile
1. **Top bar** (navy): logo on the left, phone icon + "ORDER NOW" on the right
2. **Location row**: location pill with a locate button · "Delivery 1 Day" pill
3. **Search row**: search input with a navy search button · cart pill with count
4. **Category strip**: the category list (§5), icon + label
5. **Hero**: swipeable carousel of all three banners, with dots
6. **Trust strip**: 2×2 grid
7. Popular Products (2 columns)
8. Featured Products (2 columns)
9. Our Certifications (swipe carousel + "Swipe to see more →")
10. Customer Reviews (swipe)
11. Footer (stacked)
12. **Bottom tab bar** (fixed): Home · Category · Notifications · Account · Cart
13. Floating help button, placed above the tab bar

Items 2–4 sit on a blue → white vertical gradient. The seasonal illustration from the mock is **not in v1**.

---

## 2. Layout

- **Breakpoints**: mobile-first. Design at **390px** and **1440px** (per CLAUDE.md). Tablet (`md`) uses 3-column grids. Switch to the desktop header and hero at `lg` (1024px).
- **Container**: the mock is nearly full-bleed at 1168px with inconsistent insets: header and hero ≈20px, Popular/Featured/Certifications ≈48px, Reviews ≈30px.
  **Decision:** one centered container, `max-w-site` (token `--container-site`, 1280px), with `px-4` (16px) side padding on mobile and `px-6` (24px) from `lg`.
  It lives in **one shared wrapper component**, `components/Container.tsx` (`mx-auto w-full max-w-site px-4 lg:px-6`). Every section renders its content inside `<Container>`; never repeat these classes by hand. Section backgrounds (header, cert band, footer) span the full width outside the Container; their content goes inside it.
- **Grids**
  | Section | Mobile | md | lg+ |
  |---|---|---|---|
  | Hero | carousel (3 banners) | carousel (3 banners) | `grid-cols-[2fr_1fr]`: carousel left, 2 static banners right |
  | Trust strip | 2×2 grid | 2 cols | 4 cols |
  | Popular | 2 cols | 3 cols | 4 cols |
  | Featured | 2 cols | 3 cols | 5 cols |
  | Certifications | horizontal scroll, ~85% card width | 3 cols | 4 cols |
  | Reviews | horizontal scroll, ~85% card | scroll, 2 visible | scroll, ~3.6 visible (last one peeks) |
  | Footer | 1 col | 3 cols | 3 cols (4th col empty in mock) |
- **Grid gap**: 12px on mobile, 16px on desktop (cards and hero tiles).
- **Section spacing**: 16px between stacked panels (Popular → Featured, Certifications → Reviews). 20–24px above the hero and above the footer. The cert band has ~48px vertical padding. Use `space-y-4 lg:space-y-6` on the main column.
- **Panel padding**: 12px on mobile, 16px on desktop. Panel radius 12px.

---

## 3. Typography

Font: **Inter**, loaded in `app/layout.tsx` with `next/font/google` (`variable: "--font-inter"` on `<html>`). The `--font-sans` token in `globals.css` points to it (fallback `ui-sans-serif, system-ui, sans-serif`), so `font-sans` and the body default use Inter.

| Role | Desktop | Mobile | Weight | Color |
|---|---|---|---|---|
| Section title (Popular, Featured, Reviews) | 20px | 18px | 600 | gray-900 |
| Display section title (Our Certifications) | 28px | 22px | 800 (extra-bold) | gray-900 |
| Section subtitle ("What our customers say") | 14px | 14px | 400 | gray-500 |
| Header nav links | 16px | — | 500 | gray-900 / white on header |
| "Today's Deals" / "View All" links | 16px | 15px | 600 | blue-700 / blue-800 |
| Product card title | 15px | 15px | 600, centered | gray-900 |
| Price | 18px | 18px | 800 | blue-950 |
| MRP (struck through) | 11px | 11px | 400, `line-through` | gray-400 |
| "1 DAY" badge | 11px | 11px | 700, uppercase | green-700 |
| Trust item title / sub | 14px / 12px | — | 600 / 400 | gray-900 / gray-500 |
| Review name / text | 16px / 14px, leading-relaxed | same | 600 / 400 | gray-900 / gray-600 |
| Footer heading / link | 16px / 15px | same | 600 / 400 | white / blue-200 |
| Copyright | 14px | 13px | 400 | blue-300 |
| Search placeholder | 16px | 15px | 400 | gray-400 |
| Mobile category label | — | 13px | 500 | gray-900 |
| Mobile tab bar label | — | 11px | 500 | gray-600 (active blue-700) |

---

## 4. Colors (sampled from our mocks)

These colors are applied as `@theme` tokens in `apps/web/app/globals.css` (see the token table at the end of this section). In components, **always use the token classes** (`bg-brand-950`, `text-muted`, `border-line`, …), never the hex values or Tailwind's raw `blue-*` / `gray-*` names. The tables below give the Tailwind name only to show where each value comes from.

### Primary (brand blues)
| Hex | Tailwind | Used for |
|---|---|---|
| `#162456` | blue-950 | Header start, footer bg, mobile "ORDER NOW" bar, price text, search button, card underline bar |
| `#1c398e` | blue-900 | Header middle, desktop search button, "Shop All Tools" text, footer divider |
| `#193cb8` | blue-800 | "View All" link |
| `#1447e6` | blue-700 | "Today's Deals", trust icons, review avatar initial, active tab |
| `#2b7fff` | blue-500 | Header gradient end, mobile gradient top (~`#5b9cff`) |

### Text
| Hex | Tailwind | Used for |
|---|---|---|
| `#101828` | gray-900 | Headings, card titles |
| `#4a5565` | gray-600 | Body / review text |
| `#6a7282` | gray-500 | Subtitles, trust sub-labels |
| `#99a1af` | gray-400 | MRP, placeholders, "Swipe to see more" |
| `#ffffff` | white | Text on header and footer |
| `#bedbff` | blue-200 | Footer links |
| `#8ec5ff` | blue-300 | Copyright |

### Backgrounds / surfaces
| Hex | Tailwind | Used for |
|---|---|---|
| `#ffffff` | white | Page, nav bar, cards, trust strip |
| `#f9fafb` | gray-50 | Product image well, certifications band |
| `#f3f4f6` | gray-100 | Card / panel borders |
| `#eff6ff` | blue-50 | Reviews panel, trust icon circles, "Shop All Tools" pill |
| `#dbeafe` | blue-100 | Popular Products panel, avatar circle |
| gradient `#162456 → #1c398e → #2b7fff` | — | Desktop header (left → right) |
| gradient `#5b9cff → #bbd7ff → #ffffff` | — | Mobile top area (top → bottom) |

### Accents / status
| Hex | Tailwind | Used for |
|---|---|---|
| `#008236` | green-700 | "1 DAY" badge text, "1 Day" delivery text |
| `#f0fdf4` | green-50 | "1 DAY" badge bg, delivery pill bg |
| `#00c950` | green-500 | Floating chat button, "Message us!" |
| `#fdc700` | yellow-400 | Review stars, rating star |
| `#ffdf20` | yellow-300 | Footer icons, mobile "ORDER NOW" phone icon |

### `@theme` tokens (applied in `globals.css`)
| Token | Hex | Class examples |
|---|---|---|
| `--color-brand-950` | `#162456` | `bg-brand-950`, `text-brand-950` |
| `--color-brand-900` | `#1c398e` | `bg-brand-900` |
| `--color-brand-800` | `#193cb8` | `text-brand-800` |
| `--color-brand-700` | `#1447e6` | `text-brand-700` |
| `--color-brand-500` | `#2b7fff` | `to-brand-500` |
| `--color-brand-300` | `#8ec5ff` | `text-brand-300` |
| `--color-brand-200` | `#bedbff` | `text-brand-200` |
| `--color-brand-100` | `#dbeafe` | `bg-brand-100` |
| `--color-brand-50` | `#eff6ff` | `bg-brand-50` |
| `--color-sky-start` / `--color-sky-mid` | `#5b9cff` / `#bbd7ff` | `from-sky-start via-sky-mid to-surface` |
| `--color-surface` | `#ffffff` | `bg-surface` |
| `--color-page` | `#ffffff` | body background |
| `--color-well` | `#f9fafb` | `bg-well` |
| `--color-line` | `#f3f4f6` | `border-line` |
| `--color-text` | `#101828` | `text-text` |
| `--color-body` | `#4a5565` | `text-body` |
| `--color-muted` | `#6a7282` | `text-muted` |
| `--color-faint` | `#99a1af` | `text-faint` |
| `--color-success` / `--color-success-bg` | `#008236` / `#f0fdf4` | `text-success bg-success-bg` |
| `--color-chat` | `#00c950` | `bg-chat` |
| `--color-star` | `#fdc700` | `text-star` |
| `--color-footer-icon` | `#ffdf20` | `text-footer-icon` |
| `--radius-card` / `--radius-banner` / `--radius-pill` | 12px / 16px / 9999px | `rounded-card`, `rounded-banner`, `rounded-pill` |
| `--container-site` | 1280px | `max-w-site` (via `<Container>`) |
| `--font-sans` | Inter | `font-sans` (body default) |

If a component needs a color that isn't listed here, add a token first.

---

## 5. Component notes

### Header (desktop, `lg+`)
- Height ~76px. Horizontal gradient `blue-950 → blue-900 → blue-500`.
- Left: `logo/DesktopLogo.png`, ~32px tall. The logo has white text on a transparent background, so it only works on a dark background.
- Right cluster, white text, 16px/600: `MapPin` "Allow Location" · `User` "Login" · **Register** (white pill button, navy text, radius 8px, px-5 py-2) · `ShoppingCart` "Cart" with a count badge (small cyan/blue circle, top-left of the icon).
- **v1:** Allow Location, Login and Register are **display-only** (no auth, no geolocation). Cart shows the count.
- Below it, the **nav bar**: white, ~56px, bottom border `line`. Left: "Shop All Tools" pill (`brand-50` bg, `brand-900` text, `Package` icon, radius 8px). Category links are spread evenly. Right: `Zap` "Today's Deals" in `brand-700`.

### Search bar
- Desktop: one white bar, ~44px tall, ~500px wide, radius 8px. Three parts:
  1. "All Tools ▾" category select (~100px, right divider)
  2. `Search` icon + input, placeholder "Search by tool, brand, size or model..."
  3. Search button: blue-900 square on the right with a white `Search` icon.
- Mobile: input ~42px tall, gray-50/white, radius 12px, placeholder "Search tools...", leading gray `Search` icon. Navy (blue-950) square button with radius 10px inside the right end. A separate white **cart pill** (cart icon + count) sits beside it.

### Category strip
**One category list everywhere** (desktop nav, mobile strip, and later the category pages), defined once in code and shared:

| Category | Lucide icon (mobile strip) |
|---|---|
| Cutting & Drilling | `Drill` (or `Cone`) |
| Power Tools | `Zap` |
| Measuring | `Ruler` |
| Safety | `HardHat` |
| Clamping | `Wrench` (no exact clamp icon; revisit) |

"For You" (personalized) is **not in v1**. *The final list needs client confirmation (§8).*

- **Desktop**: text links in the nav bar (see Header).
- **Mobile**: a horizontal row (scrollable on overflow) with a ~28px line icon above a 13px label. The active item gets a light tinted tile and a **3px dark bottom border**. The `categories/` image folder is empty, so use the Lucide icons above.

### Hero (carousel)
- **Desktop**: the carousel is on the left (≈746×420, ratio ~1.78:1). Two **static** banners are stacked on the right (≈365×205 each), gap 16px. Radius `rounded-banner` (16px).
- **Mobile**: the carousel spans the full container width, radius 12px, and slides through **all three banners**.
- **Behaviour**:
  - Auto-advances every **5 seconds** and **pauses on hover** and while focus is inside it.
  - **Dots** below or over the bottom of the banner: active dot `brand-950`, inactive `brand-100`; tap targets ≥ 24px.
  - **Swipe** on touch devices (CSS `snap-x` scrolling or pointer events; no carousel library needed).
  - Respects `prefers-reduced-motion`: no auto-advance.
  - No arrows in v1 (may be added later).
- **Slides**: desktop rotates HeroImage-1 and HeroImage-3. Mobile rotates HeroImage-1, -2 and -3. HeroImage-2 must use its approved version, see §7.
- The banner images already contain their text, so they need meaningful `alt` text. Use `next/image` with `priority` on the first slide only.

### Trust strip
- White strip, top and bottom border `line`. 4 items, each with: a 36px `brand-50` circle holding a `brand-700` Lucide icon (`Truck`, `ShieldCheck`, `PhoneCall`, `Package`), then the title (14/600) and sub-label (12/400 `muted`).
- Desktop: 4 equal columns, ~68px tall. Mobile: a **2×2 grid** with 12px gap and 12px vertical padding.

### Product card (Popular and Featured share one component)
- White card, radius 12px, 1px gray-100 border, soft shadow (`shadow-sm`), overflow hidden.
- **Image well**: gray-50, square-ish (`aspect-[4/3.2]`), product image centered with `object-contain` and ~16px padding.
- **"1 DAY" badge**: top-left of the well. green-50 pill, green-700 `Truck` icon + "1 DAY" (11px/700), radius 6px.
- **Body**: white, centered. Title (15/600, 1 line, truncate) → ~16px gap → price row (`₹1,299` 18/800 `brand-950` + `₹1,599` 11px `faint` line-through) → the **navy bar**.
- **Navy bar = "Add to cart" button** (assumed, client to confirm). It is a real `<button>` with `aria-label="Add {product} to cart"`. The visible bar is 32×3px `brand-950`, rounded, but the hit area is ≥ 44×24px. On hover/focus it widens and shows a focus ring. Clicking it adds the item to the cart; clicking anywhere else on the card goes to the product page.
- Product data for v1 comes from **`apps/web/lib/products.ts`** (typed array: id, slug, name, image, price, mrp, deliveryBadge, popular/featured flags) until Prisma is added.
- Popular panel: blue-100 background, radius 12px, padding 16px, title "Popular Products".
- Featured panel: white, 1px gray-100 border, radius 12px, padding 16px. Title "Featured Products" on the left, "View All" link (blue-800, 16/600) on the right.

### Certification card
- White card, radius 16px, border `line`, padding 16px. Inside: a `well` image well (radius 12px) with the certificate image `object-contain`. Label below (16/600 centered).
- **v1 shows 3 cards** (no 4th until the client supplies one). Desktop grid stays at 4 columns, so one slot is empty, or use `lg:grid-cols-3`. Choose when building.
- Certificate images show other brands' logos, so they are **not published until the client provides written dealer authorization**. Until then, show a placeholder (see §7).

### Review card
- White, radius 12px, shadow-sm, padding 16px. 48px avatar circle (blue-100 bg, blue-700 initial, 18/700) · name (16/600) · 5 stars (yellow-400, unfilled = gray-300) · faint quote icon (gray-300) top-right · text 14px gray-600 leading-relaxed.
- Panel header: title + "What our customers say" on the left; `Star` (yellow-400) + "4.8" (18/700) on the right.

### Footer
- Background blue-950. Container padding ~48px top, 32px bottom.
- 3 columns: **Address** (yellow-300 `MapPin`, uppercase address in blue-200), **Contact Us** (yellow-300 `Phone` / `Mail` + links), **Quick Links** (About Us, Contact Us, Privacy Policy, Terms & Conditions).
- 1px blue-900 divider, then "© 2026 Tools Solutions. All rights reserved." centered in blue-300.

### Floating help button
- Fixed bottom-right (desktop ~24px inset; mobile sits above the tab bar). A white chip with shadow, "Need help? **Message us!**" (`chat` green), followed by a 48px `bg-chat` circle holding a white **Lucide `MessageCircle`** icon.
- **No WhatsApp logo** (third-party brand asset). The link target (WhatsApp deep link, phone or contact page) is decided when building.

---

## 6. Mobile differences (vs desktop)

- The header is replaced by a navy **top bar**, the **location pill** + **delivery pill** row, and the **search + cart pill** row.
- **Top bar (deviation from the mock):** the mock has no logo on mobile, but the brand must show. The bar is `brand-950`, ~48px tall. `DesktopLogo.png` (~28px tall) sits on the left; the logo needs a dark background, which this bar provides. The phone icon (`footer-icon` yellow) + "ORDER NOW" (white 14/600 uppercase) sits on the right.
- Location pill: translucent white on the gradient, radius 16px, `MapPin` + "Select your location" (14/600). A navy circular locate button (`LocateFixed`) sits at its right end. **Display-only in v1.**
- Delivery pill: `success-bg`, radius 16px, `Truck` `success`, "Delivery" (11px `muted`) over "1 Day" (16/800 `success`). **A static label in v1.**
- The location, search and category rows have a blue → white gradient background (`sky-start → sky-mid → surface`).
- The category nav becomes an **icon + label strip**.
- The **seasonal illustration** from the mock is **skipped in v1**.
- Hero: swipeable carousel of **all three banners** with dots (see §5).
- **Trust strip shows as a 2×2 grid.**
- Grids: Popular and Featured use 2 columns. Certifications and Reviews become horizontal swipe rows (`snap-x`), with a "Swipe to see more →" hint under Certifications.
- Footer stacks into one column. Contact rows get a right `ChevronRight` (full-row tap targets). Quick Links become a 2-column grid.
- **Fixed bottom tab bar** (white, top border, ~56px + safe-area inset): `Home` (active, `brand-700`), `LayoutGrid` Category, `Bell` Notifications, `User` Account, `ShoppingCart` Cart. Page content needs bottom padding so the tab bar doesn't cover it. **Notifications and Account are display-only in v1.**

---

## 7. Images in `apps/web/public/images`

| File | Size | Section / use |
|---|---|---|
| `logo/DesktopLogo.png` | 2172×724 (3:1) | Header logo on **desktop and mobile** (dark background only) |
| `hero/HeroImage-1.png` | 2428×1418 | Hero carousel slide 1 (desktop + mobile): "TCT Hole Saw" |
| `hero/HeroImage-2.png` | 2076×1150 | Hero **top-right** banner on desktop, carousel slide on mobile. ⚠ Shows a third-party brand name. **Publish only a cropped version (brand removed) or a placeholder** until the client provides written dealer authorization. |
| `hero/HeroImage-3.png` | 2076×1150 | Hero **bottom-right** banner on desktop (also a desktop carousel slide), carousel slide on mobile: "TCT Annular Cutters" |
| `products/Annular.png` | 501×498 | Product cards: Annular Cutter, Core Cutter, Annular Core Cutter |
| `products/Drill.png` | 569×438 | Product cards: Power Drill, Industrial Drill, Professional Drill |
| `products/MicroMeter.png` | 632×395 | Product cards: Measuring Tool, Digital / Precision / Steel Micrometer |
| `products/AngleGrinder.png` | 609×410 | Product cards: Angle Grinder, Heavy Duty / Industrial Grinder |
| *(placeholder)* | — | "Clamping Tool" product card: neutral placeholder image (no grinder stand-in) until the client sends a real photo |
| `certificates/Certificate-1.png` | 1962×1384 | Certifications: "Quality Certification". ⚠ Third-party logo, **placeholder until authorization** |
| `certificates/Certificate-2.png` | 1962×1384 | Certifications: "Business Certification". ⚠ Third-party logo, **placeholder until authorization** |
| `certificates/Certificate-3.png` | 1962×1384 | Certifications: "Product Certification". ⚠ Third-party logo, **placeholder until authorization** |
| `categories/` | empty | Not used. Category icons are Lucide icons. |

**Placeholders:** keep each one as its own file in the same folder (for example `products/placeholder.png`, `certificates/placeholder.png`, `hero/HeroImage-2-cropped.png`). Swapping in the real asset then only means changing the data entry.

**Missing assets (requested from the client, §8):** a square logo, a favicon, a Clamping Tool photo, a 4th certificate, and written dealer authorization for the brands on HeroImage-2 and the certificates.

---

## 8. Open items for the client

| # | Item | Current v1 assumption |
|---|---|---|
| 1 | Confirm the final category list | Cutting & Drilling, Power Tools, Measuring, Safety, Clamping |
| 2 | Written authorization as a dealer for the brands shown on HeroImage-2 and the 3 certificates | Cropped banner / placeholders; brand assets not published |
| 3 | Square logo + favicon | DesktopLogo everywhere; default favicon |
| 4 | Clamping Tool product photo | Placeholder image |
| 5 | 4th certificate | Show 3 |
| 6 | Confirm the navy bar on product cards means "Add to cart" | Built as an Add to cart button |

## 9. v1 scope summary

- **Display-only:** Login, Register, Allow Location / Select your location, Notifications, Account, the "1 Day" delivery label.
- **Functional:** search input (UI), hero carousel, Add to cart (client-side cart count), product and category links.
- **Data:** `apps/web/lib/products.ts` until PostgreSQL + Prisma.
- **Not in v1:** "For You" category, seasonal illustration, hero arrows, 4th certificate.
