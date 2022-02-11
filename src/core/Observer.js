import Dep from './Dep';
import { defineReactive, observe, defArray } from '../instance/state';
import { def } from '../utils';

export default class Observer {
  dep = new Dep();

  constructor(value) {
    // 每个被劫持的对象都有一个 __ob__ 属性
    def(value, '__ob__', this, false);
    // 判断传入 value 是否为对象
    if (Object.prototype.toString.call(value) === '[object Object]') {
      this.walk(value);
    }
    // 判断传入 value 是否为数组
    if (Object.prototype.toString.call(value) === '[object Array]') {
      defArray(value);
      // 初始监听数组
      this.observeArray(value);
    }
  }

  // 遍历对象方法
  walk(value) {
    for (let key in value) {
      // 判断子结构是否为复杂类型
      if (value[key] instanceof Object) {
        // 如果子结构为一个复杂类型，则递归劫持子结构对象
        observe(value[key]);
      } else {
        defineReactive(value, key);
      }
    }
  }
  // 遍历数组方法
  observeArray(value) {
    // 1. 遍历数组，代理数组中的每个成员（如果不是对象则会自动跳过，是对象则进入 walk 代理，是数组则再次递归调用此方法）
    for (let i = 0, l = value.length; i < l; i++) {
      observe(value[i]);
    }
  }
}
