import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CemeteryService } from '../Services/cemetery.service';
import { LeafletMapService } from '../Services/leaflet-map.service';
import { AiHelperService } from '../Services/ai-helper.service';

import { Cemetery } from '../Interfaces/Cemetery';
import { Deceased } from '../Interfaces/Deceased';

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

  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private map: any; // Add map property

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
        this.loadDeceased(cem._id!);   // usa _id di MongoDB
        // Initialize map after cemetery is loaded
        if (this.mapContainer) {
          //this.map = this.mapService.initMap(this.mapContainer.nativeElement, cem.location, cem.longitude);
        }
      },
      error: (err) => console.error(err)
    });
  }

  ngAfterViewInit() {
    // Initialize map here if needed
    // For example: this.mapService.initializeMap(this.mapContainer.nativeElement, this.cemetery);
  }

  private loadDeceased(cemeteryId: string) {
    this.cemeteryService.getDeceasedByCemetery(cemeteryId).subscribe({
      next: (data) => {
        this.deceasedList = data;
        this.filteredDeceased = [...data];
      },
      error: (err) => console.error(err)
    });
  }

  searchDeceased() {
    if (!this.searchTerm.trim()) {
      this.filteredDeceased = [...this.deceasedList];
      return;
    }

    this.cemeteryService.searchDeceased(this.searchTerm).subscribe({
      next: (data: Deceased[]) => this.filteredDeceased = data,
      error: (err: any) => console.error(err)
    });
  }

  showPath(deceased: Deceased) {
    if (!this.cemetery || !this.map) return;
    // ... codice mappa come prima
  }

  askAI(question: string) {
    if (!this.cemetery) return;
    const answer = this.aiService.getResponse(question, this.cemetery.name);
    alert('🤖 IA: ' + answer);
  }
}