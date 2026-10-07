import { BusinessVersionService, BusinessVersionSnapshot } from './business-version.service';

describe('BusinessVersionService', () => {
  let service: BusinessVersionService;
  const businessId = 745812;
  const original: BusinessVersionSnapshot = {
    name: 'Original name',
    emailId: 'owner@example.com',
    description: 'Original description',
    location: 'Original location',
    categoryID: '1',
    subCategoryID: '2'
  };

  beforeEach(() => {
    service = new BusinessVersionService();
    localStorage.removeItem(`business-version-history:${businessId}`);
  });

  afterEach(() => {
    localStorage.removeItem(`business-version-history:${businessId}`);
  });

  it('stores the before and after snapshots with only changed fields', () => {
    const updated = { ...original, name: 'Updated name' };

    expect(service.recordVersion(businessId, 'owner@example.com', original, updated)).toBeTrue();

    const [version] = service.getVersions(businessId);
    expect(version.before).toEqual(original);
    expect(version.after).toEqual(updated);
    expect(version.actor).toBe('owner@example.com');
    expect(version.changes).toEqual([{
      field: 'name',
      label: 'Business name',
      previous: 'Original name',
      current: 'Updated name'
    }]);
  });

  it('does not create a revision when no fields changed', () => {
    expect(service.recordVersion(businessId, 'owner@example.com', original, { ...original })).toBeTrue();
    expect(service.getVersions(businessId)).toEqual([]);
  });

  it('returns revisions newest first and keeps at most 50', () => {
    for (let index = 0; index < 51; index++) {
      const before = { ...original, name: `Business ${index}` };
      const after = { ...original, name: `Business ${index + 1}` };
      service.recordVersion(businessId, 'owner@example.com', before, after);
    }

    const versions = service.getVersions(businessId);
    expect(versions.length).toBe(50);
    expect(versions[0].after.name).toBe('Business 51');
    expect(versions[49].after.name).toBe('Business 2');
  });

  it('returns an empty history when stored data is malformed', () => {
    localStorage.setItem(`business-version-history:${businessId}`, '{invalid json');

    expect(service.getVersions(businessId)).toEqual([]);
  });
});