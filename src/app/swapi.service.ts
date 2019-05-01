// tslint:disable:member-ordering
// import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concat, EMPTY, from, Observable, of } from 'rxjs';
import {
  concatMap,
  expand,
  filter,
  map,
  mergeMap,
  reduce,
  shareReplay,
  take,
  toArray,
  tap,
  concatAll,
  observeOn
} from 'rxjs/operators';
import { addToCache, cacheHas, getFromCache, initCache } from '../utils/cache';
import { Film, FilmsRoot } from './FilmsRoot.interface';
import { PeopleRoot, Person } from './PeopleRoot.interface';

@Injectable({
  providedIn: 'root'
})
export class SwapiService {
  baseUrl = `https://swapi.co/api/`;
  swapiRoot: SwapiRoot;
  // Get a page of people
  //   next?: any; // url of next page (if there is one)
  //   results: People;
  private load = async <T>(url: string): Promise<T> => {
    await initCache();
    if (!cacheHas(url)) {
      const liveData = await fetch(url)
        .then(r => r.json())
        .catch(e => undefined);
      await addToCache(url, liveData);
    }

    return (getFromCache(url) as unknown) as T;
  };

  // load all people form the paged API
  // start off with loading the first page.
  swPeople$ = from(this.load<PeopleRoot>(`${this.baseUrl}people/`)).pipe(
    // expand to get additional pages
    // hint: r.next means there's another page
    expand(r => (r.next ? this.load(r.next) : EMPTY)),

    // for each page, extract the people (in results)
    map((r: PeopleRoot) => r.results),

    // scan to accumulate the pages (emitted by expand)
    reduce<Person[]>(
      (allPeople, pageOfPeople) => allPeople.concat(pageOfPeople),
      []
    ),

    map(persons =>
      persons.map(
        p => ({ ...p, date: getRandomDateInPast(), id: p.url } as Person)
      )
    ),

    // Share the result with all subscribers
    shareReplay(1)
  );

  findById = (id: number): Observable<Person> =>
    this.swPeople$.pipe(
      map(list => list[id]),
      filter(Boolean),
      take(1)
    );

  swFilms$ = from(this.load<FilmsRoot>(`${this.baseUrl}films/`)).pipe(
    shareReplay(1)
  );

  getAllPagedData(url): Observable<any> {
    return from(this.load(`${url}`)).pipe(
      expand(r => (r['next'] ? this.load(r['next']) : EMPTY))
    );
  }

  findFilmByUrl = (url: string): Observable<Film> =>
    this.swFilms$.pipe(
      map(films => films.results.find(film => film.url === url)),
      take(1)
    );

  getRandomPerson = (count = 1): Observable<Person> =>
    from(Array.from({ length: count })).pipe(
      concatMap(() =>
        this.swPeople$.pipe(
          map(list => {
            const i = Math.floor(Math.random() * list.length);
            return list[i];
          }),
          /** load in films data */
          mergeMap(data =>
            concat(...data.films.map(film => this.findFilmByUrl(film))).pipe(
              toArray(),
              map(films => ({ ...data, films }))
            )
          )
        )
      )
    );

  constructor(/*private http: HttpClient*/) {
    this.loadData();
  }

  /**
   * Load an item from SWAPI using its url. uses local buffer first.
   * @param url
   */
  get<T>(url: string): Observable<T> {
    const base = Object.values(this.swapiRoot).find(top =>
      url.toLowerCase().includes(url.toLowerCase())
    );

    if (base) {
      return this.getAllPagedData(base).pipe(
        map((baseData: any) => baseData.results.find(row => row.url === url))
      );
    }
    return from(this.load(url) as Promise<T>);
  }

  /** load everything from the SWAPI.co into indexedDB */
  loadData() {
    from(this.load(this.baseUrl))
      .pipe(
        tap(swapiRoot => (this.swapiRoot = this.swapiRoot)),
        concatMap(r => Object.values(r).map(url => this.getAllPagedData(url))),
        concatAll(),
        toArray()
        /** log result */
        // tap(r => console.log(r))
      )
      .subscribe();
  }

  findWithName = (name: string) =>
    this.swPeople$.pipe(
      map(list =>
        list.find(row =>
          row.name.toLowerCase().includes(name.toLowerCase().trim())
        )
      )
    );
}

function getRandomDateInPast() {
  const year = Math.ceil(Math.random() * 1000) + 1000;
  const month = Math.floor(Math.random() * 12);
  const day = Math.ceil(Math.random() * 27);
  return new Date(year, month, day, 12, 0);
}

export interface SwapiRoot {
  people: string;
  planets: string;
  films: string;
  species: string;
  vehicles: string;
  starships: string;
}
