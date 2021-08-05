import Watcher from "./Watcher";
import Dep from "./Dep";

export default class Vue {
  constructor(option) {
    this.$el = document.querySelector(option.el); // 项目根节点
    this.$data = option.data; // data对象

    // create：监听data对象 - 相当于为data对象的每一个属性创建一个频道
    this.obverse(this.$data);

    // mounted：读取根节点，挂载数据
    this.complie(this.$el);
  }

  // 监听对象属性变化方法，自动订阅以及发布订阅
  obverse(obj) {
    if (!(obj instanceof Object)) return;
    // 遍历对象
    for (let key in obj) {
      let val = obj[key]; // 赋值
      const dep = new Dep();
      Object.defineProperty(obj, key, {
        enumerable: true, // 是否可枚举
        configurable: true, // 是否可配置
        get() {
          console.log(`get：${key} - ${val}`);
          dep.depend(); // 订阅
          return val;
        },
        set(newVal) {
          if (newVal === val) return;
          console.log(`set：${key} - ${newVal}`);
          val = newVal;
          dep.notify(); // 发布
        },
      });
    }
  }
  // 挂载数据
  complie(root) {
    // 遍历根节点下的所有节点，解析指令
    const nodes = root.children;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      // 如果还有子节点，则递归遍历
      if (node.children.length) {
        this.complie(node);
      }

      // 绑定子节点指令
      if (
        node.hasAttribute("v-model") &&
        (node.tagName == "INPUT" || node.tagName == "TEXTAREA")
      ) {
        // 如果元素绑定了 v-model指令 且 元素为输入框
        node.addEventListener(
          "input",
          (e) => {
            // 赋值对应的属性，更新订阅
            const attr = node.getAttribute("v-model");
            this.$data[attr] = e.target.value;
          },
          false
        );
      }

      if (node.hasAttribute("v-bind")) {
        const attr = node.getAttribute("v-bind");
        // 创建 观众 - 自动订阅频道
        new Watcher(this.$data, attr, (newVal) => {
          node.innerText = newVal;
        });
      }
    }
  }
}
