import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

const businessId = 42;
const historyKey = `business-version-history:${businessId}`;
const businessProfile = {
  businessID: businessId,
  name: 'Corner Bakery',
  emailId: 'owner@example.com',
  description: 'Fresh bread every morning',
  location: '1 Main Street',
  categoryID: 1,
  subCategoryID: 2,
  latitude: 37.77,
  longitude: -122.42
};

let savedHistory: unknown[] = [];

function tokenFor(email: string): string {
  const payload = btoa(JSON.stringify({ EmailId: email }))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `header.${payload}.signature`;
}

function createRevision(previousName: string, currentName: string, id: string, createdAt: string) {
  const before = { ...businessProfile, name: previousName };
  const after = { ...businessProfile, name: currentName };

  return {
    id,
    createdAt,
    actor: 'owner@example.com',
    before,
    after,
    changes: [{
      field: 'name',
      label: 'Business name',
      previous: previousName,
      current: currentName
    }]
  };
}

Given('the business has no saved revisions', () => {
  savedHistory = [];
});

Given('the business has a saved revision from {string} to {string}', (previousName: string, currentName: string) => {
  savedHistory = [createRevision(previousName, currentName, 'revision-1', '2026-10-07T12:00:00.000Z')];
});

Given('the business has two saved revisions', () => {
  savedHistory = [
    createRevision('Corner Bakery', 'Corner Bakery North', 'revision-1', '2026-10-07T12:00:00.000Z'),
    createRevision('Corner Bakery North', 'Corner Bakery Downtown', 'revision-2', '2026-10-07T13:00:00.000Z')
  ];
});

When('I open the business edit page', () => {
  cy.intercept('GET', '**/api/Business/GetCategories', {
    body: [{ categoryID: 1, categoryName: 'Food' }]
  }).as('getCategories');
  cy.intercept('GET', `**/api/Business/getbusinessdetailbyid/${businessId}`, {
    body: [businessProfile]
  }).as('getBusiness');
  cy.intercept('GET', '**/api/Business/GetSubCategories/1', {
    body: [{ subCategoryID: 2, subCategoryName: 'Bakery' }]
  }).as('getSubCategories');

  cy.visit('/edit-user', {
    onBeforeLoad(window) {
      window.localStorage.setItem('roleId', '3');
      window.localStorage.setItem('domainID', String(businessId));
      window.localStorage.setItem('token', tokenFor('owner@example.com'));
      if (savedHistory.length > 0) {
        window.localStorage.setItem(historyKey, JSON.stringify(savedHistory));
      } else {
        window.localStorage.removeItem(historyKey);
      }
    }
  });

  cy.wait(['@getCategories', '@getBusiness', '@getSubCategories']);
});

Then('I see that no business changes have been saved', () => {
  cy.contains('No saved business changes yet.').should('be.visible');
});

Then('I see the revision by {string} from {string} to {string}', (
  actor: string,
  previousName: string,
  currentName: string
) => {
  cy.get('.version-entry').should('have.length', 1).within(() => {
    cy.contains(actor).should('be.visible');
    cy.contains('Business name').should('be.visible');
    cy.contains(`${previousName} to ${currentName}`).should('be.visible');
    cy.contains('button', 'Load this version into the form').should('be.enabled');
  });
});

Then('the newest revision is {string}', (businessName: string) => {
  cy.get('.version-entry').first().should('contain', businessName);
});

Then('the older revision is {string}', (businessName: string) => {
  cy.get('.version-entry').last().should('contain', businessName);
});