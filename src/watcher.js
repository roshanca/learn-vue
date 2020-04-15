import Dep from './dep'

export default class Watcher {
  constructor(vm, exp, cb) {
    this.vm = vm
    this.exp = exp
    this.cb = cb
    this.depIds = new Set()
    this.getter = () => vm[exp]
    this.setter = (vm, val) => {
      vm[exp] = val
    }

    this.value = this.get()
  }

  addDep(dep) {
    if (!this.depIds.has(dep.id)) {
      this.depIds.add(dep.id)
      dep.addSub(this)
    }
  }

  get() {
    Dep.target = this
    const value = this.getter.call(this.vm, this.vm)
    Dep.target = null
    return value
  }

  set(val) {
    this.setter.call(this.vm, this.vm, val)
  }

  update() {
    const val = this.get()
    const oldVal = this.value

    if (val !== oldVal) {
      this.cb.call(this.vm, val, oldVal)
    }
  }
}
