# [Teleshop](https://test.ir)

A fast Telegram Mini App built with Vite + React. The app runs inside Telegram (via Web Apps) and lets users buy Telegram-specific digital items (Stars, Premium, etc.), manage orders, and receive real-time price updates.

---
## Lighthouse / Performance report

<img src="https://i.ibb.co/Pzw2Kk6P/Screenshot-257.png" alt="Lighthouse Report" />

---

## Status

Production-ready frontend for the mini app. Components and pages are implemented with emphasis on performance, animations, and a Persian (Farsi) UX.

---

## What this app does

* Runs as a Telegram Web App (opens from a Telegram bot/link).
* Lets users buy Telegram items and subscriptions from inside Telegram.
* Secure, automatic authentication integrated with Telegram auth (no manual user entry).
* Real-time product price updates via WebSocket.
* Admin panel for managing orders with filters and fast searching.
* Order list for users with infinite scroll and high-performance rendering.
* In-app payments via a backend ZarinPal integration (handled by API).
* Rich UI animations and page transitions built with Framer Motion.

---

## Important dependencies

* `react`
* `tailwindcss`
* `axios` — HTTP client
* `telegram-webapps` — Telegram Web Apps SDK
* `framer-motion` — animations & page transitions
* `lucide-react` — icons
* `date-fns` and `date-fns-jalali` — date utilities (Gregorian + Jalali)
* `sonner` — toast/notifications
* `@sentry/react` — error reporting (optional production monitoring)

Dev / tooling:

* TypeScript
* ESLint (`@eslint/js`) and hooks rules
* Tailwind CLI / PostCSS

---

## Architecture & notable implementation details

* **Authentication**: tight Telegram auth integration — the frontend relies on Telegram-provided auth and the app uses a refresh / access token flow. Token refresh is handled automatically with Axios interceptors.

* **Admin & User flows**: separate sections for admin (order management + filters) and users (order status, order history). Admin lists include powerful filters and pagination.

* **Infinite scroll & performance**: order lists and product lists use infinite scroll; rendering is optimized (virtualization or windowing recommended for very long lists). Heavy use of `useMemo` / `useCallback` where appropriate to avoid unnecessary re-renders.

* **Realtime**: product price and stock updates are delivered via WebSocket channels so UIs stay in sync without polling.

* **Animations**: Framer Motion drives component animations and page transitions; animation-friendly components are used throughout.

* **Payments**: payments are handled through backend APIs (ZarinPal). The frontend triggers the payment flow and handles post-payment callbacks from the backend.

* **i18n & RTL**: Designed primarily for Persian (Farsi) users — layout respects RTL where needed.

---

## Run locally

```bash
npm install
npm run dev        # start development server (Vite)
npm build      # production build
npm preview    # preview production build
```
