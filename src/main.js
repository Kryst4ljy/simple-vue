import Vue from './instance/index';

const defineObj = {
  val: '初始化val',
  info: { text: '123' }, // 实现了对象的双向绑定
  arr: [3],
};

const app = new Vue({
  el: '#app',
  data() {
    return defineObj;
  },
});

defineObj.arr.push(123);
console.log(defineObj.arr);
