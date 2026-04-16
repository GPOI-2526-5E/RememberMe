export interface Cemetery {
  _id?: string;           
  name: string;
  location: string;
  lat: number;
  lng: number;
  image: string;
  description: string;
  deceased?: any[];
}