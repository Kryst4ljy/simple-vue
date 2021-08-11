import Dep from '../core/Dep';

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
 * @description 代理对象（app[data][info] -> app[info]）
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
  // 遍历对象
  for (let key in obj) {
    let val = obj[key]; // 赋值
    if (val instanceof Object) {
      observe(val);
    }
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      enumerable: true, // 是否可枚举
      configurable: true, // 是否可配置
      get() {
        // console.log(`get：${key} - ${val}`);
        dep.depend(); // 订阅
        return val;
      },
      set(newVal) {
        if (newVal === val) return;
        // console.log(`set：${key} - ${newVal}`);
        val = newVal;
        dep.notify(); // 发布
      },
    });
  }
}
