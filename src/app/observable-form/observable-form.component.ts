import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Person } from '../PeopleRoot.interface';
import { toArray, map, tap, shareReplay } from 'rxjs/operators';
import { SwapiService } from '../swapi.service';

@Component({
  selector: 'app-observable-form',
  templateUrl: './observable-form.component.html',
  styleUrls: ['./observable-form.component.css']
})
export class ObservableFormComponent {
  person: Person;
  person$ = this.swapi.getRandomPerson().pipe(
    tap(data => console.log('person loaded', data)),
    tap(person => (this.person = person)),
    shareReplay(1)
  );

  constructor(private swapi: SwapiService, private cdr: ChangeDetectorRef) {}

  doSave(formdata) {
    const toSave = { ...formdata, id: this.person.id };
    console.log('saving', JSON.stringify(toSave, null, 4));
  }
}
