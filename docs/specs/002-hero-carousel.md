# Spec: Hero carousel

## Visual
Follow DESIGN.md section "Hero" and docs/design/reference/HomePageLaptop.png and HomePageMobile.png.

## Behavior
- Shows HeroImage-1, HeroImage-2, HeroImage-3 from public/images/hero, in order
- use same on desktop view as same used in HeroPageLaptop.png
- for mobile use same as used in HeroPageMobile.png where festivel banner used, use there blank box with same dimension
- for mobile use more demo blank divs which can slide and have dot's to swipe
- loop in 5 seconds in mobile version only
- desktop version don't have slide option only static image used in HeropageLaptop.png


## Done when
- [ ] Auto-advance works and pauses on hover
- [ ] Dots and arrows change the slide
- [ ] Swipe works on a 390px viewport (DevTools touch mode)
- [ ] Loops correctly
- [ ] No console errors, no hardcoded hex colors
- [ ] npm run lint and npm run check-types pass