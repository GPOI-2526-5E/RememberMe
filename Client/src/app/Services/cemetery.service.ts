import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cemetery } from '../Interfaces/Cemetery';
import { Deceased } from '../Interfaces/Deceased';

@Injectable({
  providedIn: 'root'
})
export class CemeteryService {

  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/Cemeteries';

  // ==================== CIMITERI ====================
  getAllCemeteries(): Observable<Cemetery[]> {
    return this.http.get<Cemetery[]>(this.apiUrl);
  }

  getCemeteryById(id: string): Observable<Cemetery> {
    return this.http.get<Cemetery>(`${this.apiUrl}/${id}`);
  }

  // ==================== DEFUNTI ====================
  getDeceasedByCemetery(cemeteryId: string): Observable<Deceased[]> {
    return this.http.get<Deceased[]>(`${this.apiUrl}/${cemeteryId}/Deceased`);
  }

  searchDeceased(name: string): Observable<Deceased[]> {
    return this.http.get<Deceased[]>(`${this.apiUrl}/search?name=${encodeURIComponent(name)}`);
  }
}