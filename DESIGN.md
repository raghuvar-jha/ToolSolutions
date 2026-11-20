# DESIGN.md — Tools Solutions storefront

Source of truth for UI work. Read this before creating or changing any component.

## 0. Reference files

| File | What it is | How to use it |
|---|---|---|
| `docs/design/reference/HomePageLaptop.png` (2336×6082, 2× → **1168px** CSS viewport) | **Our own homepage mock (Tools Solutions), desktop** | Primary reference. Match it. |
| `docs/design/reference/HomePageMobile.png` (750×7552, 2× → **375px** CSS viewport) | **Our own homepage mock, mobile** | Primary reference for mobile. |
| `docs/design/reference/Navbar.png` (2004×246, 2×) | Third-party desktop header | **Layout reference** for both header rows (§5 Header). Match the structure and proportions. |
| `docs/design/reference/Footer.png` (2070×1188, 2×) | Third-party footer | **Layout reference** for the footer: newsletter strip, brand column + 3 link columns, trust row, bottom row (§5 Footer). |
| `docs/design/reference/ProductsPage.png` (812×1278, 1×, cropped on the right) | Third-party product grid | **Layout reference** for category / product list pages (§5 Product list page). |
| `docs/design/reference/ProductInfo.png` (2004×1358, 2×) | Third-party product detail page | **Layout reference** for the PDP: gallery left, details right (§5 Product detail page). |
| `docs/design/reference/CartCheckout.png` (2070×1250, 2×) | Third-party checkout | **Layout reference** for checkout: two columns, order summary right (§5 Checkout). |
| `docs/design/reference/Cart.png` | Third-party cart page | Layout reference for the cart (line items left, sticky summary right). |

**Rules for the third-party references:** copy the **layout only** (structure, proportions, spacing, order of elements). Never copy their logos, brand names, illustrations, colors or payment/partner badges (e.g. "Brandname", parcelmonkey, Trustpilot, Klarna, tabby, Visa / Mastercard / PayPal / Apple Pay / Google Pay, Bob's Red Mill). Everything is rebuilt with our `@theme` tokens (§4) and Lucide icons. Features they show that we don't have in v1 are listed in §9.

All measurements below are in CSS px, converted from the 2× mocks and rounded to the nearest Tailwind step. For the third-party references, "mock" values are the screenshot ÷ 2 (÷ 1 for ProductsPage); "target" values are what we build inside our `max-w-site` container.
Our own homepage mock uses Tailwind's default palette (blue / gray / green / yellow), so most values map 1:1 to Tailwind colors.

---

## 1. Page structure (top to bottom)

### Desktop
1. **Header bar** (layout per `Navbar.png`): gradient navy → blue. Logo · location pill · search · Saved · Account · Cart.
2. **Category nav bar** (layout per `Navbar.png`): white. "All Tools" menu button · divider · the category list (§5) · "More ▾" · "Today's Deals" (right).
3. **Hero**: a rotating main banner on the left (~66%) and two stacked banners on the right (~34%).
4. **Trust strip**: 4 items (Fast Delivery · Genuine Products · Expert Assistance · Bulk Orders).
5. **Popular Products**: light-blue panel, 4 product cards in one row.
6. **Featured Products**: white bordered panel with "View All", 5-column grid (12 items in the mock).
7. **Our Certifications**: full-width light-gray band, 4 certificate cards.
8. **Customer Reviews**: light-blue panel, overall rating, horizontally scrolling review cards.
9. **Footer** (layout per `Footer.png`): newsletter strip · brand column + 3 link columns · trust row · bottom row with copyright.
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
  | Footer main | 1 col | 2 cols (brand spans 2) | `grid-cols-[1.7fr_1fr_1fr_1fr]` (brand + 3 link cols) |
  | Footer trust row | 2×2 grid | 4 cols | 4 cols |
  | Product list page | 2 cols | 3 cols | 4 cols |
  | Product detail page | stacked | stacked | `grid-cols-[52fr_48fr]`, gap 64px |
  | Checkout | stacked (summary below) | stacked | `grid-cols-[54fr_46fr]`, gap 24px |
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
| `#1c398e` | blue-900 | Header middle, "All Tools" menu text, footer dividers |
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
| `#eff6ff` | blue-50 | Reviews panel, trust icon circles, footer newsletter strip, PDP "Add to cart" button, checkout info banner |
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

### Header (desktop, `lg+`), layout per `Navbar.png`
Mock: bar 960px wide, row 1 ≈54px, row 2 ≈32px, content inset ≈88px each side. Target values below are scaled to our container.

**Row 1: main bar**
- Height **72px**. Horizontal gradient `brand-950 → brand-900 → brand-500` (our colors; the mock's solid bright blue is not used).
- One flex row, items vertically centered, gap 16px, in this order:
  1. **Logo**: `logo/DesktopLogo.png`, ~32px tall (white text, dark background only).
  2. **Location pill**: ~150×44px, radius 8px, `bg-white/10` on the gradient, `MapPin` + "Select location" (16/500 white, truncated with ellipsis). **Display-only in v1.**
  3. **Search**: `flex-1`, max ~560px, 44px tall, white, radius 8px. Placeholder "Search by tool, brand, size or model..." (16px `faint`). Search button is a 44×36px `well` square **inside** the right end (radius 6px, `brand-900` `Search` icon). The "All Tools ▾" select from v0 is dropped; the category menu lives in row 2.
  4. **Right cluster** (gap 24px), three items, each = 24px white Lucide icon + a 2-line label: caption 12/400 `brand-200` over value 16/500 white.
     - `Heart` "Saved" / "0 items" (**display-only in v1**)
     - `User` "Account" / "Sign in" (**display-only in v1**, replaces Login + Register)
     - `ShoppingCart` "My cart" / "{n} items" (live cart count)

**Row 2: category nav**
- White, height **44px**, bottom border `line`, shadow-sm.
- Left: **"All Tools" menu button**: `Menu` icon + "All Tools" + `ChevronDown` (16/500 `text`). Opens the category list. Then a 1px × 24px `line` vertical divider.
- Category links (§5 Category strip), 16/500 `text`, gap 32px, hover `brand-700`.
- "More" + `ChevronDown` for overflow categories.
- Far right: `Zap` "Today's Deals" in `brand-700` (16/600). (Not in the reference; kept from our own mock.)

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

### Footer, layout per `Footer.png`
Mock: 1035px wide; newsletter band ≈108px; main area ≈265px; trust band ≈80px between two dividers; bottom row ≈27px controls. Content spans x ≈75→953 (mock px). Four bands, top to bottom:

**1. Newsletter strip**
- Full width, `brand-50` background, padding 32px vertical. A 4px `brand-950` top border (the mock has a dark top line).
- Two columns on `lg` (`justify-between`, items centered), stacked on mobile:
  - Left: heading "Get tool deals & new arrivals" (22/700 `brand-950`) + 2-line text (16/400 `body`), max ~380px wide.
  - Right: one joined form, ~360×48px (mock 353×48), white, 1px `line` border, radius 8px: `Mail` icon (`muted`) + email input (placeholder "email@address.com", `faint`) + **Sign up** button attached at the right end (~120px wide, full height, `bg-brand-950` white text, `Send` icon, radius 6px).
- **Display-only in v1** (no submit backend; see §9).

**2. Main area** (`bg-brand-950`, padding 48px top, 40px bottom)
- Grid `lg:grid-cols-[1.7fr_1fr_1fr_1fr]` (mock: brand column ≈37%, three link columns ≈22% each).
- **Brand column**: `DesktopLogo.png` (~40px tall), then 32px gap, then the **Address** block (`footer-icon` `MapPin` + uppercase address 15/400 `brand-200`). The mock's Trustpilot rating block is replaced by our own "★ 4.8 · Customer rating" (`star` icon, 16/600 white, sub 14px `brand-300`); no third-party rating logos.
- **Link columns**: heading 16/600 white, then 24px gap, links 15/400 `brand-200`, line pitch ~22px (`space-y-3`), hover white.
  1. **Company**: About Us, Reviews, Privacy Policy, Terms & Conditions, Sitemap
  2. **Shop**: the category list (§5 Category strip) + Today's Deals
  3. **Contact Us**: `Phone` and `Mail` rows (`footer-icon`), Support / Help, Bulk Orders
- Mobile: brand column first, then the link columns stacked (Company and Shop side by side as a 2-col grid). Contact rows get a right `ChevronRight` (full-row tap targets).

**3. Trust row**
- 1px `brand-900` divider above and below, ~80px tall (padding 24px vertical).
- 4 equal columns (2×2 on mobile), each: 32px `footer-icon` Lucide icon + a 2-line uppercase label, line 1 14/400 `brand-200`, line 2 14/700 white. Content = our trust items: `Truck` "Fast / 1-day delivery" · `ShieldCheck` "Genuine / products" · `PhoneCall` "Expert / assistance" · `Package` "Bulk / orders".

**4. Bottom row** (padding 24px vertical, `justify-between`, stacked and centered on mobile)
- Left: "© 2026 Tools Solutions. All rights reserved." 14px `brand-300`. (The mock's country selector is not in v1.)
- Right: accepted payment methods as **plain text chips** (`Wallet` / `CreditCard` / `Banknote` icon + "UPI", "Cards", "Cash on delivery"), 13px `brand-200`, 1px `brand-900` border, radius 6px. **No payment brand logos.**

### Floating help button
- Fixed bottom-right (desktop ~24px inset; mobile sits above the tab bar). A white chip with shadow, "Need help? **Message us!**" (`chat` green), followed by a 48px `bg-chat` circle holding a white **Lucide `MessageCircle`** icon.
- **No WhatsApp logo** (third-party brand asset). The link target (WhatsApp deep link, phone or contact page) is decided when building.

### Product list page, layout per `ProductsPage.png`
Used for `/products` and each category page. Mock (1×): cards ≈230px wide, 20px gap, ≈384px row pitch; image area ≈240px; button ≈214×30. The screenshot is cropped on the right and a 4th column is visible, so desktop is 4 columns.
- **Title**: page/category name, 32px/600 `text` (mock ≈36px), 16px below.
- **Filter chips**: one horizontal row, `overflow-x-auto snap-x`, no wrap, gap 8px. Chip = 32px tall, px-3, radius 6px, 1px `line` border, 14/400 `body`. Active chip ("All Tools" by default) = `bg-brand-950` white text. Chips = "All Tools" + the category list.
- **Grid**: 24px below the chips. 2 / 3 / 4 columns (mobile / md / lg), gap 20px (12px on mobile).
- **List card** (a variant of the shared product card, same data from `lib/products.ts`):
  - `well` background, radius 12px, padding 8px, no border.
  - Image area ~240px tall (`aspect-square` on mobile), `object-contain`.
  - Badge top-left: our green "1 DAY" badge (§5 Product card). The mock's black "Sale" badge is used only when `mrp > price`, as a `brand-950` pill with white 12/600 "Sale".
  - Name 15/500 `text` (1 line, truncate), then price row: price 14/700 `brand-950` + MRP 13px `faint` line-through.
  - **"View Product" button**: full card width (inside the padding), 32px tall, white bg, radius 6px, 14/500 `text`.
  - **Hover / focus**: the card lifts (`-translate-y-1`, `shadow-md`, white bg) and the button fills `bg-brand-950` with white text (the mock uses orange; we use our brand color). Respect `prefers-reduced-motion` (no translate).
  - Whole card links to the PDP; the button is the visible affordance.

### Product detail page (PDP), layout per `ProductInfo.png`
Mock: 1002px wide; gallery 420×420 (radius ≈20px), 5 thumbnails ≈75px with ≈11px gap; column gap ≈71px; info column ≈394px; buy buttons ≈144×34 each.
- **Breadcrumb heading** at the top: "All Tools / {Category}" as links, then the product name in the title. 28px/700 `text` on desktop, 20px on mobile, 24px below.
- **Two columns** on `lg`: `grid-cols-[52fr_48fr]`, gap 64px. Stacked on mobile (gallery first).
- **Gallery (left)**
  - Main image: square, `well` bg, `rounded-banner` (16px), `object-contain` with 32px padding.
  - "1 Day Delivery" tab pinned top-left: `bg-brand-950`, white 16/500, `Truck` icon, radius `0 0 12px 0` with the card's top-left radius (matches the mock's tab shape).
  - Thumbnails: one row of 5 under the image, 16px gap above, equal widths (`grid-cols-5`, gap 12px), `well` bg, radius 8px; active thumb gets a 2px `brand-700` ring. Horizontal scroll on mobile.
- **Info (right)**, top to bottom, 16px rhythm unless noted:
  1. Brand / maker line, 16/400 `muted`.
  2. Product name, 32px/600 `text` (mock ≈26px), max 2 lines (24px mobile).
  3. Rating row: `Star` (`star`) + "4.5 Rating" 16/500 + "(15 reviews)" underlined `muted` link.
  4. **Price**: `₹1,299` at 32/800 `brand-950`, with the paise as a smaller superscript (14px, `align-super`), followed by MRP 16px `faint` line-through and a "{n}% off" `success` label.
  5. 1px `line` divider (24px margin).
  6. **Buy buttons**: two equal buttons side by side (`grid-cols-2`, gap 16px), 48px tall, `rounded-pill`. "Add to cart" = `bg-brand-50` `brand-950` text with `ShoppingCart` icon; "Buy now" = `bg-brand-950` white text. Full width on mobile, and on mobile they also appear in a **sticky bottom bar** above the tab bar.
  7. Link row: `Heart` "Add to wishlist" (underlined, 15/500 uppercase) · 1px vertical divider · `Share2` "Share". Wishlist is **display-only in v1**.
  8. Spec block (24px above): "SKU: TS-1234" 16/500 `text`; "Category:" + category link(s) 16px `muted`, underlined.
  9. Description, 15/400 `body`, leading-relaxed, max ~2–4 lines with "Read more" if longer.
  10. **Feature box**: 1px `line` border, radius 12px, padding 20px, two columns with a 1px vertical divider (stacked on mobile). Each: 32px `brand-700` Lucide icon + title 16/600 `text` + sub 15/400 `muted`. Content: `Truck` "1-day delivery" / "On in-stock items" · `ShieldCheck` "Genuine products" / "Sourced from authorized dealers".
- Mock elements **dropped in v1**: countdown timer, pay-in-parts (Klarna) box, "Compare with other vendor", diet/badge icon row, "100 sold in last 35 hours".

### Checkout, layout per `CartCheckout.png`
Mock: 1035px wide; left column ≈442px, right ≈372px, gap ≈17px; card radius ≈15px; promo input ≈330×36; pill buttons ≈36–40px tall.
- Page background `well`. Two columns on `lg`: `grid-cols-[54fr_46fr]`, gap 24px. Right column is `sticky top-6`. Stacked on mobile with the summary **below** the items and the "Place order" button also in a sticky bottom bar.
- All cards: white, `rounded-banner` (16px), padding 24px (16px mobile). Card title 24px/700 `text` (20px mobile), followed by a 1px `line` divider (16px margin). Cards stack with 24px gap.
- **Left column**
  1. **Delivery information** card: title + `Pencil` "Edit" link (`brand-700`, 15/500) on the right. Row: 64px `well` square (radius 12px) with a `MapPin` icon in a `brand-950` circle (no map image) + "Deliver to" 16/600 `text`, then phone and address lines 15/400 `muted`.
  2. **Review items** card: title "Review items". One line item per product (no per-store grouping in v1):
     - Item box: `well` bg, radius 12px, padding 16px. Image 64×80 `object-contain` · name 16/600 `text` · variant / size 14px `muted` · price 20/800 `brand-950` (superscript paise).
     - **Quantity stepper** right-aligned: `Minus` / qty / `Plus`, buttons 32px round, 1.5px `brand-950` border, qty 18/600. Hit targets ≥ 44px.
     - Below the box contents, a 1px `line` divider and a `Trash2` "Remove" row (15px `muted`, `ChevronRight` at the end), replacing the mock's "Replace with" row.
- **Right column: Order summary** card
  1. Title "Order summary".
  2. **Payment method**: radio list, 16/500, 20px radios (`accent-brand-950`), unselected rows `muted`. Options: "Online payment (UPI / Cards)", "Cash on delivery". Divider below.
  3. **Promo code**: one `rounded-pill` field, 44px tall, `well` bg, placeholder "Add promo code"; "Apply" button inside the right end (`bg-brand-950` white, `rounded-pill`, px-6). Divider below.
  4. **Price rows**: Subtotal · Delivery fee · Coupon discount (`success`, negative) · Taxes (GST). Label 16/400 `muted` left, value 16/500 `text` right, 12px row gap. Divider, then **Total** 20/700 `text` both sides.
  5. **Primary button** "Place order": full width, 52px tall, `rounded-pill`, `bg-brand-950` white 16/600. (The mock's outlined "Continue with Klarna" button is dropped.)
- **Info banner** under the summary card: `brand-50` bg, radius 16px, padding 20px, `BadgePercent` icon (32px `brand-700`) + "Bulk order? Get special pricing" (16/600) + "Contact us" underlined link. (Replaces the mock's tabby cashback banner.)
- **v1:** checkout UI only; no real payment. "Place order" goes to a confirmation page (client-side, no backend).

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
- Footer: newsletter strip stacks (text above form, form full width); main area stacks (brand column, then Company + Shop as a 2-column grid, then Contact Us); trust row becomes 2×2; bottom row stacks and centers. Contact rows get a right `ChevronRight` (full-row tap targets).
- Product list: 2 columns, chips scroll sideways. PDP: gallery first, then info, with a sticky Add to cart / Buy now bar above the tab bar. Checkout: one column, summary after the items, sticky "Place order" bar.
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
| 7 | Header: "Saved" (wishlist) and "Account / Sign in" replace Login + Register | Display-only; no wishlist or auth in v1 |
| 8 | Newsletter signup in the footer | Display-only form, no backend |
| 9 | Accepted payment methods and whether to show brand logos | Text chips (UPI, Cards, Cash on delivery), no logos |
| 10 | Real customer rating to show in the footer | 4.8 (same as the reviews panel) |
| 11 | Checkout payment options and delivery fee / GST rules | Online payment + Cash on delivery; UI only, no real payment |

## 9. v1 scope summary

- **Display-only:** Account / Sign in, Saved (wishlist), Select location, Notifications, the "1 Day" delivery label, footer newsletter form, PDP "Add to wishlist".
- **Functional:** search input (UI), hero carousel, Add to cart (client-side cart count), product and category links, product list filter chips, PDP thumbnails, checkout quantity stepper / remove / totals (client-side).
- **Data:** `apps/web/lib/products.ts` until PostgreSQL + Prisma.
- **Not in v1:** "For You" category, seasonal illustration, hero arrows, 4th certificate, footer country selector, payment brand logos, third-party rating widgets, PDP countdown / pay-in-parts / vendor compare / "sold in last N hours", checkout per-store grouping / "Replace with" / pay-later button, real payment.
