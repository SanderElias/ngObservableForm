import { ɵgetDirectives as getDirectives } from '@angular/core';

const belongsTo = Symbol('belongsTo');

export function* findNewDirectives(
  elm: HTMLElement,
  dirs: any[],
  owner?: {}
): IterableIterator<[HTMLElement, any]> {
  for (const [el,dir] of findDirectives(elm,dirs)) {
    if (el[belongsTo] === undefined) {
      el[belongsTo] = owner;
      yield [el,dir]
    }
  }

}

export function* findDirectives(
  elm: HTMLElement,
  dirs: any[]
): IterableIterator<[HTMLElement, any]> {
  const outerDirective = getDirectives(elm).find(i =>
    dirs.some(dir => i instanceof (dir as any))
  );
  if (outerDirective) {
    yield [elm as HTMLElement, outerDirective];
  }
  for (const item of (elm.children as unknown) as HTMLElement[]) {
    const directive = getDirectives(item).find(i =>
      dirs.some(dir => i instanceof (dir as any))
    );
    if (directive) {
      yield [item as HTMLElement, directive];
    }
    if (item.children.length > 0) {
      yield* findNewDirectives(item, dirs);
    }
  }
}
