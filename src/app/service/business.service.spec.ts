import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { BusinessService } from './business.service';

describe('BusinessService', () => {
  let service: BusinessService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(BusinessService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('searches businesses by name using the supplied query', () => {
    const businesses = [{ businessID: 1, name: 'ABC Consulting' }];
    let result: unknown;

    service.searchBusinessesByName('ABC Consulting').subscribe(value => result = value);

    const request = httpTestingController.expectOne(request => {
      const url = new URL(request.url);
      return url.pathname.endsWith('/Business/search-by-name') &&
        url.searchParams.get('name') === 'ABC Consulting';
    });
    expect(request.request.method).toBe('GET');
    request.flush(businesses);
    expect(result).toEqual(businesses);
  });

  it('surfaces business name search failures', () => {
    let receivedError: unknown;

    service.searchBusinessesByName('ABC Consulting').subscribe({
      error: error => receivedError = error
    });

    const request = httpTestingController.expectOne(request => {
      const url = new URL(request.url);
      return url.pathname.endsWith('/Business/search-by-name') &&
        url.searchParams.get('name') === 'ABC Consulting';
    });
    request.flush('Search failed', { status: 500, statusText: 'Server Error' });
    expect(receivedError).toEqual(jasmine.objectContaining({ status: 500 }));
  });

  it('caches categories for subsequent subscribers', () => {
    const categories = [{ categoryID: 1 }];
    let firstResult: unknown;
    let secondResult: unknown;
    service.getCategories().subscribe(result => firstResult = result);
    service.getCategories().subscribe(result => secondResult = result);

    httpTestingController.expectOne(request => request.url.endsWith('/Business/GetCategories')).flush(categories);
    expect(firstResult).toEqual(categories);
    expect(secondResult).toEqual(categories);

    service.getCategories().subscribe(result => expect(result).toEqual(categories));
    httpTestingController.expectNone(request => request.url.endsWith('/Business/GetCategories'));
  });

  it('caches subcategories separately by category', () => {
    const subcategories = [{ subCategoryID: 2 }];
    let firstResult: unknown;
    let secondResult: unknown;
    service.getSubCategories(1).subscribe(result => firstResult = result);
    service.getSubCategories(1).subscribe(result => secondResult = result);
    service.getSubCategories(2).subscribe();

    httpTestingController.expectOne(request => request.url.endsWith('/Business/GetSubCategories/1')).flush(subcategories);
    httpTestingController.expectOne(request => request.url.endsWith('/Business/GetSubCategories/2')).flush([]);
    expect(firstResult).toEqual(subcategories);
    expect(secondResult).toEqual(subcategories);
  });

  it('reuses an in-flight/cached distance matrix request for identical coordinates', () => {
    const destinations = [{ latitude: 10, longitude: 20 }];
    let firstResult: unknown;
    let secondResult: unknown;
    service.getDistances(8, 9, destinations).subscribe(result => firstResult = result);
    service.getDistances(8, 9, destinations).subscribe(result => secondResult = result);

    httpTestingController.expectOne(request => request.url.includes('distancematrix/json')).flush({ rows: [] });
    expect(firstResult).toEqual({ rows: [] });
    expect(secondResult).toEqual({ rows: [] });
    service.getDistances(8, 9, destinations).subscribe(result => expect(result).toEqual({ rows: [] }));
    httpTestingController.expectNone(request => request.url.includes('distancematrix/json'));
  });
});
