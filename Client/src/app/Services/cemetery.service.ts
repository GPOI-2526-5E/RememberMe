import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Cemetery } from '../Interfaces/Cemetery';
import { Deceased } from '../Interfaces/Deceased';

@Injectable({
  providedIn: 'root'
})
export class CemeteryService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/Cemeteries';

  getAllCemeteries(): Observable<Cemetery[]> {
    return this.http.get<Cemetery[]>(this.apiUrl).pipe(
      map(cemeteries => cemeteries.map(cem => this.processCemeteryData(cem)))
    );
  }

  getCemeteryById(id: string): Observable<Cemetery> {
    return this.http.get<Cemetery>(`${this.apiUrl}/${id}`).pipe(
      map(cemetery => this.processCemeteryData(cemetery))
    );
  }

  private processCemeteryData(cemetery: any): Cemetery {
    // Se ha la struttura GeoJSON, estrai lat/lng
    if (cemetery.location && typeof cemetery.location === 'object' && cemetery.location.coordinates) {
      const [lng, lat] = cemetery.location.coordinates;
      return {
        ...cemetery,
        lat,
        lng
      };
    }
    
    // Altrimenti mantieni la struttura esistente
    return cemetery;
  }

  getDeceasedByCemetery(cemeteryId: string): Observable<Deceased[]> {
    return this.http.get<Deceased[]>(`${this.apiUrl}/${cemeteryId}/Deceased`);
  }

  searchDeceased(name: string): Observable<Deceased[]> {
    return this.http.get<Deceased[]>(`${this.apiUrl}/search?name=${encodeURIComponent(name)}`);
  }
}