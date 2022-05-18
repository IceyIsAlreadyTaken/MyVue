import { isObject, def, hasOwn, hasProto, isUndef, isValidArrayIndex } from '../utils/index';
import Dep from './dep';
import { arrayMethods } from './array';

const arrayKeys = Object.getOwnPropertyNames(arrayMethods); // NOTE: getOwnPropertyNames会将自身的所有属性输出，Object.keys只输出自身可枚举属性

export function observe(value: any) {
  if (!isObject(value)) return;
  let ob: Observer | void; // REVIEW: void？？？？
  // 先判断是否有__ob__，如果有说明已经建立过监听了，无需重复建立
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (Object.isExtensible(value)) {
    ob = new Observer(value); // REVIEW: 面向对象，这里为何创建了Observer实例，为什么没用普通函数
  }
  return ob; // REVIEW return ob的作用
}

export function set(target: Object | Array<any>, key: string | number, val: any) {
  if (isUndef(target)) {
    throw new Error('target is not defined');
  }

  if (Array.isArray(target)) {
    // target是数组，将val设置到数组的指定位置
    if (isValidArrayIndex(key)) {
      target.length = Math.max(target.length, Number(key));
      target.splice(key as number, 1, val);
      return val;
    }
  } else {
    // 对象已有的属性值直接修改值，会自动触发key的getter/setter
    if (target.hasOwnProperty(key)) {
      (target as any)[key] = val;
      return val;
    }

    // target为普通对象，则直接修改值
    const ob = (target as any).__ob__;
    if (!ob) {
      (target as any)[key] = val;
      return val;
    }

    // 新增的属性，将属性添加为可观测属性值，并手动触发通知
    defineReactive(target, key, val);
    ob.dep.notify();
    return val;
  }
}

export function del(target: Object | Array<any>, key: string | number) {
  // 数组调用splice方法删除，若是监听属性会自动触发通知
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key as number, 1);
    return;
  }
  // NOTE: 不要忘记处理key不是target属性的情况
  if (!hasOwn(target, key)) {
    return;
  }
  // 删除属性
  delete (target as any)[key];
  // 如果是设置了监听的对象，删除后手动触发通知
  const ob = (target as any).__ob__;
  if (!ob) {
    return;
  }
  ob.dep.notify();
  return;
}

// Observer类用于把一个object中的所有数据（包括子数据）包装为响应式的，也就是会侦测数据的变化
// Observer实例会附加到每一个被侦测的object上，
class Observer {
  dep: Dep;
  constructor(value: Object) {
    // 这里有一个dep实例，主要是用于
    // ①数组的依赖收集。因为数组在getter中收集依赖，在拦截器中触发依赖，因此这个依赖就需要在getter和拦截器中都能访问到,因此将依赖保存到observer实例上。对于对象的依赖是靠defineReactive函数中的闭包dep来管理的
    // ②嵌套对象的依赖收集，比如{a:{b:x}}a属性值是一个对象，对a进行getter/setter设置时，会对其value进行深层的observe得到observer实例childObj，执行childObj.dep.depend()将watcher加入。此后如果对value上通过$set新增一个属性c，则__ob__.dep.notify()即可通知watcher做变更
    this.dep = new Dep();

    def(value, '__ob__', this); // NOTE: 将observer实例绑定到被监听对象的__ob__属性上,observe的时候先判断被监听对象是否有__ob__，避免重复建立监听
    if (Array.isArray(value)) {
      // 数组的监听，只对需要监听的数组修改其原型，避免污染全局Array
      // Array监听①侦测数组自身的变化，比如增加、删除了某个原色
      hasProto ? protoAugment(value, arrayMethods) : copyAugment(value, arrayMethods, arrayKeys);
      // Array监听②侦测数组中元素的变化，比如由{name:"1"}变为{name:"2"}
      this.observeArray(value);
    } else {
      // 对象
      this.walk(value);
    }
  }

  observeArray(items: any[]) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i]);
    }
  }

  /**
   * 遍历对象的每一个key，绑定get和set的事件拦截
   * @param {*} obj
   */
  walk(obj: Object) {
    const keys = Object.keys(obj); // NOTE: Object.keys只遍历对象自身属性，for...in遍历包含原型对象的属性
    for (let i = 0; i < keys.length; i++) {
      // @ts-ignore
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  }
}

function protoAugment(target: any, src: Object) {
  target.__proto__ = src;
}

// 浏览器不只是__proto__，则直接将方法挂载到value自身上
function copyAugment<T extends Record<string, any>, K extends keyof T & string>(target: any, src: T, keys: K[]) {
  keys.forEach((key) => {
    def(target, key, src[key]);
  });
}

function defineReactive(obj: Object, key: string | number, value: any) {
  // let dep = [];
  let dep = new Dep(); // REVIEW: 这里也有一个dep实例
  // 如果为freeze的对象，不需要再建立变化侦测监听
  const property = Object.getOwnPropertyDescriptor(obj, key);
  if (property && property.configurable === false) {
    return;
  }
  // 如果对象上绑定了getter，setter，则不能被覆盖
  const getter = property && property.get;
  const setter = property && property.set;
  // 子对象value也要进行监听
  let childObj = observe(value);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 如果对象本身有getter方法则执行
      const val = getter ? getter.call(obj) : value;
      // 收集依赖，每个key有一个数组，存储当前key的依赖
      // dep.push(window.target);
      // NOTE: 面向对象解法：每个key建立一个依赖实例，用来管理依赖的收集和监听
      dep.depend();
      if (childObj) {
        // childObj就是拿到的observer实例
        childObj.dep.depend();
      }

      return val;
    },
    set(newVal) {
      // 触发依赖
      const val = getter ? getter.call(obj) : value;
      if (val === newVal) return;
      if (setter) {
        setter.call(obj, newVal);
      } else {
        value = newVal;
      }
      dep.notify(); // REVIEW: 这里并没有将newVal和oldValue传递过去
    },
  });
}
