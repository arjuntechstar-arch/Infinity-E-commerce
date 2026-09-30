# VoltMart

An installable single-store commerce application with a React storefront and an administrator dashboard. Requires **Node.js 24 LTS**. USD is the default; a buyer can configure currency before taking orders.

## Quick start

1. Install Node 24, then run `npm ci`.
2. Copy `.env.example` to `.env`. Set `APP_URL` for your origin.
3. Run `npm run build`.
4. Temporarily set `ADMIN_EMAIL`, `ADMIN_NAME`, and a strong `ADMIN_PASSWORD` in `.env`.
5. Run `npm run admin:create`, then remove `ADMIN_PASSWORD` from `.env`.
6. Run `npm start`. Open `http://localhost:3000` and `/admin`.
7. Configure the store, publish your products, and complete provider sandbox validation before going live.

Full English installation, provider, administrator, customer, customization, backup, and troubleshooting documentation: **[documentation/index.html](documentation/index.html)**, also served publicly at `/documentation/`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Full type check and client/server/CLI builds |
| `npm start` | Production assets and API |
| `npm run admin:create` | Create administrator from temporary environment credentials |
| `npm test` | API, security, persistence, financial, and workflow tests |
| `npm run test:e2e` | Chromium browser journeys; first run `npx playwright install chromium` |
| `npm run backup` | Consistent SQLite snapshot |
| `npm run maintenance` | Expire unused reservations and remove expired session/reset/rate-limit data |

## Operating scope

- Single Node instance, local SQLite database with WAL. Use a persistent disk, not ephemeral/serverless filesystems or a shared network filesystem. Do not scale to multiple containers against the same database.
- One configured currency and domestic delivery country per store; eight supported currencies use two decimal places. Flat tax and shipping rates are configured by the buyer.
- Real Stripe Checkout/refunds/Identity/recurring savings, Twilio Verify, Shippo rates/labels, and SMTP password recovery require the buyer's provider accounts and credentials. No production mock provider or default admin password is included.
- Savings plans require the buyer's business and provider approval. Stripe Identity verifies identity; it does not provide credit-bureau scoring or promise financing eligibility. Eligible payment methods are configured in Stripe; no unconditional 0% financing is claimed.
- Personal trade-in vouchers follow staff valuation, customer acceptance, and staff receipt of goods. Support is a real staff inbox, not simulated AI chat.
- Store warranties and PDFs are records of configured store coverage, not invented manufacturer approvals.
- Installation begins with an empty catalog. Add your own licensed imagery and product information.

## Release status

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md). Automated tests are distinct from provider-account sandbox verification. Envato account/category eligibility, asset rights, content-policy compliance and final marketplace approval remain external checks.
