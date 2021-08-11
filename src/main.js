import Vue from './instance/index';

const app = new Vue({
  el: '#app',
  data() {
    return {
      val: '初始化val',
      info: { text: '123' }, // 实现了对象的双向绑定
    };
  },
});
