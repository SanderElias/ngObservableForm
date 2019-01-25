export interface PeopleRoot {
  count: number;
  next: string;
  previous: null;
  results: People[];
}
export interface People {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: Gender;
  homeworld: string;
  films: string[];
  species: string[];
  vehicles: string[];
  starships: string[];
  created: string;
  edited: string;
  url: string;
}
export enum Gender {
  Female = "female",
  Male = "male",
  NA = "n/a"
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
