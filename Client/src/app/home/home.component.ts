import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GeolocationService } from '../Services/geolocation.service';
import { CemeteryService } from '../Services/cemetery.service';
import { Cemetery } from '../Interfaces/Cemetery';
import { Deceased } from '../Interfaces/Deceased';
import { NavbarComponent } from '../navbar/navbar.component';
import { CookieBannerComponent } from '../cookie-banner/cookie-banner.component';
import { BottomBarComponent } from '../bottom-bar/bottom-bar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, CookieBannerComponent, NavbarComponent, BottomBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  cemeteries: Cemetery[] = [];
  filteredCemeteries: Cemetery[] = [];
  searchTerm = '';
  userPosition: { lat: number; lng: number } | null = null;
  errorMessage = '';
  loginSuccessMessage = '';
  showLoginSuccess = false;

  constructor(
    private geo: GeolocationService,
    private cemeteryService: CemeteryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkLoginSuccess();
    this.geo.getCurrentPosition().then(pos => {
      this.userPosition = pos;
      this.loadCemeteries();
    }).catch(() => this.loadCemeteries());
  }

  private loadCemeteries() {
    this.cemeteryService.getAllCemeteries().subscribe({
      next: (data) => {
        this.cemeteries = data;
        this.filteredCemeteries = [...this.cemeteries];
        console.log(this.cemeteries)
        if (this.userPosition) {
          this.cemeteries.sort((a, b) => 
            this.calculateDistance(this.userPosition!, a) - 
            this.calculateDistance(this.userPosition!, b)
          );
          this.filteredCemeteries = [...this.cemeteries];
        }
      },
      error: (err) => {
        console.error('Errore caricamento cimiteri', err);
        this.errorMessage = 'Impossibile caricare i cimiteri. Riprova più tardi.';
      }
    });
  }

  private calculateDistance(pos: { lat: number; lng: number }, cem: Cemetery): number {
    const R = 6371;
    const dLat = (cem.location.coordinates[0] - pos.lat) * Math.PI / 180;
    const dLng = (cem.location.coordinates[1] - pos.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(cem.location.coordinates[0] * Math.PI / 180) * Math.cos(cem.location.coordinates[1] * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  goToDetail(id: string | undefined) {
  if (id) {
    this.router.navigate(['/detail', id]);
  } else {
    console.error('ID cimitero non valido');
  }
}

  goToScan() {
    this.router.navigate(['/scan']);
  }

  goToHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToSettings() {
    alert('Impostazioni in arrivo (lingua, tema, privacy...)');
  }

  searchCemeteries(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredCemeteries = [...this.cemeteries];
      return;
    }

    // Trova la posizione della città cercata
    const cityLocation = this.findCityLocation(term);
    
    if (cityLocation) {
      // Ordina per distanza dalla città cercata
      this.filteredCemeteries = [...this.cemeteries]
        .map(cem => ({
          cem,
          distance: this.calculateDistance(cityLocation, cem)
        }))
        .sort((a, b) => a.distance - b.distance)
        .map(item => item.cem);
    } else {
      // Se non trova la città, usa il metodo precedente basato su score
      this.filteredCemeteries = [...this.cemeteries]
        .map(cem => ({
          cem,
          score: this.calculateSearchScore(cem, term)
        }))
        .sort((a, b) => b.score - a.score)
        .map(item => item.cem);
    }
  }

  private findCityLocation(cityName: string): { lat: number; lng: number } | null {
    // Cerca tra i cimiteri esistenti per trovare una corrispondenza della città
    const matchingCemetery = this.cemeteries.find(cem => {
      const location = typeof cem.location === 'string' ? cem.location : cem.city || '';
      return location.toLowerCase().includes(cityName) ||
             location.toLowerCase() === cityName;
    });
    
    if (matchingCemetery) {
      return { lat: matchingCemetery.lat!, lng: matchingCemetery.lng! };
    }
    
    // Se non trova corrispondenza esatta, cerca il primo cimitero che contiene la città nel nome
    const partialMatch = this.cemeteries.find(cem => {
      const location = typeof cem.location === 'string' ? cem.location : cem.city || '';
      return location.toLowerCase().split(' ').some(word => 
        word.includes(cityName) || cityName.includes(word)
      );
    });
    
    return partialMatch ? { lat: partialMatch.lat!, lng: partialMatch.lng! } : null;
  }

  private calculateSearchScore(cem: Cemetery, term: string): number {
    const location = String(cem.location ?? '').toLowerCase();
    const name = cem.name.toLowerCase();
    let score = 0;

    if (location === term) score += 100;
    if (location.includes(term)) score += 75;
    if (name.includes(term)) score += 30;
    if (location.split(' ').some(part => part === term)) score += 20;

    return score;
  }

  private checkLoginSuccess(): void {
    const message = sessionStorage.getItem('loginSuccessMessage');
    if (message) {
      this.loginSuccessMessage = message;
      this.showLoginSuccess = true;
      sessionStorage.removeItem('loginSuccessMessage');
      setTimeout(() => this.showLoginSuccess = false, 4000);
    }
  }

  closeError() {
    this.errorMessage = '';
  }
}