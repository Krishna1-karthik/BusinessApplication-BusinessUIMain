import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { BusinessService } from '../service/business.service';
import { GoogleMapsLoaderService } from '../service/google-maps-loader.service';
import { RegisterbusinessComponent } from './registerbusiness.component';
import { BusinessService } from '../service/business.service';

describe('RegisterbusinessComponent', () => {
  let component: RegisterbusinessComponent;
  let fixture: ComponentFixture<RegisterbusinessComponent>;

  let businessService: jasmine.SpyObj<BusinessService>;

  beforeEach(async () => {
    businessService = jasmine.createSpyObj<BusinessService>('BusinessService', ['getCategories']);
    businessService.getCategories.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [RegisterbusinessComponent],
      providers: [
        provideRouter([]),
        { provide: GoogleMapsLoaderService, useValue: { load: () => Promise.resolve() } }
      ]
    })
    .overrideComponent(RegisterbusinessComponent, {
      set: { providers: [{ provide: BusinessService, useValue: businessService }] }
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegisterbusinessComponent);
    component = fixture.componentInstance;
    spyOn(component, 'getCurrentLocation');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
