import { ɵgetDirectives as getDirectives } from '@angular/core';

export function* findDirectives<T>(elm: HTMLElement, dirs: any[]): IterableIterator<[HTMLElement, T]> {
  const outerDirective = getDirectives(elm).find(i => dirs.some(dir => i instanceof (dir as any)));
  if (outerDirective) {
    yield [elm as HTMLElement, outerDirective as T];
  }
  for (const item of (elm.children as unknown) as HTMLElement[]) {
    const directive = getDirectives(item).find(i => dirs.some(dir => i instanceof (dir as any)));
    if (directive) {
      yield [item as HTMLElement, directive as T];
    }
    if (item.children.length > 0) {
      yield* findDirectives(item, dirs);
    }
  }
}
