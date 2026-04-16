import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CemeteryService } from '../Services/cemetery.service';
import { LeafletMapService } from '../Services/leaflet-map.service';
import { AiHelperService } from '../Services/ai-helper.service';

import { NavbarComponent } from '../navbar/navbar.component';
import { CookieBannerComponent } from '../cookie-banner/cookie-banner.component';
import { BottomBarComponent } from '../bottom-bar/bottom-bar.component';

import { Cemetery } from '../Interfaces/Cemetery';
import { Deceased } from '../Interfaces/Deceased';
import * as L from 'leaflet';

@Component({
  selector: 'app-cemetery-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, CookieBannerComponent, BottomBarComponent],
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
    this.tryInitializeMap();
  }

  private tryInitializeMap() {
    if (!this.cemetery || !this.mapContainer?.nativeElement || this.map) {
      return;
    }

    this.map = this.mapService.initMap(
      this.mapContainer.nativeElement, 
      this.cemetery.lat, 
      this.cemetery.lng, 
      17
    );

    this.mapService.addMarker(this.map, this.cemetery.lat, this.cemetery.lng, this.cemetery.name, 'blue');
  }





  searchDeceased() {
    if (!this.searchTerm?.trim()) {
      this.filteredDeceased = [...this.allDeceased];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredDeceased = this.allDeceased.filter(d => 
        d.name.toLowerCase().includes(term)
      );
    }
  }







  askAI(question: string) {
    if (!this.cemetery) return;
    const answer = this.aiService.getResponse(question, this.cemetery.name);
    alert('🤖 IA: ' + answer);
  }
}