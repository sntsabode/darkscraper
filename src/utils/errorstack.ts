import { panic } from '.'

export default class ErrorStack {
  constructor(
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
