import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocalizzazione non supportata dal browser');
        return;
      }

      if (!window.isSecureContext) {
        reject('Geolocalizzazione non disponibile: usa HTTPS o localhost');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              reject('Permesso posizione negato. Abilita la geolocalizzazione nel browser.');
              break;
            case err.POSITION_UNAVAILABLE:
              reject('Posizione non disponibile. Riprova più tardi.');
              break;
            case err.TIMEOUT:
              reject('Timeout geolocalizzazione. Riprova.');
              break;
            default:
              reject('Errore geolocalizzazione: ' + (err.message || 'controlla il browser'));
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }
}