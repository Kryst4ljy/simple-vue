import { initState } from './state';

export function initMixin(Vue) {
  Vue.prototype._init = function (option) {
    const vm = this;

    vm.$el = document.querySelector(option.el); // 项目根节点
    vm.$data = option.data(); // data对象

    /******************beforeCreate*****************************************/
    initState(vm);

    /******************Created*****************************************/

    /******************$mount*****************************************/
    if (vm.$el) {
      // 开始进入模板编译阶段 编译阶段分两部分
      // 如果是 template 渲染，则需要把 template 解析成 AST，再标记静态节点，最终输出 render function 字符串
      // 如果是 render 渲染，则不需要走上一步逻辑，直接开始生成 vNode
      vm.$mount(vm.$el);
    }
  };
}
