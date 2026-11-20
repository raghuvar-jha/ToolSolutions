/**
 * Google sign-in placeholder (spec 010). Disabled until OAuth is set up; then
 * it switches to Google's official sign-in button assets. No hand-drawn logo.
 */
export default function GoogleButton() {
  return (
    <button
      type="button"
      disabled
      className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-pill border border-faint/50 bg-surface text-[15px] font-semibold text-muted"
    >
      Continue with Google (coming soon)
    </button>
  );
}
