export interface Cemetery {
  _id?: string;
  name: string;
  type?: string;
  location: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  address?: string;
  city?: string;
  country?: string;
  description: string;
  image?: string;

  // Proprietà calcolate per compatibilità
  lat?: number;
  lng?: number;
}