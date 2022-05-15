import Watcher from '../observe/watcher';
import { isObject, omit } from '../utils/index';

export function initWatch(vm: any, watch: Record<string, any>) {
  for (const key in watch) {
    const handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm: object, key: string, handler: any) {
  let options = {};
  if (isObject(handler)) {
    options = omit(handler, 'handler');
    handler = handler.handler;
  }
  // TODO: 解决handler是方法名的情况

  let watcher = new Watcher(vm, key, handler, options);
}
