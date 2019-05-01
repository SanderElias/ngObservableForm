import { ɵgetDirectives as getDirectives } from '@angular/core';

const belongsTo = Symbol('belongsTo');

export function* findNewDirectives(elm: HTMLElement, dirs: any[], owner?: {}): IterableIterator<[HTMLElement, any]> {
  for (const [el, dir] of findDirectives(elm, dirs)) {
    if (el[belongsTo] === undefined) {
      el[belongsTo] = owner;
      yield [el, dir];
    }
  }
}

export function* findDirectives(elm: HTMLElement, dirs: any[]): IterableIterator<[HTMLElement, any]> {
  for (const [el, dir] of findAllDirectives(elm)) {
    if (dirs.some(d => dir instanceof d)) {
      // console.log(el.tagName, dir, dirs)
      yield [el, dir];
    }
  }
}

function* findAllDirectives(elm: HTMLElement) {
  if (elm != null) {
    for (const dir of getDirectives(elm)) {
      yield [elm, dir];
      // console.log('found',elm.tagName, dir.constructor.name)
    }
    // console.log(elm.tagName, elm, getDirectives(elm));
  } else {
    return;
  }

  for (const child of elm.childNodes as unknown as HTMLElement[]) {
    yield* findAllDirectives(child as HTMLElement);
  }

  // if (elm.nextSibling) {
  //   yield* findAllDirectives(elm.nextElementSibling as HTMLElement);
  // }
}
