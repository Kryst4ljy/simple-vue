import Watcher from '../core/Watcher';

/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */
var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

/**
 * Parse simple path.
 */
var bailRE = new RegExp('[^' + unicodeRegExp.source + '.$_\\d]');

// 取值：当 v-bind {{}} 绑定的值是对象时，取到data中的对象值
export const parsePath = function (path) {
  if (bailRE.test(path)) return;

  var segments = path.split('.');

  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) {
        return;
      }
      obj = obj[segments[i]];
    }
    return obj;
  };
};

// 赋值：当 v-model 绑定的值是对象时，赋值给data对象
export const setAttr = function (obj, path, val) {
  if (!obj) return;
  if (bailRE.test(path)) return;

  var segments = path.split('.');

  for (var i = 0; i < segments.length - 1; i++) {
    obj = obj[segments[i]];
  }
  obj[segments[segments.length - 1]] = val;
};

export const replaceStr = function (data, node) {
  const replaceReg = /\{\{((?:.|\r?\n)+?)\}\}/g;
  const attrReg = /\{\{((?:.|\r?\n)+?)\}\}/;
  const str = node.data;
  const attr = str.match(attrReg)[1].trim();
  // 初始化赋值
  initData(data, attr, node, 'data')
  // 创建 观众 - 自动订阅频道
  new Watcher(data, attr, (newVal) => {
    const res = str.replace(replaceReg, function (...args) {
      return newVal;
    });
    node.data = res;
  });
};

/**
 * @name initData
 * @description 初始化 v-bind {{}} 双向绑定语法赋值
 * @param {Object} data 双向绑定的data对象
 * @param {String} attr 双向绑定的data对象的属性 可能为 a.b.c
 * @param {Node} vm 要绑定的节点 - 订阅属性（频道）的观众
 * @param {String} key 要被赋值的节点的属性 - input的value 或者文本节点的 innerText等
 */
export const initData = function (data, attr, vm, key) {
  const replaceReg = /\{\{((?:.|\r?\n)+?)\}\}/g;
  const attrReg = /\{\{((?:.|\r?\n)+?)\}\}/;
  // 先获取data中此attr属性的值
  const getter = parsePath(attr);
  const initValue = getter(data);
  let str = vm[key];
  // 先判断是 v-bind 还是 {{}}语法 - 看 vm[key]是否存在 以及是否存在 {{}}
  if (!!str && attrReg.test(str)) {
    const initRes = str.replace(replaceReg, function (...args) {
      return initValue;
    });
    // 进行初始化的赋值操作
    vm[key] = initRes;
    return;
  }
  // 进行初始化的赋值操作
  vm[key] = initValue;
}