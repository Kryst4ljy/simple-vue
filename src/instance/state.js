import Dep from '../core/Dep';
import Observer from '../core/Observer';
import { def } from '../utils';

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: null,
  set: null,
};

export function initState(vm) {
  /******************initData*****************************************/
  if (vm.$data) {
    initData(vm);
  }
}

/**
 * @name initData
 * @param {*} vm 当前vue实例
 * @description 此方法为初始化vue实例的data对象，代理对象（app[data][info] -> app[info]）劫持对象
 */
function initData(vm) {
  const data = vm.$data;
  const keys = Object.keys(data);
  let i = keys.length;
  while (i--) {
    const key = keys[i];
    // 代理对象
    proxy(vm, `$data`, key);
  }

  // 劫持对象
  observe(vm.$data);
}

/**
 * @name proxy
 * @param {*} vm 当前vue实例
 * @param {*} sourceKey 源数据 需要代理的key - data
 * @param {*} key 代理后的key
 * @description 代理对象（app[data][info] -> app[info]）这样可以直接通过 vm.info 操作vm.$data.info
 */
function proxy(vm, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };
  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(vm, key, sharedPropertyDefinition);
}

/**
 * @name observe
 * @description 监听对象属性变化方法，自动订阅以及发布订阅
 * @param {{*}} obj 实现数据响应的data
 */
export function observe(obj) {
  if (!(obj instanceof Object)) return;
  let ob = undefined;
  if (typeof obj['__ob__'] !== 'undefined') {
    ob = obj['__ob__'];
  } else {
    ob = new Observer(obj);
  }
  return ob;
}

export const defineReactive = (obj, key) => {
  if (!(obj instanceof Object)) return;
  // 赋值 - 这边必须创建一个临时变量储存obj[key]，不然在get中返回obj[key]会再次触发get，陷入死循环
  let val = obj[key];
  const dep = new Dep();
  Object.defineProperty(obj, key, {
    enumerable: true, // 是否可枚举
    configurable: true, // 是否可配置
    get() {
      // console.log(`get：${key} - ${val}`);
      // 直接通过取值无法订阅，必须借由创建watcher来添加订阅
      dep.depend(); // 订阅
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      // console.log(`set：${key} - ${newVal}`);
      val = newVal;
      // 发布时是触发watcher的update函数从而进行不同的操作，比如input是setAttr等
      dep.notify(); // 发布
    },
  });
};

// 获取数组原型，继承所有方法，改写其中七个方法
export const defArray = (arr) => {
  // 需要被改写的数组方法名集合
  const arrMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
  // 【数组原型对象】
  const original = Array.prototype;
  // 【数组原型劫持者】：衍生于数组原型对象 也就是相当于：arrayMethod.__proto__ === Array.prototype
  const arrayMethod = Object.create(original);
  // 遍历需要改写的方法，修改数组原型劫持者中的这些方法
  arrMethods.forEach((m) => {
    // 改写数组原型劫持者里的需要改写的方法
    def(arrayMethod, m, function () {
      original[m].apply(this, arguments);
      // 删除数组项不需要监听（去掉原频道订阅 watcher - 未做），新增数组项需要加监听
      const argumentsArr = [...arguments];
      // 获取新增数组项
      let insertArr = [];
      switch (m) {
        case 'push':
        case 'unshift':
          insertArr = argumentsArr;
          break;
        case 'splice':
          insertArr = argumentsArr.slice(2);
          break;
      }
      // 监听新插入的数组项
      const ob = arr.__ob__;
      ob.observeArray(insertArr);
      // 触发此数组的监听
      console.log('这里需要触发监听');
      ob.dep.notify();
    });
  });
  // 改写传入的数组的原型对象为【数组原型劫持者】，这样既改写了其中需要改写的方法，又继承了其他数组方法
  Object.setPrototypeOf(arr, arrayMethod);
};
