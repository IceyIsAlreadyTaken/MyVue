export function omit<T extends Record<string, any>, K extends keyof T>(obj: T, key: K | K[]): Omit<T, K> {
  const result = { ...obj };
  if (typeof key === 'string') {
    Reflect.deleteProperty(result, key);
  }

  if (Array.isArray(key)) {
    key.forEach((k) => {
      Reflect.deleteProperty(result, k);
    });
  }
  return result;
}
