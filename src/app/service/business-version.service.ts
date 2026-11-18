import { Injectable } from '@angular/core';

export interface BusinessVersionSnapshot {
  name: string;
  emailId: string;
  description: string;
  location: string;
  categoryID: string;
  subCategoryID: string;
}

export interface BusinessVersionChange {
  field: keyof BusinessVersionSnapshot;
  label: string;
  previous: string;
  current: string;
}

export interface BusinessVersion {
  id: string;
  createdAt: string;
  actor: string;
  before: BusinessVersionSnapshot;
  after: BusinessVersionSnapshot;
  changes: BusinessVersionChange[];
}

const versionFields: Array<{ field: keyof BusinessVersionSnapshot; label: string }> = [
  { field: 'name', label: 'Business name' },
  { field: 'emailId', label: 'Email' },
  { field: 'description', label: 'Description' },
  { field: 'location', label: 'Location' },
  { field: 'categoryID', label: 'Category' },
  { field: 'subCategoryID', label: 'Subcategory' }
];

@Injectable({ providedIn: 'root' })
export class BusinessVersionService {
  private readonly maxVersionsPerBusiness = 50;

  getVersions(businessId: number): BusinessVersion[] {
    try {
      const stored = localStorage.getItem(this.storageKey(businessId));
      const versions: unknown = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(versions)) {
        return [];
      }

      return (versions as BusinessVersion[]).slice().sort((left, right) => {
        const leftTime = Date.parse(left.createdAt);
        const rightTime = Date.parse(right.createdAt);
        if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
          return 0;
        }
        return rightTime - leftTime;
      });
    } catch {
      return [];
    }
  }

  recordVersion(
    businessId: number,
    actor: string,
    before: BusinessVersionSnapshot,
    after: BusinessVersionSnapshot
  ): boolean {
    const changes = versionFields
      .filter(({ field }) => before[field] !== after[field])
      .map(({ field, label }) => ({
        field,
        label,
        previous: before[field],
        current: after[field]
      }));

    if (changes.length === 0) {
      return true;
    }

    const version: BusinessVersion = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
      actor,
      before: { ...before },
      after: { ...after },
      changes
    };

    try {
      const versions = this.getVersions(businessId);
      localStorage.setItem(
        this.storageKey(businessId),
        JSON.stringify([version, ...versions].slice(0, this.maxVersionsPerBusiness))
      );
      return true;
    } catch {
      return false;
    }
  }

  private storageKey(businessId: number): string {
    return `business-version-history:${businessId}`;
  }
}