# Product implementation plan

Created 2026-09-30 before implementation. Scope: turn the existing storefront into an installable commerce product with an administrator web application. Existing simulated financial and verification operations are not acceptable implementations.

## Execution contract

- Work sequentially. Implement, build, test, and record results for a phase before starting the next.
- Tests must cover behavior and failure cases, not only compilation. Never replace provider success with a timer or local success fallback.
- External service integrations require real provider contracts. Test doubles belong only in tests. Provider sandbox validation and live activation are separate release gates.
- Preserve useful storefront design, make all exposed operations truthful, and keep customer/admin authorization on the server.
- An unavailable integration must fail explicitly; disabling it does not count as completing the integration.
- Marketplace admission, asset rights, and live provider credentials cannot be certified by code alone.

## Phases and acceptance gates

| Phase | Deliverables | Gate before next phase | Status |
| --- | --- | --- | --- |
| 1. Production foundation | Runtime/toolchain, full TypeScript checks, compiled CSS, production server, automated test harness | Full typecheck/build, production startup and HTTP checks, no unresolved dependency advisories in chosen dependencies | Passed |
| 2. Data and access | Database schema/migrations, password authentication, sessions, roles, CSRF protection, audit records | Persistence/restart, login/logout, invalid credentials, cross-user isolation and admin denial tests; build | Passed |
| 3. Commerce | Admin catalog/inventory, storefront cart, authoritative pricing, vouchers, order state machine | Tampered pricing, stock/concurrency, voucher boundaries, retry/idempotency and ownership tests; build | Passed |
| 4. Integrations | Payment/refund callbacks, phone OTP, identity verification, scheme/mandate lifecycle, fulfillment | Provider contract and signed callback tests; sandbox verification where configured; build | Automated gate passed; provider sandbox verification outstanding |
| 5. Product workflows | Admin dashboard, orders/customers, support, warranty claims, real PDF documents, configurable storefront | Browser customer/admin journeys, download validation, permission and failure-path tests; build | Passed |
| 6. Release | English buyer/admin docs, deployment/backup guide, attribution inventory, distributable ZIP | Clean package installation, production/browser checks, dependency audit and documented external release gates | Passed; marketplace and live-provider owner checks remain |

## Decisions requiring owner input

- Selling country, tax/shipping policies and financial-scheme business rules must be set by the store operator before launch.
- Payment/autopay, SMS OTP, identity-verification, and shipping providers are Stripe, Twilio Verify, and Shippo. Buyers supply their own accounts and credentials; SMTP is configurable.
- Deployment target/database: delegated by owner and selected as Node.js 24 LTS, single-instance SQLite WAL, persistent Docker volume, and Caddy HTTPS reverse proxy. Docker is not installed in this build environment.
- Original asset rights, approved product imagery, author account/category eligibility.

Do not request secrets in chat. Configure service credentials through environment variables or the deployment secret manager.

## Phase evidence

Owner decisions: USD default, buyer-configurable currency; deployment selection delegated. Selected single-server Node 24 / SQLite WAL with persistent Docker volume and backups. Provider choices: Stripe payments and Identity, Twilio Verify, Shippo. Credentials remain buyer-supplied. Database architecture is intentionally single-instance; horizontal scaling requires a future database migration.

Record exact commands, results, limitations, and changed behavior here as each phase completes. A partial phase must remain marked partial or blocked; do not count a scaffold or untested provider integration as complete.

Phase 1: `npm run build` passed with frontend/backend checking and bundled server; `npm test` passed production HTTP, deep links, compiled CSS and malformed/unknown API checks. Dependency install audit: zero vulnerabilities. Project-local Node 24.21.0 resolves the machine's old Node runtime; buyer runtime requirement is Node 24 LTS. Bundler optional dependency was installed using Node 24. Legacy demo behavior remains to be replaced in following phases.

Phase 2: `npm run build` and all three `npm test` suites passed. Covered registration privilege injection, anonymous/customer admin denial, CSRF/origin rejection, isolated profiles, wrong passwords, password-change revocation, logout, and database reopen. Legacy API routes are no longer mounted; the storefront will be connected to the replacement API in the product UI phase.

Phase 3: build and all four test suites passed. Covered price tampering, privilege denial, ownership, checkout replay/conflict, concurrent stock exhaustion, invalid quantities/status changes, cancellation restocking, and failed voucher rollback. Amounts are stored in integer minor units; currencies are configurable before the first order. Customer/admin interfaces follow after integration tests.

Phase 4: build and provider contract tests passed. Tested real Stripe signature generation/verification, incorrect amounts, duplicate events, OTP approval/failure, unconfigured-provider failure, and installment deduplication/maturity balance. Real Stripe/Twilio/Shippo integrations are implemented, but no credentials were supplied: provider-account sandbox checks remain a release gate, not a completed test. Test doubles exist only in tests. Financial scheme availability requires the buyer's provider/business approval; no credit-bureau claims are made by the application.

Phase 5: build and API/domain tests passed. Chromium end-to-end passed admin login/product creation, customer registration/cart/order flow, persistence after browser reload, actual PDF bytes, denied customer access to admin, and a 390px mobile overflow check. Screenshots inspected for desktop admin and mobile store; no runtime page errors were recorded in this journey. Support/trade-in tests check ownership, state transitions and single personal voucher issuance. A queued Shippo label now has a reconciliation path that does not create a second purchase. Legacy prototype assets are excluded from distribution.

Phase 6: English buyer/admin/deployment documentation, Envato listing draft, release checklist, generated attribution inventory, and a clean buyer ZIP are included. Build, type checks, 11 API/domain tests, one Chromium browser journey, and `npm audit` passed (zero vulnerabilities). The extracted release installed 101 production packages and passed `/api/health`, storefront, `/admin`, and documentation HTTP smoke checks. Real provider-account sandbox transactions, business approval, live HTTPS deployment, and Docker-host verification require buyer accounts/environment and remain pre-launch checks.
