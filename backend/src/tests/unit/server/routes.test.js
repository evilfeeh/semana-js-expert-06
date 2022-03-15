import { describe, test, jest, expect } from '@jest/globals'

describe('Test server routes', () => {
 test.todo('GET / - should return to home page')
 test.todo('GET /home - should response with home/index.js')
 test.todo('GET /controller - should response with controller/index.js')
 test.todo('GET /file.txt - should response with file stream')
 test.todo('GET /unknown - should return 404 page')

 test.todo('should return a page with 404')
 test.todo('given an error it should respond with 500')
})
