# Envato CodeCanyon listing draft

## Title

VoltMart – Electronics Storefront and Admin Dashboard (Node.js)

## Short description

A self-hosted electronics ecommerce application with a customer storefront, secure administrator dashboard, order management, configurable currencies and real payment, identity, SMS, email, and shipping provider integrations.

## Description

VoltMart gives a single store operator a configurable ecommerce website and administration workspace. The download includes the complete editable source, compiled application, and English setup and operations documentation. It is designed for one store instance on Node.js 24 LTS with SQLite; it is not a hosted SaaS service or a horizontally scaled multi-tenant platform.

Customers can create accounts, browse products, keep a server-backed cart, place orders, pay through Stripe Checkout, download receipts and warranty records, request support, and manage savings plans when enabled by the operator. Store staff can publish products, configure currency and store policies, manage orders and refunds, reconcile shipping labels, issue and restrict vouchers, review customer accounts, handle support and warranty requests, and inspect audit history.

## Included

- Node.js 24 application source and compiled production build.
- Responsive customer storefront and administrator dashboard.
- SQLite persistence, schema migrations, backup and maintenance commands.
- Stripe Checkout, refunds, webhooks, Identity and recurring-payment lifecycle.
- Twilio Verify phone verification, Shippo rates and label management, and SMTP recovery email.
- English HTML help documentation, Docker/Caddy deployment files, release checklist, and third-party notices.

## Requirements and limitations

- Node.js 24 LTS and a writable persistent local disk; Docker deployment is supplied for Linux.
- One application instance per SQLite database. Horizontal scaling requires an architectural migration.
- Buyers provide and configure their own Stripe, Twilio, Shippo and SMTP accounts, credentials, and approved business settings. Provider usage charges are separate.
- USD is the initial currency; the administrator may choose a supported currency before creating financial records. Tax, shipping and legal policies must be configured for the buyer's jurisdiction.
- Savings and installment features require provider approval and legal review for the buyer's jurisdiction. The application does not perform credit-bureau checks.
- No product catalog, product imagery, live service credentials or production transaction history is included.

## Technical facts

- Release tested with `npm run build`, 11 automated API/domain tests, and one Chromium end-to-end customer/admin journey.
- Clean buyer archive installed production dependencies and passed a production HTTP smoke check.
- Dependency audit reported zero vulnerabilities at release time.
- Live provider-account sandbox tests, public HTTPS deployment, and restore rehearsal remain deployment-owner checks.

## Suggested tags

nodejs, ecommerce, online store, admin dashboard, sqlite, stripe, shipping, inventory, order management, electronics, react, typescript

## Preview and asset note

Capture original desktop dashboard, storefront, checkout setup, and mobile screenshots from the packaged build. Any screenshot imagery must be owned or licensed for commercial use. No live preview URL is supplied with this package.
