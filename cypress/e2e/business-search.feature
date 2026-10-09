Feature: Business name search

  Scenario: Search for a business successfully
    Given the search service returns matching businesses
    And the BusinessSearch component is displayed
    And the search input is empty
    When the user enters "ABC Consulting"
    And submits the search
    Then a loading state is displayed while the request is pending
    When the request succeeds
    Then a search request should be sent with "ABC Consulting"
    And the matching businesses should be displayed
    And the loading state should no longer be displayed

  Scenario: Prevent submitting an empty search
    Given the search service returns matching businesses
    And the BusinessSearch component is displayed
    When the user submits the empty search
    Then the user is prompted to enter a business name
    And no business name search request is sent

  Scenario: Show an empty state when no businesses match
    Given the search service returns no matching businesses
    And the BusinessSearch component is displayed
    When the user enters "Unknown Business"
    And submits the search
    When the request succeeds
    Then the "No businesses found" message is displayed
    And the loading state should no longer be displayed

  Scenario: Allow retry after a search request fails
    Given the search service fails once then returns matching businesses
    And the BusinessSearch component is displayed
    When the user enters "ABC Consulting"
    And submits the search
    When the request fails
    Then a search error is displayed
    And the loading state should no longer be displayed
    When the user retries the search
    And the request succeeds
    Then the matching businesses should be displayed
    And the loading state should no longer be displayed
