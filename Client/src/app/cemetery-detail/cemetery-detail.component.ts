import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CemeteryService } from '../Services/cemetery.service';
import { LeafletMapService } from '../Services/leaflet-map.service';
import { AiHelperService } from '../Services/ai-helper.service';

import { Cemetery } from '../Interfaces/Cemetery';
import { Deceased } from '../Interfaces/Deceased';
import * as L from 'leaflet';

@Component({
  selector: 'app-cemetery-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cemetery-detail.component.html',
  styleUrls: ['./cemetery-detail.component.scss']
})
export class CemeteryDetailComponent implements OnInit, AfterViewInit {

  cemetery: Cemetery | undefined;
  allDeceased: Deceased[] = [];
  filteredDeceased: Deceased[] = [];
  searchTerm = '';

  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private mapReady = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private cemeteryService: CemeteryService,
    private mapService: LeafletMapService,
    private aiService: AiHelperService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.cemeteryService.getCemeteryById(id).subscribe({
      next: (cem) => {
        this.cemetery = cem;
        this.allDeceased = cem.deceased || [];
        this.filteredDeceased = [...this.allDeceased];
        this.tryInitializeMap();
      },
      error: (err) => console.error('Errore caricamento cimitero:', err)
    });
  }

  ngAfterViewInit() {
    this.mapReady = true;
    this.tryInitializeMap();
  }

  private tryInitializeMap() {
    if (!this.cemetery || !this.mapReady || !this.mapContainer?.nativeElement || this.map) {
      return;
    }

    this.map = this.mapService.initMap(
      this.mapContainer.nativeElement, 
      this.cemetery.lat, 
      this.cemetery.lng, 
      17
    );

    // Marker del cimitero principale
    this.mapService.addMarker(this.map, this.cemetery.lat, this.cemetery.lng, this.cemetery.name, 'blue');

    // Marker di tutti i defunti
    this.addDeceasedMarkers();

    // Aggiorna lista quando la mappa si muove
    this.map.on('moveend', () => this.updateVisibleDeceased());
    this.map.on('zoomend', () => this.updateVisibleDeceased());

    setTimeout(() => this.updateVisibleDeceased(), 400);
  }

  private addDeceasedMarkers() {
    this.markers = [];

    this.allDeceased.forEach(deceased => {
      if (!deceased.lat || !deceased.lng) return;

      const marker = this.mapService.addMarker(
        this.map,
        deceased.lat,
        deceased.lng,
        deceased.name,
        'red'
      );

      (marker as any).deceasedData = deceased;
      this.markers.push(marker);
    });
  }

  private updateVisibleDeceased() {
    if (!this.map || this.allDeceased.length === 0) return;

    const bounds = this.map.getBounds();

    let visible = this.allDeceased.filter(d => {
      if (!d.lat || !d.lng) return false;
      return bounds.contains(L.latLng(d.lat, d.lng));
    });

    // Applica filtro ricerca
    if (this.searchTerm?.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      visible = visible.filter(d => d.name.toLowerCase().includes(term));
    }

    this.filteredDeceased = visible;
  }

  searchDeceased() {
    this.updateVisibleDeceased();
  }

  showPath(deceased: Deceased) {
    if (!this.map || !deceased.lat || !deceased.lng) return;

    this.map.flyTo([deceased.lat, deceased.lng], 19, { duration: 1.5 });

    const marker = this.markers.find(m => (m as any).deceasedData?._id === deceased._id);
    if (marker) marker.openPopup();
  }

  /** ✅ Metodo che avevi chiesto */
  goToMap() {
    if (this.cemetery) {
      this.router.navigate(['/map']);   // oppure la rotta che usi per la mappa globale
    }
  }

  // Pulsante "Mostra tutti i defunti sulla mappa"
  showAll() {
    if (!this.map || this.allDeceased.length === 0) return;

    const bounds = L.latLngBounds(
      this.allDeceased
        .filter(d => d.lat && d.lng)
        .map(d => [d.lat!, d.lng!])
    );

    this.map.fitBounds(bounds, { padding: [40, 40] });
  }

  askAI(question: string) {
    if (!this.cemetery) return;
    const answer = this.aiService.getResponse(question, this.cemetery.name);
    alert('🤖 IA: ' + answer);
  }
}