import { createDurable, withDurables } from 'itty-durable'
import { ThrowableRouter, missing, withParams } from 'itty-router-extras'

const router = ThrowableRouter()

router
  // add upstream middleware, allowing Durable access off the request
  .all('*', withDurables())

  // get the durable itself... returns json response, so no need to wrap
  .get('/', ({ Counter }) => Data.get('test').toJSON())

  // By using { autoReturn: true } in createDurable(), this method returns the contents
  .get('/increment', ({ Counter }) => Counter.get('test').increment())

  // 404 for everything else
  .all('*', () => missing('Are you sure about that?'))

// with itty, and using ES6 module syntax (required for DO), this is all you need
export default {
  fetch: router.handle
}

export class Data {
  export class Counter extends createDurable() {
  constructor(state, env) {
    super(state, env)

    // anything defined here is only used for initialization (if not loaded from storage)
    this.counter = 0
  }

  // Because this function does not return anything, it will return the entire contents
  // Example: { counter: 1 }
  increment() {
    this.counter++
  }

  // Any explicit return will honored, despite the autoReturn flag.
  // Note that any serializable params can passed through from the Worker without issue.
  add(a, b) {
    return a + b
  }
}
