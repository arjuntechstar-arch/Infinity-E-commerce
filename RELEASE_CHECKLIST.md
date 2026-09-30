# Release checklist

Do not publish a claim that an unchecked item has passed.

- [x] Full frontend/backend TypeScript and production build checks implemented.
- [x] Persistent accounts, server permissions, CSRF, stock/pricing/idempotency checks implemented and tested.
- [x] Real provider clients; no production mock success fallbacks.
- [x] Customer/admin Chromium flow and PDF download verified.
- [x] Mobile layout screenshot and overflow check completed.
- [x] Clean buyer-package production install and production smoke test: `npm ci --omit=dev`, health/store/admin/documentation HTTP routes.
- [x] Dependency audit (zero vulnerabilities) and generated license inventory.
- [ ] Stripe account sandbox: successful/declined/async/expired payments, refund, subscription termination, withdrawal, credit redemption, and webhook retry.
- [ ] Stripe Identity verification and failure/retry tested with buyer's account.
- [ ] Twilio SMS delivery/expiry/incorrect code tested with buyer's account.
- [ ] Shippo quote/label/reconciliation tested with buyer's origin, carrier accounts, and test token.
- [ ] SMTP delivery and account recovery tested with buyer's mail service.
- [ ] Buyer configures tax, shipping, provider credentials, store policies, legal/financial eligibility, and support details.
- [ ] Buyer supplies and documents rights for catalog assets. Archived prototype imagery is excluded from the package.
- [ ] Public HTTPS deployment and documentation URLs tested; Docker image tested on the deployment host. Docker is unavailable in the development environment.
- [ ] Backup restored and verified on a separate environment; scheduled backups configured.
- [ ] Safari/Firefox and real mobile device journeys; broader accessibility review.
- [ ] Existing Envato author/category eligibility and AI-content policy determination confirmed.
- [ ] Listing assets, cover/thumbnail, supported versions, and accurate feature description prepared for selected category.

No live provider credentials or production deployment access were supplied during development. These external checks are not replaced by unit tests or test doubles.
