import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { RegisterbusinessComponent } from './registerbusiness.component';
import { BusinessService } from '../service/business.service';

describe('RegisterbusinessComponent', () => {
  let component: RegisterbusinessComponent;
  let fixture: ComponentFixture<RegisterbusinessComponent>;
  let businessService: jasmine.SpyObj<BusinessService>;

  beforeEach(async () => {
    businessService = jasmine.createSpyObj<BusinessService>('BusinessService', [
      'getCategories',
      'getSubCategories',
      'checkEmailExistsBusiness',
      'registerBusiness'
    ]);

    businessService.getCategories.and.returnValue(of([]));
    businessService.getSubCategories.and.returnValue(of([]));
    businessService.checkEmailExistsBusiness.and.returnValue(of(false));
    businessService.registerBusiness.and.returnValue(of({ success: true }));

    await TestBed.configureTestingModule({
      imports: [RegisterbusinessComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [{ provide: BusinessService, useValue: businessService }]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterbusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
