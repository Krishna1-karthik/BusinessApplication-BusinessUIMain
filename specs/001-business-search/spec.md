# Feature Specification: Business Search

**Feature Branch**: `001-business-search`
**Created**: 2026-10-08
**Status**: Draft
**Input**: User request: "As a developer I want to create a new component that supports searching for businesses and displays matching results."

## User Scenarios & Testing

### User Story 1 - Search for a business (Priority: P1)

As a user, I want to search for a business by name so that I can see matching businesses.

**Acceptance Scenarios**:

1. **Given** the BusinessSearch component is displayed and the search input is empty, **when** the user enters "ABC Consulting" and submits the search, **then** a search request is sent with "ABC Consulting".
2. **Given** a search request for "ABC Consulting" is pending, **when** the component is displaying the pending state, **then** a loading state is visible.
3. **Given** a search request for "ABC Consulting" is pending, **when** the request succeeds, **then** the matching businesses are displayed and the loading state is no longer visible.
4. **Given** the search input is empty or contains only whitespace, **when** the user attempts to submit the search, **then** no search request is sent and the component prompts the user to enter a business name.
5. **Given** a search request succeeds with no matching businesses, **when** the results are displayed, **then** the component shows a "No businesses found" message.
6. **Given** a search request fails, **when** the failure is received, **then** the component displays an error message, stops displaying the loading state, and allows the user to retry the search.

## Requirements

### Functional Requirements

- **FR-001**: The BusinessSearch component MUST display an initially empty text input for a business search query.
- **FR-002**: The user MUST be able to enter a business search query and submit it.
- **FR-003**: On submission, the component MUST send a search request containing the query as entered by the user.
- **FR-004**: While the search request is pending, the component MUST display a loading state.
- **FR-005**: When the search request succeeds, the component MUST display the matching businesses and stop displaying the loading state.
- **FR-006**: A business MUST match a query when its name contains the query as a case-insensitive substring.
- **FR-007**: The component MUST prevent submission when the query is empty or contains only whitespace, display a prompt to enter a business name, and send no request.
- **FR-008**: When a search request fails, the component MUST display an error message, stop displaying the loading state, and allow the user to retry.
- **FR-009**: When a search request succeeds with no matches, the component MUST display "No businesses found".

### Key Entities

- **Business search query**: The text entered by the user and sent with a search request.
- **Matching business**: A business returned by the search request and displayed in the results.

## Success Criteria

- **SC-001**: Submitting "ABC Consulting" sends a search request whose query is exactly "ABC Consulting".
- **SC-002**: The loading state is visible while the request is pending and is not visible after a successful response.
- **SC-003**: After a successful response, the displayed results correspond to the businesses returned by that response.
- **SC-004**: An empty or whitespace-only query sends no request and prompts the user to enter a business name.
- **SC-005**: A successful response with no matching businesses displays "No businesses found".
- **SC-006**: A failed request displays an error, clears the loading state, and leaves retry available.
- **SC-007**: Matching treats query and business-name casing as equivalent and accepts partial name matches.

## Clarifications

### Session 2026-10-08

- **No matching businesses**: Show a clear "No businesses found" empty state.
- **Request failure**: Show an error message, stop loading, and allow retry.
- **Empty or whitespace-only query**: Prevent submission and prompt for a business name; do not send a request.
- **Name matching**: Use case-insensitive partial matching on business name.
