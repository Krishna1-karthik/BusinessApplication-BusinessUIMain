import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusinessService } from '../service/business.service';

interface BusinessSearchResult {
  businessID: number;
  name: string;
  description?: string;
  location?: string;
}

@Component({
  selector: 'app-business-name-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './business-name-search.component.html',
  styleUrl: './business-name-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessNameSearchComponent {
  readonly searchQuery = new FormControl('', { nonNullable: true });
  readonly businesses = signal<BusinessSearchResult[]>([]);
  readonly isLoading = signal(false);
  readonly hasSearched = signal(false);
  readonly validationMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  constructor(private readonly businessService: BusinessService) {}

  onSubmit(): void {
    if (this.isLoading()) {
      return;
    }

    const name = this.searchQuery.value;
    if (!name.trim()) {
      this.validationMessage.set('Enter a business name to search.');
      this.errorMessage.set(null);
      this.hasSearched.set(false);
      this.businesses.set([]);
      return;
    }

    this.validationMessage.set(null);
    this.errorMessage.set(null);
    this.businesses.set([]);
    this.hasSearched.set(false);
    this.isLoading.set(true);

    this.businessService.searchBusinessesByName(name).subscribe({
      next: businesses => {
        this.businesses.set(businesses);
        this.hasSearched.set(true);
        this.isLoading.set(false);
      },
      error: error => {
        console.error('Error searching businesses by name:', error);
        this.errorMessage.set('Unable to search businesses. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
