import Dep from './Dep';
import { parsePath } from '../utils';

/**
 * @name Watcher
 * @description 观察者：也就是观众，在使用到data里的属性的时候，会生成一个观察者去订阅此属性。
 * @param {Object} data 是vue的data对象，此对象属性被劫持，里面的每个属性成为了一个频道。
 * @param {String} key data对象的一个属性键名，data对象的每个属性都为一个频道
 * @param {Function} cb 副作用函数，当频道发布订阅内容后，调用此函数进行更新UI
 */
export default class Watcher {
  constructor(obj, key, cb) {
    this._data = obj; // data对象
    this.key = key; // 频道
    this.cb = cb; // 副作用函数
    this.getter = parsePath(this.key);
    this.get();
  }

  // 订阅频道
  get() {
    Dep.target = this;
    this.getter.call(this._data, this._data); // 触发data的get方法，进行自动订阅
    Dep.target = null;
  }

  // 更新订阅
  update() {
    const newVal = this.getter.call(this._data, this._data);
    this.cb(newVal);
  }
}
