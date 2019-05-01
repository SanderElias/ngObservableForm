import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { shareReplay, tap, delay } from 'rxjs/operators';
import { SwapiService } from 'src/app/swapi.service';
import { Person } from 'src/app/PeopleRoot.interface';

@Component({
  selector: 'app-ng-model-form',
  templateUrl: './ng-model-form.component.html',
  styleUrls: ['./ng-model-form.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class NgModelFormComponent implements OnInit {
  person: Person;
  editPerson: Partial<Person>;
  person$ = this.swapi.getRandomPerson().pipe(
    tap(data => console.log('person loaded', data)),
    tap(person => (this.person = person)),
    /** need to make a shallow copy to be able to diff later on */
    tap(person => (this.editPerson = { ...person })),
    shareReplay(1)
  );

  constructor(private swapi: SwapiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.person$.subscribe();
  }

  doSave() {
    const changes = Object.entries(this.editPerson).reduce((result, [key, val]) => {
      if (val !== this.person[key]) {
        /** we found a changed value */
        result[key] = val;
      }
      return result;
    }, {});
    const toSave = { ...changes, id: this.person.id };
    console.log('saving', JSON.stringify(toSave, null, 4));
  }
}
