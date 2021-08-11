import Watcher from '../core/Watcher';
import { setAttr, replaceStr } from '../utils';

// 开始进入模板编译阶段 编译阶段分两部分
// 如果是 template 渲染，则需要把 template 解析成 AST，再标记静态节点，最终输出 render function 字符串
// 如果是 render 渲染，则不需要走上一步逻辑，直接开始生成 vNode
export function initMount(Vue) {
  // 先缓存mount方法 - 之前的mount方法为把 render 转换成 vNode 方法
  // 在这个方法中
  // 1.beforeMount
  // 2.编译生成vNode
  // 3.创建频道
  // 4.mounted
  const mount = Vue.prototype.$mount;
  /**
   * @name $mount
   * @description 编译模板：解析根节点，遍历子节点去解析指令，并注册为观众，绑定频道
   * @param {Node} root 节点
   */
  Vue.prototype.$mount = function (root) {
    // 遍历根节点下的所有节点，解析指令
    const nodes = root.children;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      // 如果还有子节点，则递归遍历
      if (node.children.length) {
        this.$mount(node);
      }

      // 这里要先解析双括号，因为要防止双括号初始化会向节点中添加文本节点，会在模板解析中再次初始化
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

      /*-----------------解析模板指令-------------------*/
      // 绑定子节点指令
      if (node.hasAttribute('v-model') && (node.tagName == 'INPUT' || node.tagName == 'TEXTAREA')) {
        // 初始化赋值
        const attr = node.getAttribute('v-model');
        // 创建 观众 - 自动订阅频道
        new Watcher(this.$data, attr, (newVal) => {
          node.value = newVal;
        });
        // 如果元素绑定了 v-model指令 且 元素为输入框
        node.addEventListener(
          'input',
          (e) => {
            // 赋值对应的属性，更新订阅
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
    }
  };
}
