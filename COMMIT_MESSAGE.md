## Commit Message

feat: comprehensive HomeFix fixes — count-up, layout, navbar, auth, and routing

### Summary
Fixed count-up component errors, resolved module-not-found errors, optimized home page layout, refined icon hover animations, integrated authentication system, and refactored global navbar/footer layout.

### Changes

#### 1. Module Resolution Fixes
- **Fixed:** `components/home/how-it works.tsx` → `how-it-works.tsx` (removed space from filename; updated imports in `app/page.tsx` and `app/(site)/page.tsx`)
- **Fixed:** `@/components/services/services-filters` → case mismatch (`services` → `Services` to match actual directory name); fixed `components/Services/services-browser.tsx` import path
- **Fixed:** `AboutHero` export missing — `components/About/about-hero.tsx` was 0 bytes from earlier file-move artifacts; created proper component following existing glass-card/section patterns

#### 2. Home Page Layout Optimization
- **Changed:** `max-w-[1280px]` → `max-w-[1440px]` across 8 components to utilize more screen space on modern displays:
  - `components/Hero/hero.tsx`
  - `components/home/how-it-works.tsx`
  - `components/home/popular-categories.tsx`
  - `components/home/top-rated-services.tsx`
  - `components/home/why-homefix.tsx`
  - `components/home/cta-banner.tsx`
  - `components/home/testimonials.tsx`
  - `components/Navbar/navbar.tsx`
- **Result:** Home page feels wider and more balanced on 1440px+ monitors

#### 3. Icon Hover Animation Refinement
- **Changed:** Removed `group-hover:scale-110` from all sections (How It Works, Popular Services, Why HomeFix)
- **Kept:** Subtle `group-hover:-rotate-6` tilt-only animation with `motion-reduce:transition-none motion-reduce:group-hover:transform-none` for accessibility
- **Result:** Consistent, elegant, subtle tilt across all icon interactions — no shaking, bouncing, or oscillation

#### 4. Navbar & Routing Fixes
- **Fixed:** `/sign-in` → `/login` (2 occurrences: main navbar + mobile menu)
- **Fixed:** `/get-started` → `/register` (2 occurrences: main navbar + mobile menu)
- **Updated:** Navbar links now navigate to correct routes matching the auth system

#### 5. Auth System Integration
- **Added:** `lib/auth-types.ts` — `AuthResult`, `LoginValues`, `RegisterValues`, `NOT_CONNECTED`
- **Added:** `lib/validation.ts` — `required`, `email`, `password`, `FieldErrors` type
- **Added:** `components/auth/` — `form-field.tsx`, `login-form.tsx`, `register-form.tsx`, `role-picker.tsx`, `auth-submit.tsx`, `auth-error.tsx`, `auth-shell.tsx`
- **Added:** Routes `/login`, `/register`, `/admin` (redirects to `/admin/login`)

#### 6. Global Navbar & Footer Layout Refactoring
- **Refactored:** Moved `app/services/page.tsx` and `app/about/page.tsx` into `app/(site)` route group
- **Implemented:** `app/(site)/layout.tsx` — `SiteLayout` provides centralized `<Navbar />` + `<Footer />` to all pages in the `(site)` group
- **Preserved:** Auth pages (`/login`, `/register`, `/admin/login`) use `AuthShell` layout and remain completely free from Navbar and Footer
- **Result:** One centralized layout automatically shared across all regular website pages; auth pages remain independent

### Build Status
- `npx tsc --noEmit` ✅ TYPECHECK OK
- `npm run build` ✅ Prerenders successfully with all 6 routes: `/`, `/_not-found`, `/login`, `/register`, `/admin`, `/services`

### Files Modified
| Category | Files |
|----------|-------|
| Module resolution | 3 fixes (how-it-works path, services-filters case, about-hero component) |
| Layout | 8 components with max-width change + navbar/footer layout refactor |
| Navigation | 4 route path changes (+ 2 auth route refinements) |
| Animations | Icon hover refinement across 3 sections |
| Auth system | 7 new files + route additions |
| Layout structure | Moved Services/About into `(site)` group + SiteLayout centralization |