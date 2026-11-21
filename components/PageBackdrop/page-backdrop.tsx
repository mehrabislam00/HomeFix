/**
 * Soft sage light-pools behind the page. They give the liquid-glass navbar
 * something to refract as you scroll. Pure palette colors, no gradients.
 */
export function PageBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] overflow-hidden"
    >
      <div className="absolute -left-28 top-28 size-[440px] rounded-full bg-sage/20 blur-3xl" />
      <div className="absolute -right-24 top-6 size-[480px] rounded-full bg-muted-sage/20 blur-3xl" />
      <div className="absolute left-[38%] top-[440px] size-[380px] rounded-full bg-pale-sage blur-3xl" />
    </div>
  );
}