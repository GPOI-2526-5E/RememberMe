import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class LeafletMapService {
  private map: L.Map | null = null;

  initMap(containerId: string, lat: number, lng: number, zoom = 18): L.Map {
    this.map = L.map(containerId, {
      center: [lat, lng],
      zoom: zoom,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });

    return this.map;
  }

  addMarker(map: L.Map, lat: number, lng: number, popupText: string, color = 'green') {
    return L.marker([lat, lng], {
      icon: L.divIcon({ className: `custom-marker ${color}`, html: `<div style="background:${color};width:30px;height:30px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>` })
    }).addTo(map).bindPopup(popupText);
  }

  drawPath(map: L.Map, points: [number, number][]) {
    return L.polyline(points, { color: '#d4a017', weight: 5, opacity: 0.8 }).addTo(map);
  }

  clearMap() {
    if (this.map) this.map.eachLayer((layer) => { if (layer instanceof L.Marker || layer instanceof L.Polyline) layer.remove(); });
  }
}