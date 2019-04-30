export const dropUndefined = (obj: Record<string, any>) =>
  Object.entries(obj)
    .filter(([key, val]) => val !== undefined)
    .reduce((r, [key, val]) => {
      r[key] = val;
      return r;
    }, {});
