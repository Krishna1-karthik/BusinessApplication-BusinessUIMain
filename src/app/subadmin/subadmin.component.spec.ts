import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { SubadminComponent } from './subadmin.component';

describe('SubadminComponent', () => {
  let component: SubadminComponent;
  let fixture: ComponentFixture<SubadminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubadminComponent],
      providers: [provideHttpClient(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
