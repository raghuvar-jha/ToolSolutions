## Header Specifications

### General Behavior

- The header must be responsive and mobile-first.
- Reuse existing components and design tokens wherever possible.
- Follow `DESIGN.md` and use colors, spacing, typography, and radius tokens from `apps/web/app/globals.css`.
- Never hardcode colors in header components.
- Keep the header reusable and separate its major sections into small components where appropriate.

### Header Elements & Navigation

1. **Logo**
   - Display the website logo.
   - Clicking the logo navigates to `/`.

2. **Search Bar**
   - Accept text input from users.
   - Submitting the search navigates to `/search?q=<encoded-query>`.
   - Use URL encoding for the search query.
   - Pressing `Enter` must submit the search.
   - A functional search backend is not required yet.

3. **Category Navigation**
   - Display category links in a horizontal navigation strip.
   - Each category must navigate to `/category/<slug>`.
   - Use lowercase, URL-friendly slugs.
   - Category navigation must work consistently on desktop and mobile.

4. **Authentication**
   - Login link navigates to `/login`.
   - Register link navigates to `/register`.
   - These pages do not exist yet. Their temporary 404 responses are expected.

5. **Shopping Cart**
   - Display a cart icon using Lucide.
   - Clicking the cart icon navigates to `/cart`.
   - Display a cart item count badge.
   - Hardcode the initial cart count to `0` until cart functionality is implemented.
   - Do not introduce unnecessary cart state or database logic at this stage.

6. **Location & Delivery Information**
   - Display the location and delivery information in the header.
   - These elements are display-only for now.
   - Do not implement location detection, geolocation, or delivery APIs.

### Responsive Behavior

**Desktop (1440px)**

- Display the complete header layout.
- Keep logo, search, location/delivery information, authentication links, and cart accessible.
- Display categories in a horizontal navigation strip.
- Maintain appropriate spacing and alignment.

**Mobile (390px)**

- Adapt the header layout to the available screen width.
- The category navigation strip must scroll horizontally.
- Prevent category links from wrapping into multiple rows.
- Allow users to swipe horizontally through categories.
- Tapping any category must navigate to the same `/category/<slug>` URL used on desktop.
- Ensure the search bar and essential navigation remain accessible without horizontal page overflow.

### Accessibility & Keyboard Navigation

- All navigation links must be reachable using `Tab`.
- The search input must be keyboard accessible.
- Pressing `Enter` inside the search input must submit the search.
- Use semantic HTML elements such as `header`, `nav`, `form`, `input`, and `a`.
- Provide accessible labels for icon-only buttons or links, including the cart.
- Ensure visible focus states using existing design tokens.
- Maintain sufficient color contrast.
- Do not use clickable `div` elements instead of semantic links or buttons.

### Implementation Constraints

- Use Next.js App Router navigation conventions.
- Use `next/link` for internal navigation.
- Use `next/image` for image-based logos when applicable.
- Use Lucide icons for interface icons.
- Keep category data separate from presentation components where appropriate.
- Do not implement backend search, authentication, cart persistence, or location detection yet.
- Do not create placeholder pages just to prevent the expected 404 responses.

### Acceptance Criteria

- [ ] Logo navigates to `/`.
- [ ] Search submits to `/search?q=<encoded-query>`.
- [ ] Search works using `Enter`.
- [ ] All category links navigate to `/category/<slug>`.
- [ ] Login navigates to `/login`.
- [ ] Register navigates to `/register`.
- [ ] Cart navigates to `/cart`.
- [ ] Cart count initially displays `0`.
- [ ] Location and delivery information are display-only.
- [ ] Mobile category navigation scrolls horizontally.
- [ ] No horizontal page overflow at 390px.
- [ ] Desktop layout works at 1440px.
- [ ] All links and search input are keyboard accessible.
- [ ] Focus states and accessible labels are implemented.
- [ ] Existing design tokens are used throughout.