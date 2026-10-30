# My Finance — Personal PWA v1

A private, local-first personal finance web app prototype designed for iPhone Safari, Android browsers and desktop.

## What is included
- Professional mobile-first interface with gradients, translucent navigation, and page transitions
- Home dashboard
- Cards (starter records: SBM Zet and Kotak SuperMoney)
- Transaction entry
- Bills and EMI entry
- Credit overview with previously shared scores clearly labelled as last-known, not live
- Shopping categories and future recommendation placeholder
- Savings goals
- Local browser storage and JSON export
- PWA manifest and service worker for Add to Home Screen / offline shell

## Run locally
Open `index.html` in a browser for a basic preview. For PWA install/offline support, serve over HTTPS or localhost.

## Free hosting option
Use a free static host such as GitHub Pages:
1. Create a GitHub repository for this project.
2. Upload the contents of this folder (not the ZIP itself).
3. In repository Settings → Pages, choose Deploy from a branch and select the main branch / root.
4. Open the HTTPS Pages URL in Safari on iPhone.
5. Safari Share → Add to Home Screen.

Hosting provider terms can change. This version uses no paid APIs, backend or subscriptions.

## Data and privacy
- Records are stored in localStorage in the browser on the device.
- Data does not automatically sync between iPhone and Android.
- Clearing browser website data may delete records. Use Settings → Export regularly.
- Do not store card CVV, PIN, OTP, banking passwords or full card numbers.
- No bank, bureau, insurance or merchant API integrations are included.
- No live offer data or guaranteed cashback calculation is included.

## Architecture
- `index.html`: app shell and page structure
- `css/styles.css`: design system and responsive styles
- `js/app.js`: state, local persistence, and feature modules
- `manifest.webmanifest`: install metadata
- `sw.js`: offline app shell

Add future features as separate modules (e.g. `js/rewards.js`, `js/credit.js`, `js/insurance.js`) and corresponding page components. Keep financial calculations deterministic and source-verifiable.
