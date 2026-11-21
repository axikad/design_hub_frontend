# DesignHub Home UI Restoration Roadmap

Status: In progress — Browse by Machines is implemented locally; live deployment verification is pending

Last reviewed: 21 November 2026

## Purpose

The original AI Studio template contains several useful marketplace sections that were removed or simplified while the live APIs were being integrated. The core marketplace flows are now connected, so these sections can be restored one at a time using real backend data.

This file is the checklist for that work. A section must not be restored with invented records, counts, ratings, claims, testimonials, discounts, or seller statistics.

## Reviewed sources

- Original AI Studio template: `https://textile-design-hub.ai.studio/`
- Original template source: frontend Git history at commit `a703367`
- Current website source: `E:\design_hub_frontend`
- Mobile home reference: `E:\design_hub_app\src\app\(tabs)\home.tsx`
- Backend API source: `E:\DesignHub`

## Mobile home reference

The mobile home currently provides this useful hierarchy:

1. Header and account actions.
2. Design search.
3. Optional image-search action.
4. Top-level **Machines**.
5. Categories and design-type discovery.
6. Latest designs.
7. Today designs.
8. Tomorrow designs when available.
9. Filtered design results and complete loading, empty, and error states.

The website should use the same catalog meaning and live records, while keeping a layout designed for desktop and responsive web rather than copying the mobile screen literally.

## Important catalog rule

The catalog hierarchy is:

`Machine -> Machine Type -> Category -> Design Type`

The Home page should begin with top-level **Machines**. Machine Types belong inside the machine browse/filter flow and must not be presented as if they are Machines.

## Restoration order

### 1. Browse by Machines

Priority: First

Status: Implemented locally; live deployment verification pending

Restore the template's machine discovery section, replacing the current `Browse by machine type` section.

Requirements:

- Load active Machines from the live catalog API.
- Show the machine image when available.
- Show the machine name.
- Use a clean responsive card layout based on the AI Studio template.
- A card click must open Explore with that Machine applied.
- Explore must show only designs belonging to the selected Machine.
- Machine Type remains available as the next-level filter.
- Include loading, empty-image fallback, empty-data, and API-error states.
- Keep the selected Machine in the URL so the page can be shared or refreshed.

Backend/API work required:

- Use `GET /api/v1/catalog/machines` or extend the public browse-filter response with Machines.
- Add a public Machine filter to `GET /api/v1/designs` if it is not already supported by the listing contract.

Acceptance checklist:

- [x] Home displays Machines, not Machine Types.
- [x] Cards use real names and images, with an icon fallback when an image is absent.
- [x] Selecting a Machine opens filtered Explore results.
- [x] Refreshing the filtered URL preserves the selection.
- [x] Machine Types shown afterward belong to the selected Machine.
- [x] No hard-coded Machine records remain in the active UI.
- [ ] Live deployment has been pulled and verified with production catalog records.

Implementation notes:

- `GET /api/v1/catalog/browse-filters` now includes top-level Machines and their Machine Type relationships.
- `GET /api/v1/designs` accepts `machine_id` and supports both current direct Machine assignments and legacy Machine Type relationships.
- Home renders responsive live Machine cards using the API image when available.
- Explore stores the Machine in the `machine` URL parameter, sends it as `machine_id`, and narrows Machine Types and Categories accordingly.
- Backend feature tests and the frontend production build pass locally.

### 2. Category discovery cards

Priority: Second

Status: Not started

Improve the current category pills using the useful card treatment from the AI Studio template.

Requirements:

- Use live categories and stable public IDs.
- Show only categories valid for the selected Machine when applicable.
- Open Explore with the selected category applied.
- Do not display invented file-format claims below a category.

Acceptance checklist:

- [ ] Category cards come from the API.
- [ ] Machine/category relationships are respected.
- [ ] Category URLs remain shareable and refresh-safe.

### 3. Live design feed sections

Priority: Third

Status: Not started

Restore more visual depth without duplicating the same records under fake marketing labels.

Approved sections:

- Latest designs.
- Today.
- Tomorrow, only when records exist.
- Category-specific sections returned by the Home API, when useful.

Requirements:

- Use `GET /api/v1/home` data.
- Reuse the production `DesignCard` component.
- Every section must have a working View all action with the correct filter.
- Hide optional empty sections instead of filling them with mock designs.

Acceptance checklist:

- [ ] Each visible section has a real API source.
- [ ] The same static demo array is never reused across sections.
- [ ] View all opens the correct Explore results.

### 4. Design folders / collections

Priority: Fourth

Status: Basic live section exists; visual enhancement pending

Keep the visually useful collection presentation but map it to real purchasable folders.

Requirements:

- Use live folder cover, name, price, and file count.
- Use `CollectionCard` consistently.
- Do not show original prices, percentage savings, or bundle composition unless supplied by the backend.
- Link to the real folder detail route.

Acceptance checklist:

- [ ] All folder information comes from the API.
- [ ] No fake discount or savings copy is visible.
- [ ] Empty folders do not leave a large blank Home section.

### 5. Buyer How It Works

Priority: Fifth

Status: Basic version exists; content and styling enhancement pending

Keep this as approved static explanatory content:

1. Find and filter designs.
2. Review machine and specification details.
3. Purchase securely and download after confirmed payment.

Do not promise unsupported guarantees, universal file formats, refunds, or tax treatment.

### 6. Seller call to action

Priority: Sixth

Status: Basic version exists; enhancement pending

Requirements:

- Guest: sign in or register.
- Seller: open My Studio.
- Buyer without seller permissions: explain how to start selling only when that onboarding flow is approved.
- Do not show fixed payout percentages or settlement timing; both are controlled by backend settings and seller settlement mode.

### 7. Creator/studio discovery

Priority: Future

Status: Blocked by public seller-profile contract

The template's creator cards are visually useful, but they must remain hidden until the backend provides approved public fields such as seller name, avatar, biography, location, design count, and public profile URL.

Ratings, reviews, sales totals, verification badges, and seller rankings require their own real data and business rules.

### 8. Trending, popular, and featured sections

Priority: Future

Status: Blocked by ranking/curation rules

Do not infer popularity in the browser. Restore these sections only after the backend defines one of the following:

- Admin-curated featured records.
- Real popularity ranking.
- Real purchase/view statistics with an approved calculation.

## Template elements to keep

- Editorial cream, stone, ink, and amber visual language.
- Strong hero layout and clear search action.
- Compact Machine and Category cards.
- Consistent section headers and View all actions.
- Responsive design grids.
- Clear buyer and seller paths.
- Loading skeletons, empty states, retry actions, and keyboard focus states.

## Template elements not to restore yet

- `2,400+ Designs` or any other hard-coded marketplace count.
- Fake ratings, reviews, sales totals, or creator profiles.
- Invented testimonials or company/person names.
- `Zero Thread-Break Guarantee`.
- Unverified machine-testing or calibration claims.
- Claims that every purchase contains fixed formats such as EMB, DST, and PES.
- Fixed seller payout percentages or fixed settlement frequency.
- Fake discounts, original prices, or savings percentages.
- Image search until the product decision and search service are finalized.

## Implementation rule for every restored section

Before coding a section, record:

1. Its API endpoint or approved static-content source.
2. Its loading state.
3. Its empty state.
4. Its error and retry behavior.
5. Its click destination and URL parameters.
6. Its mobile, tablet, and desktop layout.
7. Whether it is safe for guests.

A section is complete only when its content and actions work against the live API; visual presence alone is not completion.

## Immediate next task

Implement **Browse by Machines** end to end:

1. Confirm or add the public Machine listing/filter contract.
2. Add the typed Machine response to the frontend API layer.
3. Replace the Home Machine Type section with Machine cards.
4. Add Machine selection to Explore and synchronize it with the URL.
5. Build and test desktop, tablet, and mobile layouts.
6. Deploy and verify with live catalog records.
