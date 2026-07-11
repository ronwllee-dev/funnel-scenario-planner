# Test Plan - Funnel Scenario Planner

## Automated

- Formula regression tests for PRD spot-check calculations.
- Percentage normalization tests, including CTR-based projected impressions.
- Bottleneck detection tests with configurable Core CTA labels.
- Auth route tests for signup, login, logout, forgot password, reset password, callback, and SSR cookie setup.
- Ownership tests for protected pages, authenticated API routes, and server-owned `user_id` assignment.
- RLS migration tests for owner-only private scenario policies and demo read policy.
- Responsive layout tests for desktop sidebar, mobile drawer, active nav state, logout, no horizontal overflow, and touch-friendly controls.

## Manual

- Signup, login, logout, forgot password, and reset password work with Supabase Auth.
- User A can save, reload, rename, and delete their own scenario.
- User B cannot open, rename, or delete User A scenarios.
- Demo scenarios remain available to logged-in users.
- Desktop sidebar shows active state and logout.
- Mobile hamburger opens and closes the drawer; Escape closes it.
- Homepage loads at `/` after login.
- CTR input affects projected impressions immediately.
- Currency label changes display only.
- Core CTA Action label changes table labels and bottleneck copy.
- Save scenario creates a reloadable owner-only URL.
- Disclaimer remains visible and states that outputs are planning assumptions, not guarantees.
