import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, OnInit, Output, Renderer2, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessService } from '../service/business.service';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { forkJoin } from 'rxjs';
export interface Business {
  name: string;
  description: string;
  image: string;
  distanceKm: number;
}
@Component({
  selector: 'app-businesssearch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule, GoogleMap, MapMarker, FormsModule, HttpClientModule],
  templateUrl: './businesssearch.component.html',
  styleUrl: './businesssearch.component.css'
})
export class BusinesssearchComponent implements OnInit {
  title = 'starrating';
   rating = signal(0);
  maxStars: number = 5;
  readonly stars = [1, 2, 3, 4, 5];
  @Output() ratingChange = new EventEmitter<number>();
   buisnessRating ={
    businessID : 0,
    rating:0,
    ratedBy:'',
    comment:''
    
   }
   buisnessRatingList = signal<any[]>([]);
   ratingErrorMessage = signal(false);
  setRating(value: number): void {
    this.rating.set(value);
    this.ratingChange.emit(value);
  }
  searchForm !: FormGroup;
  categories = signal<any[]>([]);
  businessList = signal<any[]>([]);
  fileUpload: any;
  isTableVisible = signal(false);

  imageBaseUrl = 'https://businessnewenvironment.onrender.com/';
  //imageBaseUrl = 'https://localhost:7000/uploads/';

  latitudeDifference: number | null = null;
  longitudeDifference: number | null = null;

  center = signal<google.maps.LatLngLiteral>({ lat: 0, lng: 0 });
  zoom = 10;
  marker = signal<google.maps.LatLngLiteral | null>(null);

  // Variables to store selected category and subcategory objects
  selectedCategory = signal<any | null>(null);
  selectedSubCategory = signal<any | null>(null);
  selectedBusiness = signal<any | null>(null);
  subCategories = signal<any[]>([]);
  businessDetail: any;
  newLocation: any;
  newLatitude: any;
  newLongtitude: any;
  distance: any;
  cusId: any;
  emailId:any;
  customerData: any;
  errorMessage = signal<string | null>(null);
  ratingComment = signal('');
  currentPage = signal(1);
  itemsPerPage: number = 10; // Number of businesses per page
  totalPages = computed(() => Math.ceil(this.businessList().length / this.itemsPerPage));
  isPaginationVisible = computed(() => this.totalPages() > 1);
  roleID: string | null = null;
  isModalOpen = signal(false);
  modalImageUrl = '';
  distanceAscending = signal(false);
  ratingAscending = signal(false);
  private readonly reverseGeocodeCache = new Map<string, string>();
  readonly paginatedBusinesses = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.businessList().slice(startIndex, startIndex + this.itemsPerPage);
  });
  constructor(private fb: FormBuilder, private businessService: BusinessService, private router: Router, private authservice: AuthService, private renderer: Renderer2) { }

  ngOnInit(): void {
 
    this.searchForm = this.fb.group({
      searchQuery: ['', Validators.required],
      category: ['', Validators.required],
      CategoryID: [0],  
      subcategory: ['', Validators.required],
      location: new FormControl('', [Validators.required]),
      Latitude: [8.3],
      Longitude: [9.3],
    });

    this.getCategories();
    this.cusId = this.authservice.getEmailFromToken();
    this.emailId =this.authservice.getEmailIDFromToken()
    this.getCustomerDetails();
    this.roleID = this.authservice.getRoleIdFromToken();
  }

  openModal(imageUrl: string) {
    const filePath = this.selectedBusiness()?.visitingCard;
    if (!filePath) {
      this.isModalOpen.set(false);
      alert('Image not found.');
      return;
    }
    this.modalImageUrl = imageUrl;
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  openPopup(business: any) {
    this.selectedBusiness.set(business);
    this.renderer.addClass(document.body, 'no-scroll'); // Lock scrolling
  }

  updatePagination(): void {
    const totalPages = this.totalPages();
    this.currentPage.set(Math.min(Math.max(this.currentPage(), 1), Math.max(totalPages, 1)));
  }

  goToFirstPage() {
    this.currentPage.set(1);
    this.updatePagination();
  }
  
  goToLastPage() {
    this.currentPage.set(this.totalPages());
    this.updatePagination();
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  getCustomerDetails() {
    this.businessService.getCustomerDetailsByID(this.cusId).subscribe({
      next: (data) => {
        this.customerData = data;
        if (data?.[0]?.latitude != null && data?.[0]?.longitude != null) {
          localStorage.setItem('customerLatitude', data[0].latitude);
          localStorage.setItem('customerLongitude', data[0].longitude);
        }
        this.errorMessage.set(null);
      },
      error: (error) => {
        console.error('Error fetching customer details:', error);
        this.customerData = null;
        this.errorMessage.set('Customer not found.');
      }
    });
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.marker.set({ lat, lng });
      this.getLocationName(lat, lng); // Fetch and set the location name
    }
  }

  onLocationInput(): void {
    const location = this.selectedBusiness()?.location;
    if (location) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          this.center.set({ lat, lng });
          this.marker.set({ lat, lng });
          this.updateLocationFields(location, lat, lng);
        } else {
          alert('Could not find the location. Please try again.');
        }
      });
    }
  }

  getLocationName(lat: number, lng: number): void {
    const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    const cachedLocation = this.reverseGeocodeCache.get(cacheKey);
    if (cachedLocation) {
      this.updateLocationFields(cachedLocation, lat, lng);
      return;
    }

    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const locationName = results[0].formatted_address;
        this.reverseGeocodeCache.set(cacheKey, locationName);
        this.updateLocationFields(locationName, lat, lng);
      } else {
        console.error('Error fetching location name:', status);
      }
    });
  }

  onCalculateBusiness(): void {
    const business = this.selectedBusiness();
    if (business?.latitude != null && this.newLatitude != null) {
      this.latitudeDifference = this.newLatitude - business.latitude;
    } else {
      this.latitudeDifference = null;
    }

    if (business?.longitude != null && this.newLongtitude != null) {
      this.longitudeDifference = this.newLongtitude - business.longitude;
    } else {
      this.longitudeDifference = null;
    }
  }

  updateLocationFields(location: string, lat: number, lng: number): void {
    const business = this.selectedBusiness();
    if (business) {
      this.selectedBusiness.set({ ...business, location, longitude: lat, latitude: lng });
    }
  }

  // Method to generate the full image URL
  getImageUrl(visitingCard: string | null | undefined): string {
    const fileName = visitingCard?.split(/[\\/]/).pop();
    return fileName ? `${this.imageBaseUrl}${encodeURIComponent(fileName)}` : '';
  }

  onCommentChange(event:any){
   this.ratingComment.set(event?.target?.value ?? '');
  }
  // Handle category selection
  selectCategory(category: any): void {
    this.selectedCategory.set(category);
    this.selectedSubCategory.set(null);
    this.subCategories.set([]);
    this.getSubCategories(category?.categoryID);
  }

  // Handle subcategory selection
  selectSubcategory(subcategory: any): void {
    this.selectedSubCategory.set(subcategory);
  }

  getSubCategories(id: number): void {
    this.businessService.getSubCategories(id).subscribe({
      next: (result) => {
        if (this.selectedCategory()?.categoryID === id) {
          this.subCategories.set(result);
        }
      },
      error: (error) => {
        console.error('Error fetching subcategories:', error);
        this.errorMessage.set('Unable to load subcategories.');
      }
    });
  }

  getBusinessDetailById(id: any, distance: number) {
    this.businessService.getBusinessDetailById(id).subscribe((result: any) => {
      const business = { ...result[0], distancekm: distance };
      this.selectedBusiness.set(business);
      if (Number.isFinite(Number(business.latitude)) && Number.isFinite(Number(business.longitude))) {
        this.center.set({ lat: Number(business.latitude), lng: Number(business.longitude) });
        this.marker.set({ lat: Number(business.latitude), lng: Number(business.longitude) });
      }
    })
  }

  callSearch() {
    const category = this.selectedCategory();
    const subcategory = this.selectedSubCategory();
    if (!category) {
      alert('No category selected. Please choose a category.');
      return;
    }

    if (!subcategory) {
      alert('No subcategory selected. Please choose a subcategory.');
      return;
    }
    this.businessService.searchBusinesses(category.categoryName, subcategory.subCategoryName).subscribe({
      next: (result) => {
        this.businessList.set(result ?? []);
        this.currentPage.set(1);
        this.errorMessage.set(null);
        this.isTableVisible.set(true);
        this.updateDistance();
      },
      error: (error) => {
        console.error('Error searching businesses:', error);
        this.errorMessage.set('Unable to search businesses.');
      }
    });
  }
  updateDistance(): void {
    const customerLatitude = localStorage.getItem('customerLatitude');
    const customerLongitude = localStorage.getItem('customerLongitude');
    const originLatitude = Number(customerLatitude);
    const originLongitude = Number(customerLongitude);
    const businesses = this.businessList();
    if (customerLatitude === null || customerLongitude === null ||
      !Number.isFinite(originLatitude) || !Number.isFinite(originLongitude)) {
      this.errorMessage.set('Customer location is unavailable; distances could not be calculated.');
      return;
    }

    const validBusinesses = businesses.filter((business) =>
      business.latitude != null && business.longitude != null &&
      Number.isFinite(Number(business.latitude)) && Number.isFinite(Number(business.longitude))
    );
    let distanceFailures = businesses.length - validBusinesses.length;
    const batches: any[][] = [];
    for (let index = 0; index < validBusinesses.length; index += 25) {
      batches.push(validBusinesses.slice(index, index + 25));
    }
    if (batches.length === 0) {
      if (businesses.length > 0) {
        this.errorMessage.set('Distances are unavailable for some businesses.');
      }
      this.updatePagination();
      return;
    }

    forkJoin(batches.map((batch) => this.businessService.getDistances(
      originLatitude,
      originLongitude,
      batch.map((business) => ({
        latitude: Number(business.latitude),
        longitude: Number(business.longitude)
      }))
    ))).subscribe({
      next: (responses) => {
        responses.forEach((response, batchIndex) => {
          const batch = batches[batchIndex];
          const elements = response?.rows?.[0]?.elements ?? [];
          batch.forEach((business, index) => {
            const element = elements[index];
            if (element?.status === 'OK' && Number.isFinite(element.distance?.value)) {
              business.distancekm = (element.distance.value / 1000).toFixed(2);
            } else {
              distanceFailures++;
            }
          });
        });
        this.businessList.set([...businesses].sort((a, b) =>
          Number(a.distancekm ?? Number.POSITIVE_INFINITY) - Number(b.distancekm ?? Number.POSITIVE_INFINITY)
        ));
        if (distanceFailures > 0) {
          console.error('Distance Matrix did not return a valid distance for every business.');
          this.errorMessage.set('Distances are unavailable for some businesses.');
        }
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error calculating business distances:', error);
        this.errorMessage.set('Unable to calculate business distances.');
      }
    });
  }
  replacePercentage(val: any) {
    console.log(val);
    return val;
  }

  get FormVal() {
    return this.searchForm.value
  }


  getCategories(): void {
    this.businessService.getCategories().subscribe({
      next: (data) => {
      this.categories.set(data);
      if (!this.FormVal?.CategoryID) {
        this.searchForm.controls['CategoryID'].setValue(data[0]?.categoryID)
      }
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
        this.errorMessage.set('Unable to load categories.');
      }
    });
  }


  // Handle form submission
  onSubmit(): void {
    if (this.searchForm.valid) {
      console.log('Form Submitted:', this.searchForm.value);
    } else {
      console.error('Form is invalid');
    }
  }
  sortDistance(value:boolean):any{
   if(value && this.businessList().length>0){
    this.businessList.update(list => [...list].sort((a,b)=>a.distancekm-b.distancekm));
   }else{
    this.businessList.update(list => [...list].sort((a,b)=>b.distancekm-a.distancekm));
   }
  }
  sortRating(value:boolean):any{
    if(value && this.businessList().length>0){
      this.businessList.update(list => [...list].sort((a,b)=>a.averageRating-b.averageRating));
     }else{
      this.businessList.update(list => [...list].sort((a,b)=>b.averageRating-a.averageRating));
     }
  }
  // View business details when a name is clicked
  viewBusinessDetails(business: any): void {
    this.selectedBusiness.set(business);
  }

  // Open popup with selected business details
  // openPopup(business: any): void {
  //   this.selectedBusiness = business;
  // }

  // Close the popup
  closePopup(): void {
    this.selectedBusiness.set(null);
    this.rating.set(0);
    this.ratingComment.set('');
    this.renderer.removeClass(document.body, 'no-scroll'); // Enable scrolling
  }
  
  getRating(buisnessId:any){
    this.businessService.getBusinessRating(buisnessId).subscribe(result=>{
      this.buisnessRatingList.set(result ?? []);
    }) ;
  }

  clearRating(){
    this.rating.set(0);
    this.ratingComment.set('');
  }
  submitRating(comments:any){
    this.ratingErrorMessage.set(false);

   this.buisnessRating.businessID =comments.businessID;
   this.buisnessRating.comment =this.ratingComment();
   this.buisnessRating.rating =this.rating();
   this.buisnessRating.ratedBy =this.emailId;
   if(this.rating() <= 0){
    this.ratingErrorMessage.set(true);
    return ;
   }
  this.businessService.addBusinessRating(this.buisnessRating ).subscribe({
    next:(result) =>{
  
      this.buisnessRating.businessID =0;
      this.buisnessRating.comment ='';
      this.buisnessRating.rating =0;
      this.buisnessRating.ratedBy = '';
      this.ratingComment.set('');
      this.rating.set(0);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Successfully updated!',
        confirmButtonText: 'OK',
      });
    
    this.getRating(comments.businessID);
    this.callSearch();
   },error:(error:any)=>{
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: error.error,
      confirmButtonText: 'Close',
    });
  }
   });

  }
 
  submitBusiness(distance: any) {
    const formData = new FormData();
    const selectedBusiness = this.selectedBusiness();

    if (!selectedBusiness) {
      return;
    }
    Object.keys(selectedBusiness).forEach((key) => {
      if (key === 'image') {
        // Append the file separately
        formData.append(key, selectedBusiness[key], selectedBusiness[key].name);
      } else {
        // Append other fields
        formData.append(key, selectedBusiness[key]);
      }
    });

    // Call the business registration service
    this.businessService.updateBusiness(formData).subscribe({
      next: (response: any) => {
        if (response) {
          // Show success popup using SweetAlert2
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Successfully updated!',
            confirmButtonText: 'OK',
          });

          //this.registerForm.reset();
          this.router.navigateByUrl('/login');
        } else {
          // Show failure popup using SweetAlert2
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: 'update failed!',
            confirmButtonText: 'Try Again',
          });
        }
      },
      error: (error: any) => {
        // Handle errors during registration
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred during registration. Please try again.',
          confirmButtonText: 'Close',
        });
        this.searchForm.reset();
        console.error('update error:', error);
      }
    });
  }

  toggleSortDistance() {
    this.distanceAscending.update(value => !value);
    this.sortDistance(this.distanceAscending());
  }

  toggleSortRating()
  {
    this.ratingAscending.update(value => !value);
    this.sortRating(this.ratingAscending());
  }
}
