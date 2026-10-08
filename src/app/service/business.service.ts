import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, shareReplay, throwError } from 'rxjs';
import { environment } from './../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BusinessService {

  private apiUrl = environment.baseUrl+'Business';
  private cus_ApiUrl = environment.baseUrl+'Customer';
  private businessRating_ApiUrl = environment.baseUrl+'BusinessRating';
  private categoriesRequest: Observable<any[]> | null = null;
  private readonly subCategoriesRequests = new Map<number, Observable<any[]>>();
  private readonly distancesRequests = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) {}

  registerBusiness(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, formData);
  }

  updateBusiness(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}`, formData);
  }

  addBusinessRating(formData: any): Observable<any> {
    return this.http.post(`${this.businessRating_ApiUrl}/Add`, formData);
  }
  getBusinessRating(buisnessID: any): Observable<any> {
    return this.http.get(`${this.businessRating_ApiUrl}/${buisnessID}`);
  }
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.cus_ApiUrl}/check-email?email=${email}`);
  }
  checkEmailExistsBusiness(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email?email=${email}`);
  }

  getCustomerDetailsByID(cusId: number): Observable<any> {
    return this.http.get<any>(`${this.cus_ApiUrl}/getcusdetailsbyid?cusId=${cusId}`);
  }  

  registerCustomer(inputdata:any)
  {
    return this.http.post(this.cus_ApiUrl, inputdata);
  }

  searchBusinesses(category: string, subcategory: string): Observable<any[]> {
    const params = new URLSearchParams({ category, subcategory });
    return this.http.get<any[]>(`${this.apiUrl}/search?${params.toString()}`);
  }

  getCategories(): Observable<any[]> {
    if (!this.categoriesRequest) {
      this.categoriesRequest = this.http.get<any[]>(`${this.apiUrl}/GetCategories`).pipe(
        catchError((error) => {
          this.categoriesRequest = null;
          return throwError(() => error);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.categoriesRequest;
  }

  getImage(imagename: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  getSubCategories(categoryId: number): Observable<any[]> {
    const cachedRequest = this.subCategoriesRequests.get(categoryId);
    if (cachedRequest) {
      return cachedRequest;
    }

    const request = this.http.get<any[]>(`${this.apiUrl}/GetSubCategories/${categoryId}`).pipe(
      catchError((error) => {
        this.subCategoriesRequests.delete(categoryId);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );
    this.subCategoriesRequests.set(categoryId, request);
    return request;
  }
  getBusinessDetailById(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getbusinessdetailbyid/${id}`);
  }
  
  getDistances(
    originLatitude: number,
    originLongitude: number,
    destinations: Array<{ latitude: number; longitude: number }>
  ): Observable<any> {
    const destinationCoordinates = destinations
      .map(({ latitude, longitude }) => `${latitude},${longitude}`)
      .join('|');
    const cacheKey = `${originLatitude},${originLongitude}|${destinationCoordinates}`;
    const cachedRequest = this.distancesRequests.get(cacheKey);
    if (cachedRequest) {
      return cachedRequest;
    }

    const params = new URLSearchParams({
      units: 'metric',
      origins: `${originLatitude},${originLongitude}`,
      destinations: destinationCoordinates,
      key: environment.API_KEY
    });
    const request = this.http
      .get<any>(`https://maps.gomaps.pro/maps/api/distancematrix/json?${params.toString()}`)
      .pipe(
        catchError((error) => {
          this.distancesRequests.delete(cacheKey);
          return throwError(() => error);
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    this.distancesRequests.set(cacheKey, request);
    return request;
  }

  updateBusinessDetails(formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/updatebusinessdetails`, formData);
  }

  updateCustomerDetails(formData: FormData): Observable<any>{
    return this.http.put(`${this.cus_ApiUrl}/updatecustomerdetails`, formData);
  }

}