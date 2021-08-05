import Dep from "./Dep";

export default class Watcher {
  constructor(obj, key, cb) {
    this.channel = obj; // 频道
    this.key = key; // 具体的up主
    this.cb = cb; // 副作用函数
    this.get();
  }

  // 订阅频道
  get() {
    Dep.target = this;
    this.channel[this.key]; // 触发data的get方法，进行自动订阅
    Dep.target = null;
  }

  // 更新订阅
  update() {
    const newVal = this.channel[this.key];
    this.cb(newVal);
  }
}
