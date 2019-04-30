import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { map, shareReplay, tap, toArray } from 'rxjs/operators';
import { Person } from '../PeopleRoot.interface';
import { SwapiService } from '../swapi.service';
import { FetchFormObservable } from '../form-demo/FetchFormObservable';
import { Observable } from 'rxjs';
// import { T_HOST } from '@angular/core/src/render3/interfaces/view';

@Component({
  selector: 'app-simple-form',
  templateUrl: './simple-form.component.html',
  styleUrls: ['./simple-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimpleFormComponent {
  @FetchFormObservable() formData$: Observable<Partial<Person>>;
  person: Person;
  person$ = this.swapi.getRandomPerson(3).pipe(
    toArray(),
    map(([person, sibling, child]) => ({
      ...person,
      sibling: { ...sibling, child }
    })),
    tap(person => (this.person = person)),
    tap(p => console.log(p)),
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


