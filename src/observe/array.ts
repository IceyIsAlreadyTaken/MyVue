import { def } from '../utils/index';

const arrayProto: { [prop: string]: any } = Array.prototype;

export const arrayMethods = Object.create(arrayProto);

const methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];

// 给arrayMethods上的凡是可以修改数组的方法，都做一层代理，这样就可以在代理层面去发送通知了
methodsToPatch.forEach((method: string) => {
  const original = arrayProto[method];

  def(arrayMethods, method, function (...args: any) {
    // Array监听③插入的元素也需要重新监听
    // @ts-ignore
    const result = original.apply(this, args); // NOTE: 处理参数的接收和传递
    // @ts-ignore
    const ob = this.__ob__; //NOTE: 这里的this处理的妙，直接拿到了被监听的对象，而被监听对象上又挂载了observer实例，所以直接访问到了依赖收集的dep实例

    let inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
    }

    if (inserted) {
      ob.observeArray(inserted);
    }
    ob.dep.notify();
    return result;
  });
});
