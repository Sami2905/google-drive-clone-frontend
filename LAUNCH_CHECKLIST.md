# 🚀 Final Launch Checklist (Frontend)

Use this file as a flight checklist. Complete each phase top-to-bottom before deploying.
Tick boxes with [x] as you go.

## PHASE 1 – Prepare & Merge Final UI Tweaks
- [ ] Sticky header on dashboard/search (keeps search/actions visible)
- [ ] Grid/List toggle with localStorage preference
- [ ] Hover/focus states on all interactive elements (e.g., `hover:bg-gray-100`, `focus:ring`)
- [ ] Smooth transitions (`transition`, `duration-150`) on buttons/cards/menus
- [ ] 3‑dot "More" action menu for files/folders (Share, Rename, Move to Trash, Versions)
- [ ] Tooltips for truncated names via `title={name}`
- [ ] Empty states for: folders, search results, trash
- [ ] Thumbnails for images/PDFs where possible; file-type colored badges
- [ ] Consistent Tailwind spacing scale (`p-4`, `gap-4`) across pages
- [ ] Remove unused imports, dead code, and all `console.log()` calls
- [ ] Brand colors and typography consistent across components

## PHASE 2 – Local Functional QA
- [ ] Email/password login works; Google OAuth redirect returns to app
- [ ] Upload → Rename → Share → Search → Move to Trash → Restore → Permanent delete (full flow)
- [ ] Public link enable/disable; open in incognito works/blocks correctly
- [ ] Invite user by email; change role (viewer/editor); remove access
- [ ] Breadcrumb navigation; folder drill‑down and back navigation
- [ ] Error handling: invalid upload shows toast; unauthorized routes redirect to login
- [ ] Empty search returns proper empty state

## PHASE 3 – Accessibility & Responsiveness
- [ ] All buttons/icons have accessible text or `aria-label`
- [ ] Tab order is logical; Enter/Space activate; Esc closes modals
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Mobile (320–375px): sidebar collapses; single‑column list; tap targets ≥ 44px
- [ ] Tablet (768px): 2‑column grid; sidebar toggle works
- [ ] Desktop (≥1024px): full layout; no layout shifts

## PHASE 4 – Performance & Optimizations
- [ ] Build and run production locally
  - `npm run build && npm run start`
- [ ] Lighthouse (desktop) scores ≥ 90 for Performance, Accessibility, Best Practices
- [ ] Preview images use `next/image`; external domains added to `next.config.js` if needed
- [ ] List rendering optimized (memoize where helpful); avoid unnecessary re-renders
- [ ] Remove large/unused dependencies; no heavy client bundles
- [ ] No extraneous network calls (debounce search; pagination/lazy load verified)

## PHASE 5 – Deployment
- [ ] Vercel project created or linked
- [ ] Environment variables set in Vercel
  - `NEXT_PUBLIC_API_URL=https://your-production-backend.com/api`
- [ ] (If using external images) Update `images.domains` in `next.config.js`
- [ ] Commit clean state
  - `git add .`
  - `git commit -m "Final UI polish + launch"`
  - `git push origin main`
- [ ] Deploy to production (Vercel dashboard or CLI `vercel --prod`)

## PHASE 6 – Post‑Deployment Sanity Test (Production)
- [ ] Repeat core flows on live URL (login → upload → share → search → trash)
- [ ] Search + sort return correct results with acceptable latency
- [ ] All modals open/close smoothly; no state leaks on close
- [ ] Thumbnails and previews load; public links work as expected
- [ ] Cross‑browser: Chrome, Firefox, Safari (desktop)
- [ ] Mobile devices: iPhone Safari, Android Chrome
- [ ] Responsive grid/list behaves correctly across breakpoints
- [ ] Security: no secrets in bundle (view‑source); public links enforced; inputs/size/type validated

## Notes & Metrics
- Target TTI (first interactive) under ~3s on desktop broadband
- Error toast copy is concise and actionable
- Confirm only one lockfile is present (npm or pnpm) in the project

---

When all boxes are checked, announce the MVP is live and invite testers.


