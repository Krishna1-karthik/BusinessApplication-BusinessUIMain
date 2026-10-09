import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { BusinessService } from '../service/business.service';
import { BusinessNameSearchComponent } from './business-name-search.component';

describe('BusinessNameSearchComponent', () => {
  let component: BusinessNameSearchComponent;
  let fixture: ComponentFixture<BusinessNameSearchComponent>;
  let businessService: jasmine.SpyObj<BusinessService>;

  beforeEach(async () => {
    businessService = jasmine.createSpyObj<BusinessService>('BusinessService', ['searchBusinessesByName']);
    businessService.searchBusinessesByName.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BusinessNameSearchComponent],
      providers: [{ provide: BusinessService, useValue: businessService }]
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessNameSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts with an empty search input', () => {
    const input = fixture.nativeElement.querySelector('#business-name') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('sends the entered query and displays the matching businesses', () => {
    const businesses = [{ businessID: 1, name: 'ABC Consulting', description: 'Consulting services' }];
    businessService.searchBusinessesByName.and.returnValue(of(businesses));
    component.searchQuery.setValue('ABC Consulting');

    component.onSubmit();
    fixture.detectChanges();

    expect(businessService.searchBusinessesByName).toHaveBeenCalledOnceWith('ABC Consulting');
    expect(fixture.nativeElement.textContent).toContain('ABC Consulting');
    expect(component.isLoading()).toBe(false);
  });

  it('shows a loading state while the request is pending', () => {
    const request = new Subject<unknown[]>();
    businessService.searchBusinessesByName.and.returnValue(request as Observable<unknown[]>);
    component.searchQuery.setValue('ABC Consulting');

    component.onSubmit();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('Searching businesses');

    request.next([{ businessID: 1, name: 'ABC Consulting' }]);
    request.complete();
    fixture.detectChanges();
    expect(component.isLoading()).toBe(false);
  });

  it('rejects empty and whitespace-only queries without sending a request', () => {
    component.searchQuery.setValue('   ');

    component.onSubmit();
    fixture.detectChanges();

    expect(businessService.searchBusinessesByName).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Enter a business name to search.');
  });

  it('shows an empty state when a successful search has no matches', () => {
    component.searchQuery.setValue('ABC Consulting');

    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No businesses found');
    expect(component.isLoading()).toBe(false);
  });

  it('shows an error and allows retry after a failed search', () => {
    businessService.searchBusinessesByName.and.returnValues(
      throwError(() => new Error('Request failed')),
      of([{ businessID: 1, name: 'ABC Consulting' }])
    );
    component.searchQuery.setValue('ABC Consulting');
    spyOn(console, 'error');

    component.onSubmit();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Unable to search businesses. Please try again.');

    component.onSubmit();
    fixture.detectChanges();

    expect(businessService.searchBusinessesByName).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).toContain('ABC Consulting');
  });
});
