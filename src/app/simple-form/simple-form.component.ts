import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { concat } from 'rxjs';
import { map, mergeMap, shareReplay, tap, toArray } from 'rxjs/operators';
import { Person } from '../PeopleRoot.interface';
import { SwapiService } from '../swapi.service';

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
