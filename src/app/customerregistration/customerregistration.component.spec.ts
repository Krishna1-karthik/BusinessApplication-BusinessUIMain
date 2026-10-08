import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CustomerregistrationComponent } from './customerregistration.component';

describe('CustomerregistrationComponent', () => {
  let component: CustomerregistrationComponent;
  let fixture: ComponentFixture<CustomerregistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerregistrationComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerregistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CustomerregistrationComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
