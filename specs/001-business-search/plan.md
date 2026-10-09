# Implementation Plan: Business Name Search

**Branch**: `001-business-search` | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

## Summary

Add a standalone Angular component and authenticated route for searching businesses by name. Preserve the existing `/Businesssearch` category/subcategory experience. The new flow validates blank input, sends the entered query, exposes pending, error, empty-results, and success states, and renders matching businesses.

## Technical Context

- **Language/Version**: TypeScript 5.4, Angular 17
- **Primary dependencies**: Angular standalone components, Reactive Forms, Angular HttpClient, RxJS
- **Existing patterns**: Lazy-loaded routes in `src/app/app.routes.ts`; `OnPush` and signals in `src/app/businesssearch/businesssearch.component.ts`; HTTP calls in `src/app/service/business.service.ts`; Jasmine/Karma unit tests
- **Testing**: Focused component and service unit tests, followed by `npm run build` and the relevant Angular test suite
- **Target platform**: Existing Angular web application
- **Constraints**: Do not alter the current category/subcategory search behavior. Require authentication on the new route, consistent with the existing business search route.

## Architecture and Design

1. **New page component**: Add a standalone name-search component in its own `src/app` feature directory. Use a reactive text input, prevent empty and whitespace-only submissions, and retain the exact entered query when making a valid request.
2. **Search service integration**: Add a dedicated name-search method to `BusinessService`; leave `searchBusinesses(category, subcategory)` unchanged. The client calls `GET /Business/search-by-name?name=...` and expects a JSON array of businesses.
3. **API contract prerequisite**: The repository contains only the Angular client. Verify that the backend exposes the agreed endpoint and supports business-name substring matching without case sensitivity. If it does not, agree on or implement a backend endpoint/contract before completing deployment; filtering only the existing category/subcategory response would not satisfy global name search.
4. **Request states**: Track pending state explicitly. On success, render the returned businesses or the "No businesses found" empty state. On failure, clear pending state, show an error, and leave the form available for retry.
5. **Routing**: Register a separately named lazy-loaded route protected by `authGuard`; keep `/Businesssearch` and its component unchanged.

## Project Structure

```text
src/app/
├── business-name-search/
│   ├── business-name-search.component.ts
│   ├── business-name-search.component.html
│   ├── business-name-search.component.css
│   └── business-name-search.component.spec.ts
├── service/
│   ├── business.service.ts
│   └── business.service.spec.ts
└── app.routes.ts
specs/001-business-search/
├── spec.md
└── plan.md
```

## Implementation Sequence

1. Confirm the backend name-search endpoint, query parameter, response shape, and matching semantics; update or coordinate the backend contract if needed.
2. Add the name-search service method and tests verifying that the exact query is encoded and sent, and that the response/error is surfaced.
3. Implement the component UI and request states, including invalid-query prompt, loading indicator, results, no-results message, and retry after failure.
4. Add component tests for the accepted scenarios: successful request and results, pending state, blank/whitespace validation, empty response, and failed request followed by retry.
5. Register the authenticated lazy route without changing the existing business-search route; verify build and unit tests.

## Validation

- Confirm a valid submission sends the entered query unchanged.
- Confirm empty and whitespace-only input sends no request.
- Confirm pending, success, no-results, and error/retry states match the specification.
- Confirm matching is case-insensitive and partial according to the verified backend contract.
- Confirm the new route is guarded and the existing category/subcategory search remains unchanged.
- Run focused Jasmine/Karma tests and `npm run build`.

## Risks and Dependencies

- The backend implementation is not present in this repository. The client endpoint and query parameter are set to `GET /Business/search-by-name?name=...`; endpoint availability, response shape, and case-insensitive partial matching must be verified against the backend before deployment.
- The new page will have a separate route. Adding navigation to it is not required by the current specification and should be handled only if requested.
