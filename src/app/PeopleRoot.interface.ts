import { Film } from './FilmsRoot.interface';

export interface PeopleRoot {
  count: number;
  next: string;
  previous: null;
  results: Person[];
}
export interface Person {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: Gender;
  homeworld: string;
  films: any[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
  /** I added a couple of fields for the demo */
  date?: Date;
  id?: string;
}
export enum Gender {
  Female = 'female',
  Male = 'male',
  NA = 'n/a'
}
export interface Address {
  id: number;
  firstname: string;
  lastname: string;
  age: number;
  address: string;
  cityStateZip: string;
  country: string;
  phone: string;
  email: string;
  src: string;
  remarks: string;
}
