import { Injectable } from '@angular/core';
import * as L from 'leaflet';

interface LatLng {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class LeafletMapService {
  private currentRoute: L.Polyline | null = null;
  private osrmBaseUrl = 'https://router.project-osrm.org';

  initMap(container: string | HTMLElement, lat: number, lng: number, zoom = 18): Promise<any> {
    return new Promise((resolve) => {
      this.configureIconDefaults();

      const map = L.map(container as HTMLElement, {
        center: [lat, lng],
        zoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      setTimeout(() => map.invalidateSize(), 100);
      resolve(map);
    });
  }

  addMarker(map: any, lat: number, lng: number, popupText: string, color = 'red', detailUrl?: string) {
    const iconUrl = this.getMarkerIconUrl(color);
    const icon = L.icon({
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      shadowSize: [41, 41]
    });

    const marker = L.marker([lat, lng], { icon }).addTo(map);
    if (detailUrl) {
      marker.bindPopup(`<strong>${popupText}</strong><br/><a href="${detailUrl}" style="color:#1a73e8; text-decoration:none;">Vai ai dettagli</a>`);
    } else {
      marker.bindPopup(popupText);
    }

    return marker;
  }

  addUserMarker(map: any, lat: number, lng: number) {
    const icon = L.divIcon({
      className: 'user-location-marker',
      html: `<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <circle cx='16' cy='16' r='12' fill='#4a90e2' opacity='0.3'/>
          <circle cx='16' cy='16' r='8' fill='#4a90e2' opacity='0.6'/>
          <circle cx='16' cy='16' r='4' fill='#ffffff' stroke='#4a90e2' stroke-width='2'/>
        </svg>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });

    return L.marker([lat, lng], { icon }).addTo(map).bindPopup('La tua posizione');
  }

  async renderRoute(map: any, origin: LatLng, destination: LatLng): Promise<{ distanceKm: number; durationText: string }> {
    if (this.currentRoute) {
      map.removeLayer(this.currentRoute);
      this.currentRoute = null;
    }

    const url = `${this.osrmBaseUrl}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&annotations=distance,duration`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.routes?.length) {
      throw new Error('Impossibile ottenere il percorso da OpenStreetMap');
    }

    const route = data.routes[0];
    const coordinates: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
    this.currentRoute = L.polyline(coordinates, { color: '#007bff', weight: 7, opacity: 0.85 }).addTo(map);

    const bounds = L.latLngBounds(coordinates as any);
    map.fitBounds(bounds, { padding: [70, 70] });

    return {
      distanceKm: route.distance / 1000,
      durationText: this.formatDuration(route.duration)
    };
  }

  getGoogleMapsDirectionLink(origin: LatLng | null, destination: LatLng): string {
    const destinationParam = `${destination.lat},${destination.lng}`;
    if (!origin) {
      return `https://www.google.com/maps/dir/?api=1&destination=${destinationParam}&travelmode=driving`;
    }

    const originParam = `${origin.lat},${origin.lng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destinationParam}&travelmode=driving`;
  }

  async getRouteDistances(origin: LatLng, destinations: LatLng[]): Promise<number[]> {
    if (!destinations.length) {
      return [];
    }

    const coords = [origin, ...destinations].map(loc => `${loc.lng},${loc.lat}`).join(';');
    const destinationsIndex = destinations.map((_, index) => index + 1).join(';');
    const url = `${this.osrmBaseUrl}/table/v1/driving/${coords}?sources=0&destinations=${destinationsIndex}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.distances || !Array.isArray(data.distances[0])) {
      return destinations.map((destination) => this.calculateDistance(origin, destination));
    }

    return data.distances[0].map((distance: number, index: number) => {
      if (distance == null || distance === Infinity) {
        return this.calculateDistance(origin, destinations[index]);
      }
      return distance / 1000;
    });
  }

  fitBounds(map: any, positions: LatLng[]) {
    if (!positions.length) {
      return;
    }

    const bounds = L.latLngBounds(positions.map(pos => [pos.lat, pos.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [70, 70] });
  }

  private calculateDistance(origin: LatLng, destination: LatLng): number {
    const dLat = (destination.lat - origin.lat) * Math.PI / 180;
    const dLng = (destination.lng - origin.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c;
  }

  private getMarkerIconUrl(color: string): string {
    const colorMap: { [key: string]: string } = {
      red: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      blue: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      green: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
      orange: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
      yellow: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
      violet: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
      grey: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
      black: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png'
    };
    return colorMap[color] || colorMap['red'];
  }

  private configureIconDefaults() {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    });
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remaining = minutes % 60;
    return `${hours}h ${remaining}m`;
  }
}
