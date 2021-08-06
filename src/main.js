import Vue from './core/Vue';

const app = new Vue({
  el: '#app',
  data() {
    return {
      val: '',
      info: { text: '123' }, // 实现了对象的双向绑定
    };
  },
});
