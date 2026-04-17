import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class LeafletMapService {
  private map: L.Map | null = null;

initMap(container: string | HTMLElement, lat: number, lng: number, zoom = 18): L.Map {
  this.map = L.map(container, {
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

  setTimeout(() => {
    if (this.map) this.map.invalidateSize();
  }, 100);

  return this.map;
}

  addMarker(map: L.Map, lat: number, lng: number, popupText: string, color = 'red') {
    const iconUrl = this.getMarkerIconUrl(color);
    
    const icon = L.icon({
      iconUrl: iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      shadowSize: [41, 41]
    });

    return L.marker([lat, lng], { icon }).addTo(map).bindPopup(popupText);
  }

  private getMarkerIconUrl(color: string): string {
    const colorMap: { [key: string]: string } = {
      'red': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      'blue': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      'green': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      'orange': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
      'yellow': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
      'violet': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
      'grey': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
      'black': 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png'
    };
    
    return colorMap[color] || colorMap['red'];
  }

  drawPath(map: L.Map, points: [number, number][]) {
    return L.polyline(points, { color: '#d4a017', weight: 5, opacity: 0.8 }).addTo(map);
  }

  clearMap() {
    if (this.map) this.map.eachLayer((layer) => { if (layer instanceof L.Marker || layer instanceof L.Polyline) layer.remove(); });
  }
}