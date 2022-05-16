import { traverse } from './traverse';
import { parsePath } from '../utils/index';
import Dep from './dep';

export default class Watcher {
  cb: Function;
  vm: any;
  deps: Dep[];
  depIds: Set<number>;
  deep: boolean;
  getter: Function;
  value: any;

  constructor(vm: any, expOrFn: string | Function, cb: Function, options?: Object) {
    this.cb = cb;
    this.vm = vm;
    this.deps = [];
    this.depIds = new Set();
    this.deep = false;
    if (options) {
      // @ts-ignore
      this.deep = !!options.deep;
    }
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn); // NOTE:这里的getter方法用来读取vm上的数据，当getter触发时自然会触发数据的get方法，从而收集依赖
    }

    this.value = this.get();
  }

  get() {
    Dep.target = this;
    let value = this.getter.call(this.vm, this.vm._data);
    // 如果为deep深度监听，需要遍历value底下的所有属性
    if (this.deep) {
      traverse(value);
    }
    Dep.target = null;
    return value;
  }

  update() {
    const oldValue = this.value;
    this.value = this.get();
    this.cb.call(this.vm, this.value, oldValue);
  }

  addDep(dep: Dep) {
    if (!this.depIds.has(dep.id)) {
      this.depIds.add(dep.id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }

  teardown() {
    let i = this.deps.length;
    while (i--) {
      this.deps[i].removeSub(this);
    }
  }
}
