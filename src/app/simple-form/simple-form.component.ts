import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SwapiService } from '../swapi.service';
import { People } from '../PeopleRoot';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-simple-form',
  templateUrl: './simple-form.component.html',
  styleUrls: ['./simple-form.component.css']
})
export class SimpleFormComponent implements OnInit {
  data$ = this.swapi.findWithName('luke').pipe(
    tap(data => console.log('data', data)),
    tap(data => (this.data = data)),
    tap(() => Promise.resolve().then(() => this.cdr.detectChanges()))
  );

  datasub = this.data$.subscribe();

  data: People;
  constructor(private swapi: SwapiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  doSave(formdata) {}

  assignForm(x) {}
}
