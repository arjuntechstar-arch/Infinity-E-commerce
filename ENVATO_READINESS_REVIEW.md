# Envato readiness review

Reviewed: 30 September 2026. Verdict: **not ready for submission as a complete e-commerce application**.

Scope: repository inspection, frontend production build, separate backend type check, isolated reproduction of the production router failure, and npm vulnerability audit. This is a readiness assessment, not an Envato approval or a complete penetration test. Browser/device testing, visual originality, asset provenance, and the author's account eligibility remain unverified. No application fixes were made during this review.

## Eligibility and product category

Envato currently pauses open author applications, permits new authors only by direct invitation, and says Code and Theme are not currently invited categories. Existing authors cannot apply to add categories during the pause. An existing account's eligible upload categories must therefore be confirmed first. [Official author intake policy](https://help.author.envato.com/hc/en-us/articles/53981083605913-Author-applications-are-paused-new-authors-join-by-invitation-only).

A functional React/Node application points toward CodeCanyon's code categories. A frontend-only template is a different product scope and needs its own category-specific review. This project currently resembles an interactive storefront prototype with a demonstration API. Do not describe it as a production commerce, banking, KYC, or payment system.

## Published criteria and current status

| Area | Status | Finding/action |
| --- | --- | --- |
| Organized, editable source | Partial | React components, types, API routes, and data have separate directories. Buyer documentation and a curated distribution package are missing. |
| Installation and customization help | Fail | No buyer HTML/PDF guide found; no publicly accessible documentation supplied. Explain setup, Node version, configuration, deployment, feature limitations, and asset credits. |
| Working code and documented dependencies | Fail | Frontend builds, but the backend has 13 TypeScript diagnostics and the production wildcard route fails. |
| Accurate feature description | Fail for a complete application | OTP, KYC, mandates, refunds, and several downloads simulate success. Listing must accurately disclose implemented versus demonstration behavior. |
| Asset rights and credits | Unverified | Product/profile images are remotely hosted on Google URLs. No asset provenance or third-party attribution inventory found. A URL does not prove permission. |
| Submission package | Missing | No reviewed buyer ZIP, installation guide, or release checklist found. Keep repository metadata, dependencies, private configuration, and unrelated prototypes out of the buyer package. |
| Listing metadata and previews | Unverified | No finished listing supplied. Prepare an accurate title, description, tags, supported versions, screenshots, and cover. |
| Browser compatibility and console quality | Unverified | No browser matrix or automated browser suite found. Static review reveals hooks called after conditional returns in five modals. |
| Account eligibility | Unverified | Depends on existing author/category access under the current intake policy. |

CodeCanyon requires English HTML/PDF documentation, installation/customization/use instructions, relevant credits, publicly accessible online documentation, and an organized ZIP. Preview assets need commercial rights; included third-party assets need redistribution rights. [Code preparation requirements](https://help.author.envato.com/hc/en-us/articles/360000471583-Code-Item-Preparation-Technical-Requirements).

The NodeJS requirements call for readable source, documented dependencies/server setup, console-error-free code, lint checks, and verification of claimed browser support. Some published tooling references are legacy; confirm how reviewers apply them to TS/React rather than treating frontend TypeScript compilation as full compliance. [NodeJS requirements](https://help.author.envato.com/hc/en-us/articles/360000554583-NodeJS-Category-Requirements).

Descriptions must disclose limitations. Theme/Code items permit up to 15 tags and titles up to 100 characters. [Metadata requirements](https://help.author.envato.com/hc/en-us/articles/360000471066-Item-Information-and-Metadata-Requirements).

The general presentation guide specifies a 3:2 cover, minimum 1170×780, recommended 2340×1560, at most 20 MB. Confirm category upload fields when packaging. Live previews are required for web themes; for other code categories they are recommended, and any provided preview must work. [Presentation requirements](https://help.author.envato.com/hc/en-us/articles/360000424863-Item-Presentation-Requirements).

## Concrete engineering blockers

These are repository findings and requirements for the claimed complete-app scope, not assertions that Envato explicitly mandates a particular database, gateway, or admin architecture.

1. **Production startup fails.** `server.ts:31` registers `app.get('*', ...)` with Express 5. Reproducing that registration with the installed Express throws `Missing parameter name at index 1: *`. Fix the catch-all and test an actual production deployment, including direct page loads. The unconditional Vite import also conflicts with production installs that omit dev dependencies; `npm start` does not itself select production mode.
2. **Build gives incomplete assurance.** `npm run build` passes, emitting the frontend bundle. `tsconfig.json` includes only `src`, excluding `server.ts` and `backend`. An explicit backend check reports 13 errors: six `reviewsCount`/`reviewCount` mismatches, three invalid `subtitle` fields for `Scheme`, and four missing type exports/imports. Align the API data with `src/types.ts` and include server code in checks.
3. **No durable or per-user storage.** `backend/data/store.ts:31` uses shared in-memory objects and arrays. Orders, schemes, profile changes, and refunds reset when the process restarts. There is no authenticated user isolation in the API wiring.
4. **Unauthenticated sensitive operations.** Profile updates, orders, mandates, and KYC routes are mounted without authentication/authorization middleware. `backend/routes/profile.ts:46` reads but never validates `otp` before changing the phone. `backend/routes/kyc.ts` sets verification to true without identity checks. These must remain explicitly labelled demo flows until implemented securely.
5. **Client-controlled order prices.** `backend/routes/orders.ts:59` calculates totals from submitted product prices and quantities. Look up products and prices server-side, validate quantity/stock, and reconcile payment status before confirming purchases.
6. **Financial operations are simulated.** Mandate registration adds an object to memory and claims bank verification. No payment gateway, bank authorization, settlement processing, or verified KYC provider integration was found. A complete commerce product needs the integrations it advertises, with validated callbacks and duplicate-request protection.
7. **Errors become false success.** `src/App.tsx:265` sends an order request but clears the cart and displays success immediately. Its failure handler creates a local confirmed order. Enrollment and withdrawal have similar mock success fallbacks. Failures must produce actionable errors and preserve the user's data.
8. **Downloads are placeholders.** Receipt and warranty buttons in `ReceiptViewerModal.tsx` and `WarrantiesModal.tsx` only call `alert`; they do not download documents. Tracking and courier interaction also contain hardcoded/demo behavior.
9. **React hooks are conditional.** `CartModal`, `KycModal`, `AutopayMandateModal`, `ChangePhoneModal`, and `ConciergeChatModal` return before hooks when closed. Move hooks before early returns or conditionally mount an inner component. Browser behavior was not tested in this audit.
10. **Development styling delivery.** `index.html:19` uses Tailwind's Play CDN. Compile CSS locally for distribution; Tailwind documents that this CDN is intended for development, not production. [Tailwind documentation](https://v3.tailwindcss.com/docs/installation/play-cdn).
11. **Dependency vulnerabilities.** Current `npm audit` reports two affected packages: Vite (high) and its esbuild dependency (moderate). These relate to development tooling/server behavior; they do not establish a production exploit by themselves. Upgrade to compatible patched tooling and rerun build/runtime checks instead of blindly applying a major-version forced fix.
12. **Customization and accessibility gaps.** `.env.example` declares store name/default hub values that are not consumed in the inspected code. Branding, dates, and profile data are hardcoded. Zoom is disabled in the viewport meta tag, and dialogs lack consistent semantics/keyboard handling. Verify keyboard use, focus return, Escape dismissal, and small-screen layouts.

## Assets and AI provenance

Audit each image, font, icon, source dependency, and original design reference. Record origin, permission, required notices, and whether it is included or preview-only. Do not assume Google-hosted images are redistributable, or infer that they are AI-generated from their URLs.

Envato's current policy prohibits AI-generated content as an item's main component and permits AI-generated preview assets under stated conditions, excluding them from the download. It broadly addresses content types but does not resolve every AI-assisted-code scenario. If AI generated substantial parts of this product, obtain a case-specific policy determination before relying on eligibility. [AI content policy](https://help.author.envato.com/hc/en-us/articles/13313674070681-AI-generated-content-policy-for-Market-and-Elements).

## Verification record

| Check | Result |
| --- | --- |
| `npm run build` | Pass: frontend TypeScript and Vite build; 53 modules, JS approximately 306 kB uncompressed. |
| Explicit backend `tsc --noEmit` with bundler resolution, ESNext modules, ES2020 target, skipLibCheck, esModuleInterop | Fail: 13 diagnostics. |
| Isolated registration of production wildcard using installed Express | Fail: missing parameter name for `*`. |
| `npm audit --json` | Two vulnerable packages: one high and one moderate. |
| Browser/device interactions, screenshots, console, accessibility, external image availability | Not verified. |
| Asset ownership, account eligibility, actual submission ZIP, public demo/docs | Not verified. |

## Work order before submission

1. Confirm author/category eligibility and decide whether the paid product is a frontend template or complete application.
2. Fix production startup, backend typing, API schema consistency, conditional hooks, and dependency vulnerabilities.
3. For a complete application, implement durable user-scoped storage, authentication/authorization, authoritative pricing, validated checkout, and the financial integrations actually promised. Remove fabricated success states. Add focused integration tests for these behaviors.
4. Complete downloads and remaining interactions, make customization real, compile CSS, and test supported browsers/devices and failure paths.
5. Resolve all asset/source permissions and AI provenance questions.
6. Write buyer HTML/PDF documentation, publish accessible docs, prepare the clean ZIP and accurate listing/previews, and verify installation from that ZIP on a clean environment.

Final visual/commercial acceptance remains Envato's decision even after technical issues are fixed. [Envato review process](https://help.author.envato.com/hc/en-us/articles/360000471923-How-to-Get-Your-Items-Through-Review-at-Envato).
