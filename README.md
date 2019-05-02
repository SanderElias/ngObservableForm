# seObservableForm

ngObservableForm is an alternative form module for angular.
Key reasons for choosing this module.

1. Reduce complexity around forms
2. Provide an easy to use API
3. Fully immutable data flow.
4. Only reports changes.
5. Native HTML form elements.
6. Exposes the forms data as an observable stream

![sample](./documentation/assets/sample1.png)


```HTML
<form (save)="doSave($event)" observable [fillForm]="someObject">
  <label>Name</label>
  <input type="text" name="name" minlength="2" required autofocus />

  <label>Hair color</label>
  <input type="text" name="hair_color" />

  <label>Date</label>
  <input type="date" name="date" />
  <div class="buttons">
    <button type="submit">Save</button> <button type="reset">Reset</button>
  </div>
</form>
```

