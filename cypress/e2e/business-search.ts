import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const matchingBusinesses = [
  {
    businessID: 1,
    name: 'ABC Consulting',
    description: 'Business consulting services',
    location: '1 Main Street'
  }
];

let queuedResponses: Cypress.StaticResponse[] = [];

function matchingBusinessesResponse(): Cypress.StaticResponse {
  return { statusCode: 200, body: matchingBusinesses };
}

Given('the search service returns matching businesses', () => {
  queuedResponses = [matchingBusinessesResponse()];
});

Given('the search service returns no matching businesses', () => {
  queuedResponses = [{ statusCode: 200, body: [] }];
});

Given('the search service fails once then returns matching businesses', () => {
  queuedResponses = [
    { statusCode: 500, body: { message: 'Search unavailable' } },
    matchingBusinessesResponse()
  ];
});

Given('the BusinessSearch component is displayed', () => {
  cy.intercept('GET', '**/api/Business/search-by-name*', request => {
    const response = queuedResponses.shift() ?? matchingBusinessesResponse();
    request.reply({ ...response, delay: 300 });
  }).as('businessNameSearch');

  cy.visit('/BusinessNameSearch', {
    onBeforeLoad(window) {
      const payload = btoa(JSON.stringify({ EmailId: 'customer@example.com' }))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      window.localStorage.setItem('token', `header.${payload}.signature`);
    }
  });

  cy.contains('h1', 'Search Businesses by Name').should('be.visible');
});

Given('the search input is empty', () => {
  cy.get('#business-name').should('have.value', '');
});

When('the user enters {string}', (businessName: string) => {
  cy.get('#business-name').type(businessName);
});

When('submits the search', () => {
  cy.get('.search-form button[type="submit"]').click();
});

When('the user submits the empty search', () => {
  cy.get('.search-form button[type="submit"]').click();
});

When('the request succeeds', () => {
  cy.wait<Cypress.Interception>('@businessNameSearch').then(interception => {
    expect(interception.response?.statusCode).to.be.within(200, 299);
    cy.wrap(interception).as('completedBusinessNameSearch');
  });
});

When('the request fails', () => {
  cy.wait<Cypress.Interception>('@businessNameSearch').then(interception => {
    expect(interception.response?.statusCode).to.be.greaterThan(399);
  });
});

When('the user retries the search', () => {
  cy.get('.search-form button[type="submit"]').should('be.enabled').click();
});

Then('a loading state is displayed while the request is pending', () => {
  cy.contains('[role="status"]', 'Searching businesses...').should('be.visible');
});

Then('a search request should be sent with {string}', (businessName: string) => {
  cy.get<Cypress.Interception>('@completedBusinessNameSearch').then(interception => {
    expect(new URL(interception.request.url).searchParams.get('name')).to.equal(businessName);
  });
});

Then('the matching businesses should be displayed', () => {
  cy.contains('h3', 'ABC Consulting').should('be.visible');
  cy.contains('Business consulting services').should('be.visible');
});

Then('the loading state should no longer be displayed', () => {
  cy.contains('[role="status"]', 'Searching businesses...').should('not.exist');
});

Then('the user is prompted to enter a business name', () => {
  cy.contains('#search-feedback', 'Enter a business name to search.').should('be.visible');
});

Then('no business name search request is sent', () => {
  cy.get('@businessNameSearch.all').should('have.length', 0);
});

Then('the {string} message is displayed', (message: string) => {
  cy.contains('[role="status"]', message).should('be.visible');
});

Then('a search error is displayed', () => {
  cy.contains('#search-feedback', 'Unable to search businesses. Please try again.').should('be.visible');
});
