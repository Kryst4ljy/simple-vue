/**
 * @name Dep
 * @description Dep类为每个频道的订阅者列表，提供一个subs数组来维护此频道的订阅者
 */
export default class Dep {
  static target = null;

  constructor() {
    this.subs = []; // 订阅者列表
  }

  // 添加订阅
  addSub(sub) {
    this.subs.push(sub);
  }

  // 删除订阅
  removeSub(sub) {}

  // 自动订阅
  depend() {
    if (Dep.target) {
      this.addSub(Dep.target);
    }
  }

  // 发布订阅
  notify() {
    this.subs.forEach((m) => {
      m.update();
    });
  }
}
