let uid = 0

export default class Dep {
  static target = null

  constructor() {
    this.id = uid++
    this.subs = []
  }

  addSub(sub) {
    this.subs.push(sub)
  }

  depend() {
    Dep.target.addDep(this)
  }

  notify() {
    for (const sub of this.subs) {
      sub.update()
    }
  }
}
