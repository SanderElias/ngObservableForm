import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Optional
} from '@angular/core';
import { concat, Observable } from 'rxjs';
import {
  mergeMap,
  shareReplay,
  tap,
  concatAll,
  map,
  toArray
} from 'rxjs/operators';
import { SwapiService } from '../swapi.service';
import { Person } from '../PeopleRoot.interface';
import { Film } from '../FilmsRoot.interface';

@Component({
  selector: 'app-simple-form',
  templateUrl: './simple-form.component.html',
  styleUrls: ['./simple-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleFormComponent {
  person: Person;
  person$ = this.swapi.getRandomPerson().pipe(
    mergeMap(data =>
      concat(...data.films.map(film => this.swapi.findFilmByUrl(film))).pipe(
        toArray(),
        map(films => ({ ...data, films })),
        tap(r => console.log('r', r))
      )
    ),
    tap(data => console.log('person loaded', data)),
    tap(person => (this.person = person)),
    // /** for now we need to kick ivy into action. */
    tap(() => Promise.resolve().then(() => this.cdr.detectChanges())),
    shareReplay(1)
  );

  constructor(private swapi: SwapiService, private cdr: ChangeDetectorRef) {}

  doSave(formdata) {
    const toSave = { ...formdata, id: this.person.id };
    console.log('saving', JSON.stringify(toSave, null, 4));
  }
}
