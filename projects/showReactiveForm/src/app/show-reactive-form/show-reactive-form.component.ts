import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Person } from 'src/app/PeopleRoot';
import { tap, shareReplay } from 'rxjs/operators';
import { SwapiService } from 'src/app/swapi.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-show-reactive-form',
  templateUrl: './show-reactive-form.component.html',
  styleUrls: ['./show-reactive-form.component.css']
})
export class ShowReactiveFormComponent implements OnInit {
  person: Person;
  personFG: FormGroup;

  person$ = this.swapi.getRandomPerson().pipe(
    tap(data => console.log('person loaded', data)),
    tap(person => this.loadFG(person)),
    tap(person => (this.person = person)),
    /** need to make a shallow copy to be able to diff later on */
    shareReplay(1)
  );

  loadFG(person: Person) {
    this.personFG = new FormGroup({
      name:       new FormControl(person.name),
      eye_color:  new FormControl(person.eye_color),
      hair_color: new FormControl(person.hair_color),
      birth_year: new FormControl(person.birth_year),
      mass:       new FormControl(person.mass),
      height:     new FormControl(person.height),
      date:       new FormControl(person.date),
      gender:     new FormControl(person.gender)
    });
  }

  constructor(private swapi: SwapiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.person$.subscribe();
  }

  doSave() {
    const formContent = this.personFG.value;
    const changes = Object.entries(formContent).reduce((result, [key, val]) => {
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



