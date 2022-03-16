import { jest } from '@jest/globals'

export default class TestUtil {
  static generateReadableStream(data) {
    return new Readable({
      read() {
        for (const item of data) {
          this.push(item)
        }
        this.push(null)
      }
    })
  }

  static generateWritableStream(onData) {
    return new Writable({
      write(chunk, enconding, callback) {
        onData(chunk)
        callback(null, chunk)
      }
    })
  }

  static defaultHandleParams() {
    const requestStream = TestUtil.generateReadableStream([])
    const response = TestUtil.generateWritableStream(() => {})
    const data = {
      request: Object.assign( requestStream, {
        headers: {},
        method: '',
        url : ''
      }),
      response: Object.assign(response, {
        writeHeaders: jest.fn(),
        end: jest.fn()
      })
    }
    return {
      values: () => Object.values(data),
      ...data
    }
  }
}