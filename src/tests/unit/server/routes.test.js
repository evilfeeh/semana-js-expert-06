import { describe, test, jest, expect } from '@jest/globals'
import { handler } from '../../../server/routes.js'
import config from '../../../config.js'
import TestUtil from '../_util/testUtil.js'

const { pages, location } = config

describe('Test server routes', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test('GET / - should return to home page', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/'

    await handler(...params.values())

    expect(params.response.writeHead).toBeCalledWith(302, { 'Location': location.home })
    expect(params.response.end).toHaveBeenCalled()
  })

})
