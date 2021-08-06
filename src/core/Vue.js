import Watcher from './Watcher';
import Dep from './Dep';
import { setAttr, replaceStr } from '../utils';

/**
 * @name Vue 简易vue实现
 * @description 这是一个简单的vue实现，目前只实现了vue的数据绑定以及 v-model v-bind 指令，持续更新中...
 * @param {Element} el 项目的根节点
 * @param {Function} data 实现数据响应的对象
 */
export default class Vue {
  constructor(option) {
    this._init(option);
  }
}

Vue.prototype._init = function (option) {
  const vm = this;

  vm.$el = document.querySelector(option.el); // 项目根节点
  vm.$data = option.data(); // data对象

  // create：监听data对象 - 相当于为data对象的每一个属性创建一个频道
  vm.defineReactive(vm.$data);

  // mounted：读取根节点，挂载数据
  if (vm.$el) {
    vm.complie(vm.$el);
  }
};

/**
 * @name defineReactive
 * @description 监听对象属性变化方法，自动订阅以及发布订阅
 * @param {Object} obj 实现数据响应的对象
 */
Vue.prototype.defineReactive = function (obj) {
  if (!(obj instanceof Object)) return;
  // 遍历对象
  for (let key in obj) {
    let val = obj[key]; // 赋值
    if (val instanceof Object) {
      this.defineReactive(val);
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
};

/**
 * @name complie
 * @description 编译模板：解析根节点，遍历子节点去解析指令，并注册为观众，绑定频道
 * @param {Node} root 节点
 */
Vue.prototype.complie = function (root) {
  // 遍历根节点下的所有节点，解析指令
  const nodes = root.children;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    // 如果还有子节点，则递归遍历
    if (node.children.length) {
      this.complie(node);
    }

    /*-----------------解析模板指令-------------------*/
    // 绑定子节点指令
    if (node.hasAttribute('v-model') && (node.tagName == 'INPUT' || node.tagName == 'TEXTAREA')) {
      // 如果元素绑定了 v-model指令 且 元素为输入框
      node.addEventListener(
        'input',
        (e) => {
          // 赋值对应的属性，更新订阅
          const attr = node.getAttribute('v-model');
          setAttr(this.$data, attr, e.target.value);
        },
        false,
      );
    }

    if (node.hasAttribute('v-bind')) {
      const attr = node.getAttribute('v-bind');
      // 创建 观众 - 自动订阅频道
      new Watcher(this.$data, attr, (newVal) => {
        node.innerText = newVal;
      });
    }

    /*-----------------解析 {{}} -------------------*/
    if (node.childNodes.length !== 0) {
      const childList = node.childNodes;
      childList.forEach((child) => {
        if (child.nodeType === 3) {
          // 文本节点
          replaceStr(this.$data, child);
        }
      });
    }
  }
};
