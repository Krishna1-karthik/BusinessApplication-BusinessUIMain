import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private loadPromise: Promise<void> | null = null;
  private readonly scriptId = 'google-maps-api';

  load(): Promise<void> {
    if (typeof google !== 'undefined' && google.maps) {
      return Promise.resolve();
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      let script = document.getElementById(this.scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = this.scriptId;
        script.async = true;
        script.defer = true;
        script.src = `https://maps.gomaps.pro/maps/api/js?key=${encodeURIComponent(environment.API_KEY)}`;
        document.head.appendChild(script);
      }

      script.addEventListener('load', () => {
        if (typeof google !== 'undefined' && google.maps) {
          resolve();
        } else {
          this.loadPromise = null;
          reject(new Error('Google Maps script loaded without initializing the Maps API.'));
        }
      }, { once: true });
      script.addEventListener('error', () => {
        this.loadPromise = null;
        script?.remove();
        reject(new Error('Failed to load the Google Maps JavaScript API.'));
      }, { once: true });
    });

    return this.loadPromise;
  }
}
