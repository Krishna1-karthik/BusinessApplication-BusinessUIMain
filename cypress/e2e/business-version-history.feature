Feature: Business profile version history

  Scenario: Empty history for a business with no revisions
    Given the business has no saved revisions
    When I open the business edit page
    Then I see that no business changes have been saved

  Scenario: Show revision details
    Given the business has a saved revision from "Corner Bakery" to "Corner Bakery North"
    When I open the business edit page
    Then I see the revision by "owner@example.com" from "Corner Bakery" to "Corner Bakery North"

  Scenario: Show revisions newest first
    Given the business has two saved revisions
    When I open the business edit page
    Then the newest revision is "Corner Bakery Downtown"
    And the older revision is "Corner Bakery North"