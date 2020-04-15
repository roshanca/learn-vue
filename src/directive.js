import Watcher from './watcher'

export default class Directive {
  constructor(node, attrName, exp, vm) {
    this.node = node
    this.attrName = attrName
    this.exp = exp
    this.vm = vm
  }

  bind() {
    let dir

    if (this.isDirective(this.attrName)) {
      dir = this.attrName.split('v-')[1]
      // this[dir] && this[dir](this.node, this.vm, this.exp)
      const theDir = this[dir](this.node)
      const watcher = new Watcher(this.vm, this.exp, theDir.update)

      if (theDir.update) {
        theDir.update(watcher.value)
      }
    }

    if (this.isEventDirective(this.attrName)) {
      dir = this.attrName.split('@')[1]
      this.eventHandler(this.node, this.vm, this.exp, dir)
    }
  }

  isDirective(attrName) {
    return /^v-(model|text)$/.test(attrName)
  }

  isEventDirective(attrName) {
    return attrName.indexOf('@') === 0
  }

  eventHandler(node, vm, exp, dir) {
    const eventType = dir
    const fn = vm[exp] || function() {}

    if (eventType) {
      node.addEventListener(eventType, fn.bind(vm), false)
    }
  }

  text(node) {
    return {
      update: val => {
        node.textContent = val || ''
      }
    }
  }
}