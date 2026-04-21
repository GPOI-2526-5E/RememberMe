import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CemeteryService } from '../../Services/cemetery.service';
import { GeolocationService } from '../../Services/geolocation.service';
import { LeafletMapService } from '../../Services/leaflet-map.service';
import { Cemetery } from '../../Interfaces/Cemetery';
import { NavbarComponent } from '../navbar/navbar.component';
import { CookieBannerComponent } from '../cookie-banner/cookie-banner.component';
import { BottomBarComponent } from '../bottom-bar/bottom-bar.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-map-fullscreen',
  standalone: true,
  imports: [CommonModule, CookieBannerComponent, NavbarComponent, BottomBarComponent, FooterComponent],
  templateUrl: './map-fullscreen.component.html',
  styleUrls: ['./map-fullscreen.component.scss']
})
export class MapFullscreenComponent implements OnInit, AfterViewInit {
  @ViewChild('fullscreenMap') fullscreenMap!: ElementRef;
  cemeteries: Cemetery[] = [];
  userLocation?: { lat: number; lng: number };
  errorMessage = '';
  private map: any;
  private viewReady = false;

  constructor(
    private cemeteryService: CemeteryService,
    private geolocationService: GeolocationService,
    private mapService: LeafletMapService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCemeteries();
    this.loadUserLocation();
  }

  ngAfterViewInit() {
    this.viewReady = true;
    this.tryInitializeMap();
  }

  private loadCemeteries() {
    this.cemeteryService.getAllCemeteries().subscribe({
      next: (data) => {
        this.cemeteries = data;
        this.tryInitializeMap();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Impossibile caricare i cimiteri. Riprova più tardi.';
      }
    });
  }

  private loadUserLocation() {
    this.geolocationService.getCurrentPosition()
      .then((location) => {
        this.userLocation = location;
        this.tryInitializeMap();
      })
      .catch((err) => {
        console.warn('Geolocalizzazione non disponibile', err);
        this.errorMessage = 'Impossibile ottenere la posizione. Verranno mostrati comunque i cimiteri.';
        this.tryInitializeMap();
      });
  }

  private tryInitializeMap() {
    if (!this.viewReady || !this.cemeteries.length || this.map) {
      return;
    }

    const centerLat = this.userLocation?.lat ?? (this.cemeteries[0].lat ?? 41.9028); // Default to Rome, Italy
    const centerLng = this.userLocation?.lng ?? (this.cemeteries[0].lng ?? 12.4964);
    const zoom = this.userLocation ? 12 : 6;

    this.map = this.mapService.initMap(this.fullscreenMap.nativeElement, centerLat, centerLng, zoom);

    if (this.userLocation) {
      this.mapService.addMarker(this.map, this.userLocation.lat, this.userLocation.lng, 'La tua posizione', 'blue');
    }

    this.cemeteries.forEach((cemetery) => {
      if (cemetery.lat !== undefined && cemetery.lng !== undefined) {
        this.mapService.addMarker(this.map, cemetery.lat, cemetery.lng, cemetery.name, 'red');
      }
    });

    const bounds = this.cemeteries
      .filter((cemetery) => cemetery.lat !== undefined && cemetery.lng !== undefined)
      .map((cemetery) => [cemetery.lat!, cemetery.lng!] as [number, number]);
    if (this.userLocation) {
      bounds.push([this.userLocation.lat, this.userLocation.lng]);
    }

    if (bounds.length) {
      this.map.fitBounds(bounds as any, { padding: [70, 70] });
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  closeError() {
    this.errorMessage = '';
  }
}
