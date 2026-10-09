# Tasks: Business Name Search

**Input**: [spec.md](./spec.md), [plan.md](./plan.md)

## Phase 1: API Contract

- [x] T001 Record the agreed client contract as `GET /Business/search-by-name?name=...`, returning a JSON array of businesses.
- [ ] T002 Verify the backend exposes the agreed endpoint and case-insensitive partial matching; coordinate an API change before deployment if it does not, rather than filtering category-search results.

## Phase 2: Business Search Service

- [x] T003 [P] Add a dedicated business-name search method to `src/app/service/business.service.ts`, preserving the existing category/subcategory `searchBusinesses` method.
- [x] T004 [P] Add service tests in `src/app/service/business.service.spec.ts` verifying the agreed endpoint and query encoding, successful response, and surfaced request failure.

## Phase 3: Name Search Component

- [x] T005 Create a standalone name-search component with template, styles, and reactive query input under `src/app/business-name-search/`.
- [x] T006 Implement submission validation so empty and whitespace-only queries send no request and show a prompt; send valid query text unchanged.
- [x] T007 Implement pending, success, no-results, and failure states: show loading while pending, render returned businesses on success, show "No businesses found" for an empty successful response, and show an error while allowing retry on failure.
- [x] T008 Add component tests in `src/app/business-name-search/business-name-search.component.spec.ts` covering input validation, request query, loading behavior, rendered results, empty response, and failure followed by retry.

## Phase 4: Routing and Verification

- [x] T009 Add a separately named lazy-loaded route for the new component in `src/app/app.routes.ts`, protected by `authGuard`; preserve the existing `/Businesssearch` route.
- [x] T010 Verify the existing category/subcategory search remains unchanged and run focused service/component tests (45 tests passed).
- [x] T011 Run `npm run build` and resolve any build or type-check failures introduced by this feature.
