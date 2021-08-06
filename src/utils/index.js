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

// 取值：当 v-bind 绑定的值是对象时，取到data中的对象值
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
  const getter = parsePath(attr);
  const initValue = getter(data);
  const initRes = str.replace(replaceReg, function (...args) {
    return initValue;
  });
  node.data = initRes;
  // 创建 观众 - 自动订阅频道
  new Watcher(data, attr, (newVal) => {
    const res = str.replace(replaceReg, function (...args) {
      return newVal;
    });
    node.data = res;
  });
};
