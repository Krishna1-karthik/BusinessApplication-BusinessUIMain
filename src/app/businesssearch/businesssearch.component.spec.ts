import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BusinesssearchComponent } from './businesssearch.component';
import { BusinessService } from '../service/business.service';
describe('BusinesssearchComponent', () => {
  let component: BusinesssearchComponent;
  let fixture: ComponentFixture<BusinesssearchComponent>;
  let buisnessService: jasmine.SpyObj<BusinessService>;
  beforeEach(async () => {
    buisnessService = jasmine.createSpyObj<BusinessService>('BusinessService', [
      'getCustomerDetailsByID',
      'getCategories'
    ]);
    buisnessService.getCustomerDetailsByID.and.returnValue(of([{ latitude: 8.3, longitude: 9.3 }]));
    buisnessService.getCategories.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BusinesssearchComponent]
    })
    .overrideComponent(BusinesssearchComponent, {
      set: { providers: [{ provide: BusinessService, useValue: buisnessService }] }
    })
    .compileComponents(); 
    
    fixture = TestBed.createComponent(BusinesssearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    buisnessService.getCustomerDetailsByID.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('update pagination with values',()=>{
    component.businessList.set(Array.from({ length: 100 }, (_, businessID) => ({ businessID })));
    component.itemsPerPage =10;
    component.updatePagination();
    expect(component.totalPages()).toEqual(10);
    expect(component.isPaginationVisible()).toEqual(true);
  })
  it('update pagination with no values',()=>{
    component.businessList.set([]);
    component.itemsPerPage =10;
    component.updatePagination();
    expect(component.totalPages()).toEqual(0);
    expect(component.isPaginationVisible()).toEqual(false);
  })
  it('pagination previous button disable if current page in one',()=>{
    component.businessList.set(Array.from({ length: 20 }, (_, businessID) => ({ businessID })));
    component.currentPage.set(1);
    fixture.detectChanges();
    const previouButton =fixture.debugElement.nativeElement.querySelector('#previous-button');
    expect(previouButton.disabled).toEqual(true);
  })
  it('pagination next button disable if current page is equal to total count',()=>{
    component.businessList.set(Array.from({ length: 20 }, (_, businessID) => ({ businessID })));
    component.currentPage.set(2);
    fixture.detectChanges();
    const previouButton =fixture.debugElement.nativeElement.querySelector('#next-button');
    expect(previouButton.disabled).toEqual(true);
  })
  it('pagination page display',()=>{
    component.businessList.set(Array.from({ length: 100 }, (_, businessID) => ({ businessID })));
    component.currentPage.set(1);
    fixture.detectChanges();
    const pageDispaly =fixture.debugElement.nativeElement.querySelector('#page-display').textContent;
    expect(pageDispaly).toEqual('Page 1 of 10');
  })
  it('pagination call previous button',()=>{
    component.businessList.set(Array.from({ length: 100 }, (_, businessID) => ({ businessID })));
    component.currentPage.set(10);
    fixture.detectChanges();
    spyOn(component,'previousPage');
    const previouButton = fixture.debugElement.nativeElement.querySelector('#previous-button');
    previouButton.click();
    expect(component.previousPage).toHaveBeenCalledTimes(1);
  })
  it('pagination call next button',()=>{
    component.businessList.set(Array.from({ length: 1000 }, (_, businessID) => ({ businessID })));
    component.currentPage.set(1);
    fixture.detectChanges();
    spyOn(component,'nextPage');
    const previouButton = fixture.debugElement.nativeElement.querySelector('#next-button');
    previouButton.click();
    expect(component.nextPage).toHaveBeenCalledTimes(1);
  })
  it('Customer Detail check service is called with right input',()=>{
    component.cusId =1;
    component.getCustomerDetails();
    expect(buisnessService.getCustomerDetailsByID).toHaveBeenCalledOnceWith(component.cusId);

  })
  it('stores customer details returned by the service',()=>{
    component.cusId =1;
    const customerDetails = [{ latitude: 10, longitude: 20 }];
    buisnessService.getCustomerDetailsByID.and.returnValue(of(customerDetails));

    component.getCustomerDetails();

    expect(component.customerData).toEqual(customerDetails);
  });
});
