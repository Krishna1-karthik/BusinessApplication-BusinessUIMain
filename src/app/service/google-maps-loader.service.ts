import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    gm_authFailure?: () => void;
    __businessGoogleMapsLoaded?: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  readonly authError = signal(false);
  private loadPromise: Promise<void> | null = null;
  private readonly scriptId = 'google-maps-api';
  private readonly callbackName = '__businessGoogleMapsLoaded';

  load(): Promise<void> {
    if (typeof google !== 'undefined' && google.maps) {
      return Promise.resolve();
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.authError.set(false);
    window.gm_authFailure = () => this.authError.set(true);
    this.loadPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById(this.scriptId);
      existingScript?.remove();

      const script = document.createElement('script');
      script.id = this.scriptId;
      script.async = true;
      script.defer = true;

      const timeout = window.setTimeout(() => {
        fail(new Error('Timed out while loading the Google Maps JavaScript API.'));
      }, 15000);

      const fail = (error: Error) => {
        window.clearTimeout(timeout);
        this.loadPromise = null;
        script.remove();
        reject(error);
      };

      window[this.callbackName] = () => {
        if (typeof google !== 'undefined' && typeof google.maps?.importLibrary === 'function') {
          window.clearTimeout(timeout);
          resolve();
        } else {
          fail(new Error('Google Maps loaded without initializing its map libraries.'));
        }
      };
      script.addEventListener('error', () => {
        fail(new Error('Failed to load the Google Maps JavaScript API.'));
      }, { once: true });
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(environment.API_KEY)}&loading=async&callback=${this.callbackName}`;
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}
