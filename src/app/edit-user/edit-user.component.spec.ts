import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { BusinessService } from '../service/business.service';
import { AuthService } from '../service/auth.service';
import { BusinessVersionService, BusinessVersionSnapshot } from '../service/business-version.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EditUserComponent } from './edit-user.component';

describe('EditUserComponent', () => {
  let component: EditUserComponent;
  let businessService: jasmine.SpyObj<BusinessService>;
  let businessVersionService: jasmine.SpyObj<BusinessVersionService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const before: BusinessVersionSnapshot = {
    name: 'Old name',
    emailId: 'old@example.com',
    description: 'Old description',
    location: 'Old location',
    categoryID: '1',
    subCategoryID: '2'
  };

  beforeEach(() => {
    businessService = jasmine.createSpyObj<BusinessService>('BusinessService', ['updateBusinessDetails']);
    businessVersionService = jasmine.createSpyObj<BusinessVersionService>(
      'BusinessVersionService',
      ['recordVersion', 'getVersions']
    );
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getEmailIDFromToken']);
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    businessService.updateBusinessDetails.and.returnValue(of(true));
    businessVersionService.recordVersion.and.returnValue(true);
    businessVersionService.getVersions.and.returnValue([]);
    authService.getEmailIDFromToken.and.returnValue('editor@example.com');
    spyOn(Swal, 'fire');

    component = new EditUserComponent(
      new FormBuilder(),
      businessService,
      businessVersionService,
      authService,
      router
    );
    component.domainID = 42;
    component.businessDetails = [{
      name: before.name,
      emailId: before.emailId,
      description: before.description,
      location: before.location,
      categoryID: 1,
      subCategoryID: 2
    }];
    component.editBusinessForm = new FormBuilder().group({
      name: ['New name'],
      emailId: ['new@example.com'],
      description: ['New description'],
      location: ['New location'],
      categoryID: ['3'],
      subCategoryID: ['4']
    });
  });

  it('records the before and after snapshots after a successful business save', () => {
    component.submitBusinessForm();

    expect(businessVersionService.recordVersion).toHaveBeenCalledWith(42, 'editor@example.com', before, {
      name: 'New name',
      emailId: 'new@example.com',
      description: 'New description',
      location: 'New location',
      categoryID: '3',
      subCategoryID: '4'
    });
  });

  it('does not record a version when the business save fails', () => {
    businessService.updateBusinessDetails.and.returnValue(of(false));

    component.submitBusinessForm();

    expect(businessVersionService.recordVersion).not.toHaveBeenCalled();
  });

  it('loads a selected version into the form without submitting it', () => {
    const restored = { ...before, name: 'Restored name' };

    component.loadVersion({
      id: 'revision-1',
      createdAt: '2026-10-07T00:00:00.000Z',
      actor: 'editor@example.com',
      before,
      after: restored,
      changes: []
    });

    expect(component.editBusinessForm.getRawValue()).toEqual(restored);
    expect(businessService.updateBusinessDetails).not.toHaveBeenCalled();
  });
});
