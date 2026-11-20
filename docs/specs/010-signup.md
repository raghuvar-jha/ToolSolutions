# Spec: Signup page (demo)

Route: /signup
Header and footer: the site's own components, unchanged.

## Layout (from docs/design/reference/signup-layout-reference.png)
Desktop (1440px), centred card inside the shared container, about 720px wide:
- Two panels side by side:
  - Left panel (about 40%): primary-colour background (primary token), white heading "Sign up",
    a short line of white text ("Create an account to track orders, save addresses and check out faster"),
    and an illustration at the bottom.
  - Right panel (about 60%), white, with padding:
    - Heading "Create your account" and muted subtext "Enter your details to continue"
    - Form fields (see below), stacked, 16px gap
    - Submit button full width (primary style)
    - Divider with the text "or"
    - "Continue with Google" button (outline style, Google logo), disabled, with "Coming soon" text
    - Small text below: "By continuing, you agree to our Terms of Use and Privacy Policy" (links to placeholder pages)
    - Link at the bottom: "Already have an account? Log in" (links to /login, placeholder page is fine)

Mobile (390px):
- Left panel becomes a short banner at the top (about 120px tall) with the heading only.
- Right panel full width below, same order as desktop.
- No horizontal page scroll.

## Form fields
- Full name: 2 to 80 characters
- Email: valid format, required
- Password: at least 8 characters, must include one letter and one number
- Confirm password: must match Password
- Each field has a visible label (not only a placeholder).
- Password field has a show/hide toggle button with an accessible label ("Show password" / "Hide password").

## Validation and saving (demo)
- Validation uses a Zod schema in packages/shared, shared with the login page later.
- Errors appear under each field. On submit, focus moves to the first field with an error.
- Email uniqueness: before saving, compare the email with the saved accounts (case-insensitive).
  If it already exists, show "An account with this email already exists" under the email field
  and do not save.
- Saved record: id, name, email (lowercased), createdAt. The password is NOT stored.
- Storage: localStorage key "users-v1", as an array of records. Use the same storage guard as the cart
  (if localStorage is unavailable, show "Could not create account in this browser" and do not crash).
- After a successful save: show a short success message, then redirect to "/" after 1 second.
- The submit button disables while saving to prevent double submission.

## Google button
- Disabled, with the text "Continue with Google (coming soon)".
- Uses Google's official sign-in button assets once OAuth is set up. Do not draw a Google logo by hand.

## Image
- Use the illustration at public/images/auth/signup-illustration.svg if the client supplies one.
- Until then, use an original simple SVG of tools (drill and wrench shapes in the brand colours).
- Do not use the Flipkart illustration or any third-party artwork.
- Alt text: "Tools illustration" (decorative images use alt="" and aria-hidden).

## Visual
- Follow DESIGN.md and the globals.css tokens for all colours, radius, spacing and fonts.
- Form inputs use the one input style from DESIGN.md: border token, focus ring in primary,
  error text in the error token.
- Do not copy Flipkart's yellow button, logo, footer text or illustration.
- No hex colours.

## Done when
- [ ] Desktop (1440px) matches the reference layout: two panels, form on the right
- [ ] Mobile (390px): banner on top, form below, no horizontal scroll
- [ ] Each validation rule shows the right error message
- [ ] Mismatched passwords show an error
- [ ] Duplicate email (different capitals) is rejected
- [ ] Valid signup saves the record without the password, then redirects to /
- [ ] Password is not present in localStorage (check in DevTools → Application)
- [ ] Google button is disabled with "coming soon"
- [ ] Header and footer are the site's own
- [ ] No hex colours, no Flipkart logo, text or artwork, no console errors
- [ ] npm run lint and npm run check-types pass