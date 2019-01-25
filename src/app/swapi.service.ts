// tslint:disable:member-ordering
// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of, from } from 'rxjs';
import {
  catchError,
  expand,
  map,
  scan,
  shareReplay,
  tap,
  pluck,
  filter,
  first,
  take,
  reduce
} from 'rxjs/operators';

import { Chance } from 'chance';
import { Address, PeopleRoot, People } from './PeopleRoot';

const chance = new Chance();

@Injectable({
  providedIn: 'root'
})
export class SwapiService {
  // Get a page of people
  //   next?: any; // url of next page (if there is one)
  //   results: People;
  private load = (url: string): Observable<PeopleRoot> =>
    from(fetch(url).then(r => r.json())).pipe(
      catchError(() => of(null)),
    );

  // load all people form the paged API
  // start off with loading the first page.
  swPeople$ = this.load(`https://swapi.co/api/people/`).pipe(
    // expand to get additional pages
    // hint: r.next means there's another page
    // expand(r => (r.next ? this.load(r.next) : EMPTY)),

    // for each page, extract the people (in results)
    map(r => r.results),

    // scan to accumulate the pages (emitted by expand)
    reduce<People[]>(
      (allPeople, pageOfPeople) => allPeople.concat(pageOfPeople),
      []
    ),

    // sort them
    // map(list => list.sort(byName)),

    // Share the result with all subscribers
    shareReplay(1)
  );

  allPeople$ = of(data()).pipe(shareReplay(1));

  findById = id =>
    this.allPeople$.pipe(
      map(list => list.filter(row => row.id === id)),
      filter(Boolean),
      take(1)
    );

  constructor(/*private http: HttpClient*/) {}

  findWithName = (name: string) =>
    this.swPeople$.pipe(
      map(list =>
        list.find(row =>
          row.name.toLowerCase().includes(name.toLowerCase().trim())
        )
      )
    );
}

function data() {
  // tslint:disable-next-line:max-line-length
  return Array.from({ length: 100 }, (e, i) => ({
    id: i,
    ...fakeAddress()
  })) as Address[];
}

function fakeAddress() {
  const a = {} as { [x: string]: any };
  a.firstname = chance.first();
  a.lastname = chance.last();
  a.age = chance.age();
  a.address = chance.address();
  a.cityStateZip = chance.city() + ', ' + chance.state() + ' ' + chance.zip();
  a.country = chance.country();
  a.phone = chance.phone();
  a.email = chance.email();
  a.src = chance.url({ extensions: ['gif', 'jpg', 'png'] });
  a.remarks = chance.paragraph({
    sentences: chance.integer({ min: 2, max: 5 })
  });

  return a;
}
