import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CemeteryService } from '../Services/cemetery.service'
import { LeafletMapService } from '../Services/leaflet-map.service';
import { AiHelperService } from '../Services/ai-helper.service';
import { Cemetery } from '../Models/cemetery';
import { Deceased } from '../Models/deceased';
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
  deceasedList: Deceased[] = [];
  filteredDeceased: Deceased[] = [];
  searchTerm = '';
  map!: L.Map;
  entranceMarker!: L.Marker;

  @ViewChild('mapContainer') mapContainer!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private cemeteryService: CemeteryService,
    private mapService: LeafletMapService,
    private aiService: AiHelperService,
    public router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.cemetery = this.cemeteryService.getCemeteryById(id);
    if (this.cemetery) {
      this.deceasedList = this.cemeteryService.getDeceasedByCemetery(id);
      this.filteredDeceased = [...this.deceasedList];
    }
  }

  ngAfterViewInit() {
    if (this.cemetery) {
      this.map = this.mapService.initMap('map', this.cemetery.lat, this.cemetery.lng);
      this.entranceMarker = this.mapService.addMarker(this.map, this.cemetery.lat, this.cemetery.lng, 'Entrata principale', 'green');
    }
  }

  searchDeceased() {
    if (!this.searchTerm) {
      this.filteredDeceased = [...this.deceasedList];
      return;
    }
    this.filteredDeceased = this.cemeteryService.getDeceasedByName(this.searchTerm);
  }

  showPath(deceased: Deceased) {
    this.mapService.clearMap();
    this.mapService.addMarker(this.map, this.cemetery!.lat, this.cemetery!.lng, 'Entrata', 'green');
    const tombMarker = this.mapService.addMarker(this.map, deceased.lat, deceased.lng, deceased.name, 'red');
    this.mapService.drawPath(this.map, [
      [this.cemetery!.lat, this.cemetery!.lng],
      [deceased.lat, deceased.lng]
    ]);
    this.map.flyTo([deceased.lat, deceased.lng], 19);
  }

  askAI(question: string) {
    if (!this.cemetery) return;
    const answer = this.aiService.getResponse(question, this.cemetery.name);
    alert('🤖 IA: ' + answer); // in produzione sostituisci con modale elegante
  }
}