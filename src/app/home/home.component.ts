import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GeolocationService } from '../Services/geolocation.service';
import { CemeteryService } from '../Services/cemetery.service';
import { Cemetery } from '../Models/cemetery';
import { CookieBannerComponent } from '../cookie-banner/cookie-banner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CookieBannerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  cemeteries: Cemetery[] = [];
  userPosition: { lat: number; lng: number } | null = null;

  constructor(
    private geo: GeolocationService,
    private cemeteryService: CemeteryService,
    private router: Router
  ) { }

  ngOnInit() {
    this.geo.getCurrentPosition().then(pos => {
      this.userPosition = pos;
      this.loadCemeteries();
    }).catch(() => this.loadCemeteries());
  }

  private loadCemeteries() {
    let all = this.cemeteryService.getAllCemeteries();
    if (this.userPosition) {
      all.sort((a, b) => this.calculateDistance(this.userPosition!, a) - this.calculateDistance(this.userPosition!, b));
    }
    this.cemeteries = all;
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

  goToDetail(id: string) {
    this.router.navigate(['/detail', id]);
  }

  goToScan() {
    this.router.navigate(['/scan']);
  }

  goToHome() {
    // Se sei già in home, puoi fare scroll to top o refresh cards
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToSettings() {
    // Per ora alert – poi puoi creare un componente Settings
    alert('Impostazioni in arrivo (lingua, tema, privacy...)');
  }
}