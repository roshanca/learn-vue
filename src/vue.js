import Directive from './directive'
import Dep from './dep'

export default class Vue {
  constructor({ el, data, methods }) {
    this.$el = document.querySelector(el)
    this.data = data
    this.directives = []

    Object.keys(this.data).forEach(key => {
      // 实现 this.xxx 指向 this.data.xxx
      this.proxyData(key)

      // 将 this.data 相应式化
      this.defineReactive(this.data, key, this.data[key])
    })

    // 实现 this.xxx 指向 this.methods.xxx
    for (const method in methods) {
      if (methods.hasOwnProperty(method)) {
        this[method] = methods[method]
      }
    }

    this.init()
  }

  proxyData(key) {
    Object.defineProperty(this, key, {
      configurable: false,
      enumerable: true,
      get() {
        return this.data[key]
      },
      set(val) {
        this.data[key] = val
      }
    })
  }

  defineReactive(obj, key, val) {
    const dep = new Dep()

    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get() {
        console.log('observer.get: %s', key)
        console.log('add watcher: %o', Dep.target)
        if (Dep.target) {
          dep.depend()
        }

        return val
      },
      set(newVal) {
        console.log('observer.set: %s', newVal)
        if (newVal === val) {
          return
        }

        val = newVal
        dep.notify()
      }
    })
  }

  init() {
    if (this.$el) {
      // 获取 dom
      this.$fragment = this.node2Fragment(this.$el)

      // 编译 dom
      this.compileElement(this.$fragment)

      if (this.directives.length) {
        for (const directive of this.directives) {
          directive.bind()
        }
      }

      // 回填 dom
      this.$el.appendChild(this.$fragment)
    }
  }

  node2Fragment(el) {
    // 新建文档碎片
    let fragment = document.createDocumentFragment()
    let child

    // 将原生结点拷贝至 fragment 中
    while (child = el.firstChild) {
      fragment.appendChild(child)
    }

    return fragment
  }

  compileElement(el) {
    let { childNodes } = el

    Array.from(childNodes).forEach(node => {
      let text = node.textContent
      let reg = /\{\{(.*)\}\}/

      if (this.isElementNode(node)) {
        this.compile(node)
      } else if (this.isTextNode(node) && reg.test(text)) {
        this.compileText(node, RegExp.$1)
      }

      // 递归遍历子节点
      if (node.childNodes && node.childNodes.length) {
        this.compileElement(node)
      }
    })
  }

  isElementNode(node) {
    return node.nodeType === 1
  }

  isTextNode(node) {
    return node.nodeType === 3
  }

  compileText(node, exp) {
    this.directives.push(new Directive(node, 'v-text', exp, this))
  }

  compile(node) {
    let { attributes } = node

    if (!attributes) {
      return
    }

    Array.from(attributes).forEach(attr => {
      // 指令以 v-xxx 命名
      // 比如 <span v-text="content"></span>
      let attrName = attr.name // v-text
      let exp = attr.value // content

      this.directives.push(new Directive(node, attrName, exp, this))
    })
  }
}