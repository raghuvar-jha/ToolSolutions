# 003 — Product Listing Section

## Objective
Implement a product listing section directly below the homepage Hero section.

## 1. Design References
- Desktop: `HeroPageLaptop.png`
- Mobile: `heroPageMobile.png`
- Read `CLAUDE.md` and `DESIGN.md` before implementation.
- Use reference images for layout guidance only.

## 2. Product Grid
- Reuse the existing product grid of HeroPageLaptop.png and HeropageMobile.png and product card components.
- Maintain the same grid columns, card design, spacing, image ratios, and styling used in Design references Image.
- Reuse the exact same Add to Cart CTA used in the existing product grid show in Image.
- Place the product section immediately below the Hero section.
- Ensure responsive layouts at 390px and 1440px.

## 3. Static Product Data
There is currently no database or API connection.

Create `lib/products.ts` containing a static TypeScript array of products.

Each product must have:
- `id`
- `name`
- `images`

Example:

```typescript
export const Products = [
  {
    id: "product-001",
    name: "Sample Product",
    images: ["/images/sample-product.png"],
  },
];
```

Use existing images from `apps/web/public/images`. Do not invent image paths.

Keep product data separate from UI components for future API and Prisma integration.

## 4. Product Navigation
- Clicking a product card navigates to `/product/<id>`.
- Use `next/link` and generate URLs dynamically.
- Do not create the `/product/[id]` route yet.
- Product URLs should temporarily return 404. This is expected.
- Add to Cart must work independently without triggering product navigation.

## 5. Technical Rules
- Next.js App Router, TypeScript, Tailwind CSS v4.
- Use `next/image` for product images.
- Reuse existing components wherever possible.
- Use centralized design tokens from `apps/web/app/globals.css`.
- Never hardcode colors in components.
- Do not implement database, API, or product detail functionality.

## 6. Acceptance Criteria
- [ ] Product section appears below Hero.
- [ ] Desktop and mobile references are followed.
- [ ] Existing grid design and column count are maintained.
- [ ] Existing Add to Cart CTA is reused.
- [ ] `Products.ts` contains static product data.
- [ ] Product cards navigate to `/product/<id>`.
- [ ] No product detail route is created.
- [ ] Add to Cart works independently.
- [ ] Responsive at 390px and 1440px.
- [ ] Run `npm run lint && npm run check-types` before completion.