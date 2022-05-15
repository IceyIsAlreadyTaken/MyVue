import { isObject } from '../utils/shared';

const seenObjects: Set<number> = new Set();

export function traverse(val: any) {
  _traverse(val, seenObjects);
  seenObjects.clear();
}

function _traverse(val: any, seen: Set<number>) {
  // 非对象或数组无需深层依赖收集
  if (!isObject(val)) {
    return;
  }
  // REVIEW: 此处的seen是为了做什么?? 不会重复收集依赖????
  // if (val.__ob__) {
  //   const depId = val.__ob__;
  //   if (seen.has(depId)) {
  //     console.log('seen has depid', val.__ob__);
  //     return;
  //   }
  //   seen.add(depId);
  // }

  const keys = Object.keys(val);

  keys.forEach((key) => {
    traverse(val[key]);
  });
}
