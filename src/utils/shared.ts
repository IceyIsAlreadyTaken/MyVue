export function isObject(data: unknown) {
  return typeof data === 'object' && data !== null;
}

export function parsePath(path: string): (obj: any) => any {
  if (/[^\w.$]/.test(path)) return () => {}; // 不是字母数字_.组成的路径str，不做处理，NOTE:别忘记$
  const segments = path.split('.');
  return function (obj: Record<string, any>) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}

export function def(obj: Object, key: string, value: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}

export function hasOwn(obj: Object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key); // NOTE: 通过call借用方法，不用判断obj的类型是否为object了
}
