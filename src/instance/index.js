import { initMixin } from './init';
import { initMount } from '../platforms/complie';

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

initMixin(Vue);
// $mount需要根据最终渲染目标决定，vue是根据初始命令走不同的$mount
// 注意vue中无此initMount方法（自己加的）
initMount(Vue);
