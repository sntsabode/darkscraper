import { panic } from '.'

export default class ErrorStack {
  static instance = new ErrorStack(9)

  static set panicTrigger(t: number) {
    ErrorStack.instance.panicTrigger = t
  }

  static get panicTrigger(): number {
    return this.panicTrigger
  }

  private constructor(
    private panicTrigger: number
  ) { }

  #errorCount = 0
  get errorCount(): number {
    return this.#errorCount
  }

  addError(): void {
    this.#errorCount++
    if (this.#errorCount === this.panicTrigger) {
      return panic(1, 'Error count hit panic trigger')
    }
  }
}
