import Watcher from './watcher';

let uid = 0;

export default class Dep {
  id: number;
  subs: Watcher[] = []; // NOTE: 面向对象解法：这里存储的依赖只是watcher实例，一个组件会建立一个watcher实例，watcher实例中管理的是具体的回调
  static target: Watcher | null = null;
  constructor() {
    this.id = uid++;
    this.subs = [];
  }

  addSub(sub: Watcher) {
    this.subs.push(sub);
  }

  removeSub(sub: Watcher) {
    const index = this.subs.indexOf(sub);
    if (index !== -1) {
      this.subs.splice(index, 1);
    }
  }

  depend() {
    if (Dep.target) {
      Dep.target.addDep(this); // 将dep实例加入到watcher的deps列表中
    }
  }

  notify() {
    // const subs = this.subs.slice(); // REVIEW：why copy？？？
    for (let i = 0; i < this.subs.length; i++) {
      this.subs[i].update();
    }
  }
}
