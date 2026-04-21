import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CemeteryService } from '../../Services/cemetery.service';
import { LeafletMapService } from '../../Services/leaflet-map.service';
import { AiHelperService } from '../../Services/ai-helper.service';
import { GeolocationService } from '../../Services/geolocation.service';

import { NavbarComponent } from '../navbar/navbar.component';
import { CookieBannerComponent } from '../cookie-banner/cookie-banner.component';
import { BottomBarComponent } from '../bottom-bar/bottom-bar.component';
import { FooterComponent } from '../footer/footer.component';
import { MemorialCandleComponent } from '../memorial-candle/memorial-candle.component';
import { MemoriesTimelineComponent } from '../memories-timeline/memories-timeline.component';

import { Cemetery } from '../../Interfaces/Cemetery';
import { Deceased } from '../../Interfaces/Deceased';
import * as L from 'leaflet';

@Component({
  selector: 'app-cemetery-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, MemorialCandleComponent, MemoriesTimelineComponent,NavbarComponent, CookieBannerComponent, BottomBarComponent, FooterComponent],
  templateUrl: './cemetery-detail.component.html',
  styleUrls: ['./cemetery-detail.component.scss']
})
export class CemeteryDetailComponent implements OnInit, AfterViewInit {

  cemetery: Cemetery | undefined;
  allDeceased: Deceased[] = [];
  filteredDeceased: Deceased[] = [];
  searchTerm = '';
  aiAnswer = '';
  userPosition: { lat: number; lng: number } | null = null;
  cemeteryDistance: number | undefined;

  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private map!: L.Map;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private cemeteryService: CemeteryService,
    private mapService: LeafletMapService,
    private aiService: AiHelperService,
    private geoService: GeolocationService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.geoService.getCurrentPosition()
      .then(pos => {
        this.userPosition = pos;
        if (this.cemetery) {
          this.cemeteryDistance = this.calculateDistance(pos, this.cemetery);
        }
        if (this.map) {
          this.mapService.addUserMarker(this.map, pos.lat, pos.lng);
        }
      })
      .catch(() => console.log('Geolocalizzazione non disponibile'));

    this.cemeteryService.getCemeteryById(id).subscribe({
      next: (cem) => {
        this.cemetery = cem;
        this.cemeteryService.getDeceasedByCemetery(cem._id!).subscribe({
          next: (deceased) => {
            this.allDeceased = deceased;
            this.filteredDeceased = [...deceased];
          },
          error: (err) => console.error('Errore caricamento defunti:', err)
        });
        if (this.userPosition) {
          this.cemeteryDistance = this.calculateDistance(this.userPosition, cem);
        }
        setTimeout(() => this.tryInitializeMap(), 100);
      },
      error: (err) => console.error('Errore caricamento cimitero:', err)
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.tryInitializeMap(), 100);
  }

  private tryInitializeMap() {
    if (!this.cemetery || !this.mapContainer?.nativeElement) {
      return;
    }

    if (this.map) {
      this.map.remove();
      this.map = null as any;
    }

    const [lng, lat] = this.cemetery.location.coordinates;
    this.map = this.mapService.initMap(
      this.mapContainer.nativeElement,
      lat,
      lng,
      15
    );

    const detailUrl = this.cemetery._id ? `/detail/${this.cemetery._id}` : undefined;
    this.mapService.addMarker(this.map, lat, lng, this.cemetery.name, 'blue', detailUrl);
    
    if (this.userPosition) {
      this.mapService.addUserMarker(this.map, this.userPosition.lat, this.userPosition.lng);
    }
  }

  private calculateDistance(pos: { lat: number; lng: number }, cem: Cemetery): number {
    const [cemLng, cemLat] = cem.location.coordinates;
    const R = 6371;
    const dLat = (cemLat - pos.lat) * Math.PI / 180;
    const dLng = (cemLng - pos.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(pos.lat * Math.PI / 180) * Math.cos(cemLat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  searchDeceased() {
    if (!this.searchTerm?.trim()) {
      this.filteredDeceased = [...this.allDeceased];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredDeceased = this.allDeceased.filter(d => 
        d.fullName.toLowerCase().includes(term)
      );
    }
  }
  
  askAI(question: string) {
    if (!this.cemetery) {
      this.aiAnswer = 'Cimitero non disponibile. Riprova più tardi.';
      return;
    }

    const trimmedQuestion = question?.trim();
    if (!trimmedQuestion) {
      this.aiAnswer = 'Inserisci una domanda sul cimitero o sui defunti.';
      return;
    }

    this.aiAnswer = this.aiService.getResponse(trimmedQuestion, this.cemetery, this.allDeceased);
  }
}
