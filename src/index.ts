import { observe } from './observe/index';
import { initWatch } from './instance/state';

function proxyData(obj: Object, data: Record<string, any>) {
  for (let key in data) {
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        return data[key];
      },
      set(val) {
        data[key] = val;
      },
    });
  }
}

export default class MyVue {
  _data: Object = {};
  constructor(options: { data: any; [prop: string]: any }) {
    // 初始化options
    this.init(options);
    proxyData(this, options.data);
  }

  init(options: { data: any; [prop: string]: any }) {
    // 判断options.data是否为函数
    let data = options.data;
    if (typeof options.data === 'function') data = options.data();
    this._data = data;
    observe(data);
    if (options.watch) {
      initWatch(this, options.watch);
    }
  }
}
