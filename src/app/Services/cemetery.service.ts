import { Injectable } from '@angular/core';
import { Cemetery } from '../Models/cemetery';
import { Deceased } from '../Models/deceased';

@Injectable({ providedIn: 'root' })
export class CemeteryService {
  private cemeteries: Cemetery[] = [
    {
      id: 'c1',
      name: 'Cimitero Monumentale di Staglieno',
      location: 'Genova',
      lat: 44.4186,
      lng: 8.9623,
      image: 'https://picsum.photos/id/1015/600/400',
      description: 'Uno dei più grandi e suggestivi cimiteri d’Italia.'
    },
    {
      id: 'c2',
      name: 'Cimitero del Verano',
      location: 'Roma',
      lat: 41.9028,
      lng: 12.5206,
      image: 'https://picsum.photos/id/160/600/400',
      description: 'Cimitero storico della Capitale.'
    },
    {
      id: 'c3',
      name: 'Cimitero di Père-Lachaise',
      location: 'Milano (simulato)',
      lat: 45.4789,
      lng: 9.1964,
      image: 'https://picsum.photos/id/201/600/400',
      description: 'Ispirato al celebre cimitero parigino.'
    }
  ];

  private deceasedList: Deceased[] = [
    { id: 'd1', name: 'Mario Rossi', tombId: 'A-12', lat: 44.4188, lng: 8.9625, birth: '1950', death: '2020', description: 'Amato padre e nonno.' },
    { id: 'd2', name: 'Anna Bianchi', tombId: 'B-34', lat: 44.4189, lng: 8.9621, birth: '1965', death: '2023', description: 'Artista e poetessa.' }
  ];

  getAllCemeteries(): Cemetery[] { return this.cemeteries; }

  getCemeteryById(id: string): Cemetery | undefined {
    return this.cemeteries.find(c => c.id === id);
  }

  getDeceasedByCemetery(cemeteryId: string): Deceased[] {
    return this.deceasedList; // mock – in produzione filtrato per cimitero
  }

  getDeceasedByName(name: string): Deceased[] {
    return this.deceasedList.filter(d => d.name.toLowerCase().includes(name.toLowerCase()));
  }
}
