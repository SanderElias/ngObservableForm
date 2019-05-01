import { get, set, clear } from 'idb-keyval';
let cache: Map<string, object>;
const cacheName = 'sample-cache';

export async function initCache() {
  if (cache) {
    return cache;
  }
  const cachedResults: Map<string, object> | undefined = await get(cacheName);
  cache = cachedResults ? new Map([...cachedResults]) : new Map();
  return cache;
}
export function addToCache(key: string, anyData: object) {
  cache.set(key, anyData);
  set(cacheName, cache);
}
export function cacheHas(key: string): boolean {
  return cache.has(key);
}
export function getFromCache(key) {
  return cache.get(key);
}

export function clearCache() {
  cache.clear();
  clear();
}
