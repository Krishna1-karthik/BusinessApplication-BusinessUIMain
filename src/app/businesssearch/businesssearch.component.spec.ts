import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BusinesssearchComponent } from './businesssearch.component';
import { BusinessService } from '../service/business.service';
import { AuthService } from '../service/auth.service';

describe('BusinesssearchComponent', () => {
  let component: BusinesssearchComponent;
  let fixture: ComponentFixture<BusinesssearchComponent>;
  let businessService: jasmine.SpyObj<BusinessService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    localStorage.clear();
    businessService = jasmine.createSpyObj<BusinessService>('BusinessService', ['getCategories', 'getCustomerDetailsByID']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getEmailFromToken', 'getEmailIDFromToken', 'getRoleIdFromToken']);

    authService.getEmailFromToken.and.returnValue('1');
    authService.getEmailIDFromToken.and.returnValue('test@example.com');
    authService.getRoleIdFromToken.and.returnValue('1');
    businessService.getCategories.and.returnValue(of([]));
    businessService.getCustomerDetailsByID.and.returnValue(of([{ latitude: 12.34, longitude: 56.78 }]));

    await TestBed.configureTestingModule({
      imports: [BusinesssearchComponent],
      providers: [
        { provide: BusinessService, useValue: businessService },
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BusinesssearchComponent);
    component = fixture.componentInstance;
    component['businessService'] = businessService;
    component['authservice'] = authService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('update pagination with values', () => {
    component.businessList.length = 100;
    component.itemsPerPage = 10;
    component.updatePagination();
    expect(component.totalPages).toEqual(10);
    expect(component.isPaginationVisible).toEqual(true);
  });

  it('update pagination with no values', () => {
    component.businessList.length = 0;
    component.itemsPerPage = 10;
    component.updatePagination();
    expect(component.totalPages).toEqual(0);
    expect(component.isPaginationVisible).toEqual(false);
  });

  it('pagination previous button disable if current page in one', () => {
    component.currentPage = 1;
    component.isPaginationVisible = true;
    fixture.detectChanges();
    const previousButton = fixture.debugElement.nativeElement.querySelector('#previous-button');
    expect(previousButton.disabled).toEqual(true);
  });

  it('pagination next button disable if current page is equal to total count', () => {
    component.currentPage = 1;
    component.isPaginationVisible = true;
    fixture.detectChanges();
    const nextButton = fixture.debugElement.nativeElement.querySelector('#next-button');
    expect(nextButton.disabled).toEqual(true);
  });

  it('pagination page display', () => {
    component.currentPage = 1;
    component.totalPages = 10;
    component.isPaginationVisible = true;
    fixture.detectChanges();
    const pageDisplay = fixture.debugElement.nativeElement.querySelector('#page-display').textContent;
    expect(pageDisplay).toEqual('Page 1 of 10');
  });

  it('pagination call previous button', () => {
    component.isPaginationVisible = true;
    component.currentPage = 10;
    fixture.detectChanges();
    spyOn(component, 'previousPage');
    const previousButton = fixture.debugElement.nativeElement.querySelector('#previous-button');
    previousButton.click();
    expect(component.previousPage).toHaveBeenCalledTimes(1);
  });

  it('pagination call next button', () => {
    component.isPaginationVisible = true;
    component.totalPages = 100;
    component.currentPage = 1;
    fixture.detectChanges();
    spyOn(component, 'nextPage');
    const nextButton = fixture.debugElement.nativeElement.querySelector('#next-button');
    nextButton.click();
    expect(component.nextPage).toHaveBeenCalledTimes(1);
  });

  it('Customer Detail check service is called with right input', () => {
    businessService.getCustomerDetailsByID.calls.reset();
    component.cusId = 1;

    component.getCustomerDetails();

    expect(businessService.getCustomerDetailsByID).toHaveBeenCalled();
    expect(businessService.getCustomerDetailsByID.calls.mostRecent().args[0]).toBe(1);
  });

  it('Customer Detail call populates customer data', () => {
    const response = [{ latitude: 12.34, longitude: 56.78 }];
    businessService.getCustomerDetailsByID.calls.reset();
    businessService.getCustomerDetailsByID.and.returnValue(of(response));
    component.cusId = 1;

    component.getCustomerDetails();

    expect(businessService.getCustomerDetailsByID).toHaveBeenCalled();
    expect(businessService.getCustomerDetailsByID.calls.mostRecent().args[0]).toBe(1);
    expect(component.customerData).toEqual(response);
    expect(localStorage.getItem('customerLatitude')).toBe('12.34');
    expect(localStorage.getItem('customerLongitude')).toBe('56.78');
  });
});
