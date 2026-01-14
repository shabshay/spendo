# Spendo

Spendo is a lightweight, cash-like budget tracker for daily, weekly, or monthly spending. It stores data locally but is designed so the storage layer can be swapped for an API later.

## Running locally

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test
```

## Deploy to GitHub Pages

1. In GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push to `main` (or run the workflow manually) to deploy.

**Expected URLs**
- App root: `https://shabshay.github.io/spendo/`
- Reports route: `https://shabshay.github.io/spendo/reports`

**GitHub Pages SPA routing**
- Vite sets `base` to `/spendo/` so assets resolve correctly in the subpath.
- The app uses `BrowserRouter` with `basename={import.meta.env.BASE_URL}`.
- `public/404.html` redirects unknown routes back to `/spendo/` while preserving the original path/query.
- `index.html` restores the redirected path via the History API so deep links keep clean URLs.

**Local build**
```bash
npm run build
npm run preview
```

## Architecture decisions

- **Service interface**: `IExpenseService` lives in `src/services/expenseService.ts`. The UI consumes it through `ExpenseServiceContext` so we can swap in an `ApiExpenseService` later with minimal changes.
- **Period logic**: all period math and countdown formatting lives in `src/domain/period.ts` so it stays pure and testable.
- **Money utilities**: ILS formatting and parsing lives in `src/utils/money.ts` and stores amounts in integer agorot to avoid floating point drift.
- **UI**: CSS (global + page-specific) keeps the UI clean and minimal without extra tooling.

## Animations & Accessibility

- Subtle UI motion is provided by Motion for React and centralized in `src/utils/animation.ts`.
- `prefers-reduced-motion` is respected via `MotionConfig reducedMotion=\"user\"` and short CSS fallbacks in `src/styles/global.css`.
- Modal sheets trap focus, focus the first input on open, and restore focus on close for keyboard users.

## Swapping to ApiExpenseService

1. Create `ApiExpenseService` implementing `IExpenseService` in `src/services/expenseService.ts` (or a new file).
2. Replace `new LocalStorageExpenseService()` in `ExpenseServiceProvider` with the API-backed implementation.
3. Ensure API endpoints return the same `BudgetSettings` and `Expense` shapes.

## Defaults

- `startOfWeek` is Sunday (`0`).
- Warning threshold: 80% of budget.
- Categories: Food, Transport, Shopping, Fun, Other.
