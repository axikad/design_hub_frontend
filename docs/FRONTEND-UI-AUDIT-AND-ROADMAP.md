# DesignHub Frontend UI Audit and Integration Roadmap

Status: Phase 1 UI correction implemented and build-verified on 20 November 2026. API integration remains intentionally deferred.

Reviewed sources:

- Live deployment: `https://designshub.org/`
- Frontend source: `E:\design_hub_frontend`
- Backend routes and API handoff: `E:\DesignHub`
- Frontend baseline commit: `cd01622` (`Prevent stale app shell caching`)

## 1. Decision

The proposed sequence is correct:

1. Audit the AI Studio prototype.
2. Correct and simplify the UI while it still uses mock data.
3. Freeze the page and component structure.
4. Add a typed API client and authentication layer.
5. Integrate public browse APIs first.
6. Integrate buyer, checkout, seller studio, and wallet flows in controlled phases.
7. Remove all mock data and local simulations before production acceptance.

This reduces API rework and makes visual review independent from backend debugging.

## 2. Current frontend state

The project is a complete React prototype rather than an API-connected application.

- React 19, React Router 7, Vite 8, Tailwind CSS 4, Motion and Lucide icons.
- Public marketplace, account, checkout, creator profile, seller studio and wallet screens already exist.
- All marketplace records, users, purchases, wallet balances, settlements and withdrawals come from `src/data/mockData.ts`.
- `src/context/AppContext.tsx` performs fake CRUD, login, checkout, earning, settlement and withdrawal actions in browser memory/local storage.
- No API client, token store, request interceptor or server error mapper exists.
- Every route is currently accessible without a real authorization guard.
- The live site therefore looks functional but displays demo data and simulated actions.

## 3. Overall visual assessment

The design direction is strong and worth keeping. It feels more specific to an Indian industrial textile marketplace than a generic ecommerce template. The cream/stony base, dark ink text, amber accents, serif display headings and embroidery-focused imagery form a usable brand foundation.

The largest problem is not appearance. It is that the interface presents invented marketplace facts as verified production facts. Examples include fixed seller ratings, sales counts, `2,400+ Designs`, `500+ digitizers`, guaranteed zero thread breaks, test-machine claims, customer testimonials and fixed settlement statistics. Those claims must be driven by real data, approved static content, or removed.

The UI is also too dense in places. The home page repeats similar design grids, the product cards include more detail than needed for browsing, and seller pages show many metrics that the current API does not return.

## 4. Keep and reuse

### Brand and layout foundation

- Keep the cream background, dark stone/ink palette and restrained amber accent.
- Keep the serif display heading plus clean sans-serif body pairing.
- Keep the wide desktop marketplace layout and compact mobile bottom navigation concept.
- Keep the sticky header, but simplify its actions by login state.
- Keep the footer structure, but make its links and claims configurable.

### Public marketplace components

- Keep the hero structure: clear marketplace statement, search and primary browse action.
- Keep machine and category discovery cards, populated from catalog APIs.
- Keep `DesignCard` as the reusable browse unit after reducing its content.
- Keep the explore filter experience; its controls map well to the new backend filters.
- Keep the design detail image gallery, basic specification area, price panel and buy action.
- Keep collection/folder cards and detail pages, but use backend folder terminology and capabilities.
- Keep empty states, loading skeletons, confirmation dialogs and toast components.

### Buyer and seller concepts

- Keep saved designs, purchases/downloads and profile/settings entry points.
- Keep the seller studio as a separate workspace inside the same web application.
- Keep dashboard summaries only where backend endpoints provide the values.
- Keep wallet tabs for earnings, settlement timeline, withdrawals and ledger.
- Keep manual versus automatic settlement messaging; the backend already supports both modes.

## 5. Change before API integration

These are Phase 1 UI changes. They should be completed while mock data is still available.

### 5.1 Remove or label unsupported claims

Remove or replace with neutral copy until verified data/content exists:

- `Explore 2,400+ Designs`
- `Join 500+ Indian digitizers`
- fixed ratings, sales counts and design counts for creators
- invented testimonials and company/person names
- `Zero Thread-Break Guarantee`
- universal claims that all files were tested on named machines
- universal claims that EMB, DST, PES, JEF or EXP are always included
- hard-coded `85% Seller Net Payout`
- `Bi-Weekly Automated Settlements` because settlement cycles are admin-configurable
- GST invoice, tax, refund or buyer-protection promises not yet represented by active production rules
- live bank/payout wording while the backend is in simulated/test mode

Preferred replacement: factual, data-neutral wording such as “Browse machine-ready textile design files” and display file formats, machine information and test status only when present in the API response.

### 5.2 Reduce home-page density

Recommended order:

1. Hero and global search.
2. Browse by machine.
3. Browse by category.
4. Latest designs.
5. Featured collections/folders, only if real data exists.
6. Simple buyer and seller “How it works”.
7. Approved content/footer.

Remove duplicate “featured”, “trending” and “latest” grids until `/home` explicitly provides distinct real sections. One strong design grid is better than several mock grids.

### 5.3 Simplify design cards

Browse cards should show:

- preview image
- design title
- machine/machine type
- one short specification summary when available
- price
- purchased/saved state when authenticated
- one primary action

Do not show invented seller rating, sales count, guarantees or formats. Do not place long descriptions in grid cards. Detailed specifications belong on the detail page.

### 5.4 Make the UI catalog-driven

Remove hard-coded machine, category, design-type and format unions from frontend models. The admin controls this catalog, so the website must render IDs and names returned by the API.

The explore filter sheet should support:

- one machine type
- multiple categories
- multiple design types
- stitch ranges
- exact needle values
- area ranges
- search, sort and pagination

The filter UI must use stable public IDs in URLs/state, not display names.

### 5.5 Correct design specifications

The current single table is useful when specifications are simple. The backend can return multiple design types, each with its own image and details.

Use two display modes:

- Compact table when there are no design-type images.
- Responsive cards when the machine configuration enables design-type image cards. Each card shows the image, type name and only the most useful enabled details.

Never assume all fields exist. `stitchCount`, `needle`, `area`, `height`, `width`, `nameOrNumber` and image may be hidden or absent according to machine configuration.

### 5.6 Separate folders from curated marketing bundles

Backend “folders” are purchasable ZIP/RAR archives with extracted file previews and pagination. The prototype markets them as curated discounted suites with original and sale prices.

For initial integration:

- Label them “Design folders” or “Collections” consistently.
- Show the server price only.
- Show archive/file count and cover preview when available.
- Do not calculate discount percentages or original prices.
- Paginate/infinite-scroll folder files using the server `meta` and `links`.

Discounted bundles can be a future feature if the backend later stores bundle pricing and discount metadata.

### 5.7 Correct login and role behavior

- Guests may browse public home, designs, design details, folders and catalog data.
- Protected actions should open a sign-in prompt and preserve the intended return URL.
- Remove the mock buyer/seller role toggle.
- Seller tools must appear from authenticated permissions/capabilities, not a client-side role switch.
- Add route guards for account, purchases, checkout, create/edit, seller studio and wallet.
- A `401` signs the user out; a `403` explains missing permission without signing out.

### 5.8 Correct checkout language and state

- All money values arrive as integer paise and must be formatted centrally.
- Buyer price must come from checkout preview/order responses.
- Seller commission is not an extra buyer charge.
- Tax must not be invented or calculated in the frontend.
- Show test mode clearly when returned by the backend.
- Use states: loading preview, ready, creating order, gateway open, verifying, paid, pending and failed.
- Never unlock downloads from a client-only success flag.

### 5.9 Correct seller studio and wallet

- Do not calculate commission, earnings, balance or settlement date locally.
- Show pending, available, reserved and paid from `/seller/wallet`.
- Show immutable settlement snapshots from each earning row.
- Use backend `canWithdraw`, `hasOpenWithdrawal`, minimum amount and settlement mode.
- Automatic settlement is simulated in test mode; it is not a real bank transfer yet.
- Show a persistent “Test mode — no real money transfer” banner wherever applicable.
- Remove hard-coded bank names, lifetime totals, design runs and cycle numbers.

### 5.10 Add complete application states

Every data page needs:

- first-load skeleton
- empty state
- retryable network error
- no-results state for filters
- validation errors located beside their fields
- `401`, `403`, `404`, `422`, `429` and `500` handling
- disabled/deduplicated submit buttons
- upload progress where files are involved
- success confirmation based on server response

The API error envelope is `{ success, message, code, errors? }`. Toasts should show the server message, while field errors stay inside the relevant form/card.

### 5.11 Fix encoding and typography data issues

Source currently contains mojibake such as `â‚¹`, `Â·` and broken en-dashes. Normalize source files to UTF-8 and use actual `₹`, `·`, `–` or semantic formatting helpers.

### 5.12 Performance and accessibility

- Route-lazy-load major pages; the current production JavaScript bundle is about 547 KB.
- Compress and resize the four large source images; each is roughly 0.9–1.3 MB.
- Use responsive image sizes, lazy loading and stable aspect ratios.
- Add visible keyboard focus states and correct dialog focus trapping.
- Use semantic buttons/links and meaningful image alt text.
- Ensure filters and specification tables work at narrow widths without horizontal overflow.
- Respect reduced-motion settings.

## 6. Page-by-page decision

### Home

Keep the visual identity and hero. Simplify sections and replace all mock counts/claims. Machine/category sections become API-driven. Use `/home` for real feed sections.

### Explore

Keep and prioritize. This is the best-aligned screen for the existing API. Rebuild filters around `/catalog/browse-filters` and `GET /designs`; apply filters before pagination and synchronize them with the URL.

### Design details

Keep the gallery, price/action block and specification concept. Remove unsupported ratings, guarantees and arbitrary formats. Add multi-design-type image cards, watermark/download rules and purchased-owner states.

### Collections/folders

Keep the card/detail experience, but align it with folder API behavior. Remove fake savings and bundle composition until supported.

### Creator profile

Keep as a future-ready design. Do not release public ratings, biographies, locations, sales counts or creator directories until the backend supplies an approved public seller profile contract.

### Authentication

Keep the visual shell. Replace fake login with OTP request/verification, registration machine selection, resend timer, error states and return-to-intended-route behavior.

### Buyer account and purchases

Keep the structure. Profile, machine preferences, saved designs and purchases already have backend endpoints. Hide unsupported invoice/tax/profile fields until supported.

### Checkout

Keep the two-column desktop layout and compact mobile order summary. Replace all calculations and simulated completion with the payment API and Razorpay lifecycle.

### Seller studio dashboard

Keep quick links and a small operational summary. Remove analytics that have no endpoint. In the first live version, show own designs, folders and wallet links rather than invented performance reports.

### Add/edit design

Keep the stepped/sectioned form. Build fields from machine `designFormConfig`, upload files first, send returned URLs, preserve optional existing images on edit, and surface server validation by full field path.

### Seller wallet

Keep the screen concept; it closely matches the implemented backend. Use API-provided balances, earnings, settlement snapshots, withdrawal state and ledger records. Never mutate balances locally.

### Legal/support pages

Keep the routes and layout, but render approved admin-managed content. Do not publish generated legal, refund or tax promises without business/legal approval.

## 7. Existing backend mapping

### Public/guest

- Home: `GET /api/v1/home`
- Explore: `GET /api/v1/designs`
- Explore catalog: `GET /api/v1/catalog/browse-filters`
- Design detail: `GET /api/v1/designs/{id}`
- Folders: `GET /api/v1/folders`
- Folder detail/files: `GET /api/v1/folders/{id}?page=1&per_page=20`
- Additional catalog relationships: endpoints under `/api/v1/catalog`

### Authentication/account

- OTP: `POST /api/v1/auth/request-otp`, `POST /api/v1/auth/verify-otp`
- Logout: `POST /api/v1/auth/logout`
- Profile: `GET|POST|PATCH|DELETE /api/v1/users/me`
- Contact verification: `/api/v1/users/me/contact/request-otp` and `/verify-otp`
- Machine preferences: `GET|PUT /api/v1/users/me/machines`
- Saved designs: endpoints under `/api/v1/users/me/saved-designs`
- Purchases: `GET /api/v1/users/me/purchases`

### Commerce

- Checkout preview: `GET /api/v1/payments/checkout-preview`
- Create order: `POST /api/v1/payments/orders`
- Verify payment: `POST /api/v1/payments/verify`
- Purchase status: endpoints under `/api/v1/purchases`
- Protected design/folder downloads: existing design and folder download endpoints

### Seller

- Own designs: `GET /api/v1/users/me/designs`
- Create/update/delete design: `/api/v1/designs`
- Upload staging: `POST /api/v1/uploads`
- Seller pricing preview: `/api/v1/seller/pricing-preview`
- Wallet/earnings/ledger: endpoints under `/api/v1/seller`
- Withdrawals: endpoints under `/api/v1/seller/withdrawals`

### Search by image

The modal can remain in the design system, but it should be hidden from the first UI release unless the current authenticated backend search is intentionally enabled. The backend currently has local visual matching with optional AI embedding; the separate Google/Vision decision remains on hold.

## 8. Backend/API gaps or product decisions

These must not be faked in the frontend:

- Public seller profile summary: approved seller name, avatar, biography, location and public statistics.
- Ratings/reviews and the source of rating counts.
- Public “verified studio/file” status and verification rules.
- Real popularity/trending metrics.
- Bundle discount/original-price model for folders.
- Public machine-brand calibration/testing evidence.
- Newsletter subscription endpoint.
- Contact/help submission endpoint if forms should send messages.
- Invoice/GST/tax breakdown contract.
- Refund/reversal workflow; intentionally postponed in the current backend plan.
- Live automatic payout provider and webhook flow; test simulation exists, live bank transfer does not.

## 9. Recommended frontend architecture before integration

Create these layers after the UI-only phase is approved:

- `src/api/client.ts`: base URL, headers, timeout, token injection and error normalization.
- `src/api/endpoints.ts`: endpoint paths only.
- `src/api/services/*`: auth, catalog, designs, folders, account, payments and seller services.
- `src/api/types/*`: transport models matching backend public IDs and nullable fields.
- `src/auth/*`: session/token persistence, current-user bootstrap and route guards.
- `src/features/*`: feature-specific UI and state rather than one global `AppContext`.
- `src/lib/money.ts`: paise-to-INR formatting only; no business calculations.
- `src/lib/api-errors.ts`: field-error and toast mapping.

Do not keep server records in long-lived local storage. Persist only the access token/session data and harmless UI preferences. Use server pagination and invalidate/refetch after mutations.

## 10. Implementation phases

### Phase 1 — UI correction only

- Remove unsupported claims and metrics.
- Simplify home and design cards.
- Normalize terminology and UTF-8 characters.
- Add loading, empty and error-state visual components.
- Finalize responsive design-type specification cards.
- Finalize route/navigation behavior for guest, buyer and seller states using temporary fixtures.
- Improve accessibility and image/bundle performance.

Exit condition: every screen is visually approved and every displayed field has an identified API source or is explicitly approved static content.

### Phase 2 — API foundation and public marketplace

- Add environment-based API URL and typed client.
- Add error normalization and pagination utilities.
- Integrate home, catalog, explore, design details and folders.
- Remove public-page mock data.

Exit condition: guest can browse real server data without login.

Implementation status (20 November 2026): complete and runtime-verified.

- Added an environment-based typed API client with normalized Laravel errors and pagination metadata.
- Connected live `/home`, `/catalog/browse-filters`, `/designs`, `/designs/{id}`, `/folders` and `/folders/{id}` endpoints.
- Home, Explore, Design detail, Folder listing and paginated Folder detail no longer read marketplace records from fixtures.
- Explore sends search, machine type, category, design type, stitch, needle and area filters to the server before pagination.
- Design detail renders real per-design-type specifications and the optional image-card layout returned by the backend.
- Public routes work without an access token; live CORS was verified for `https://designshub.org`.
- Headless-browser smoke tests confirmed live content renders on all five public page flows.
- Account, saved designs, checkout, downloads and seller studio remain explicitly preview-only for later phases.

### Phase 3 — Authentication and buyer account

- Integrate OTP/register/logout.
- Add protected routes and return URL.
- Integrate profile, machine preferences, saved designs and purchases.

Exit condition: user session survives refresh and protected actions behave correctly.

### Phase 4 — Checkout and downloads

- Integrate checkout preview, order creation, Razorpay and verification.
- Poll/reload purchase status safely.
- Integrate protected downloads.

Exit condition: test-mode purchase works end to end without client-side price authority.

### Phase 5 — Seller studio

- Integrate own designs, dynamic create/edit form, uploads and deletion.
- Integrate folder creation and own marketplace records.
- Remove mock seller CRUD.

Exit condition: seller can manage only their own records and all validation comes from the server contract.

### Phase 6 — Wallet and settlements

- Integrate balances, earnings, immutable settlement snapshots, ledger and withdrawals.
- Handle manual/automatic modes and test-mode labels.
- Remove all local wallet simulations.

Exit condition: UI values reconcile with backend records and retries cannot duplicate actions.

### Phase 7 — production hardening

- Route-level code splitting and optimized images.
- Accessibility and keyboard QA.
- Mobile/tablet/desktop responsive QA.
- Error monitoring and analytics with privacy review.
- Content/legal/business approval.
- End-to-end test-mode regression.

## 11. Phase 1 acceptance checklist

- [x] No unverified count, rating, testimonial, guarantee or payout claim is displayed on an active route.
- [x] Home page has one clear hierarchy without duplicate design sections.
- [x] Design cards are compact and do not contain long descriptions.
- [x] Machine/category/type options use renderable collections rather than hard-coded unions.
- [ ] Design detail must be finalized against the real per-design-type API response in Phase 2.
- [x] Folder UI does not invent discounts or original prices.
- [x] Guest, buyer and seller navigation states are clearly designed.
- [x] Checkout does not calculate commission or tax locally.
- [x] Wallet identifies its records and actions as preview/simulated data.
- [x] Loading, empty, no-result, validation and server-error states have reusable visual patterns.
- [x] UTF-8 currency and punctuation render correctly in the build.
- [x] Responsive layouts avoid intentional horizontal page scrolling.
- [x] Primary actions are keyboard accessible and have visible focus.
- [x] Visible dynamic fields are mapped in this document or explicitly marked as preview content.

### Phase 1 implementation notes

- Public navigation is now state-aware for guests, buyers and sellers.
- Account, checkout and seller studio routes have UI-level guards.
- Home, catalog cards, folder cards, legal content, checkout and seller screens use factual, neutral copy.
- Route-level lazy loading reduced the main JavaScript bundle from roughly 547 kB to 311 kB before gzip.
- TypeScript validation and the Vite production build pass.
- Source photography remains comparatively large (roughly 0.9–1.34 MB per image) and should be converted to responsive WebP/AVIF assets before final production hardening.
- Mock data and browser-local actions remain temporary by design and must be removed as each API slice is integrated.

## 12. Immediate next action

Start Phase 1 in this order:

1. Global header/navigation/auth-state shell.
2. Home page simplification and factual copy.
3. Reusable design and folder cards.
4. Explore filters and result states.
5. Design details/specification presentation.
6. Auth, account and checkout visual states.
7. Seller studio and wallet visual states.
8. Responsive/accessibility/performance pass.

Only after this UI pass is reviewed should API client implementation begin.
