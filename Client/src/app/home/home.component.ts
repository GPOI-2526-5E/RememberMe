import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, CookieBannerComponent, NavbarComponent, BottomBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  cemeteries: Cemetery[] = [];
  userPosition: { lat: number; lng: number } | null = null;
  errorMessage = '';

  constructor(
    private geo: GeolocationService,
    private cemeteryService: CemeteryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.geo.getCurrentPosition().then(pos => {
      this.userPosition = pos;
      this.loadCemeteries();
    }).catch(() => this.loadCemeteries());
  }

  private loadCemeteries() {
    this.cemeteryService.getAllCemeteries().subscribe({
      next: (data) => {
        this.cemeteries = data;
        console.log(this.cemeteries)
        if (this.userPosition) {
          this.cemeteries.sort((a, b) => 
            this.calculateDistance(this.userPosition!, a) - 
            this.calculateDistance(this.userPosition!, b)
          );
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
    const dLat = (cem.lat - pos.lat) * Math.PI / 180;
    const dLng = (cem.lng - pos.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(pos.lat * Math.PI / 180) * Math.cos(cem.lat * Math.PI / 180) *
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

  closeError() {
    this.errorMessage = '';
  }
}