import { describe, test, jest, expect } from '@jest/globals'
import { handler } from '../../../server/routes.js'
import config from '../../../config.js'
import TestUtil from '../_util/testUtil.js'
import { Controller } from '../../../controllers/service-controller.js'

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

  test('GET /home - should response with home/index.html with stream', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/home'
    const mockFileStream = TestUtil.generateReadableStream(['data'])
    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({
      stream: mockFileStream
    })
  
    jest.spyOn(
      mockFileStream,
      "pipe"
    ).mockReturnValue()
  
    await handler(...params.values())
  
    expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
  })

  test('GET /controller - should response with controller/index.js with stream', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/controller'
    const mockFileStream = TestUtil.generateReadableStream(['data'])
    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({
      stream: mockFileStream
    })
  
    jest.spyOn(
      mockFileStream,
      "pipe"
    ).mockReturnValue()
  
    await handler(...params.values())
  
    expect(Controller.prototype.getFileStream).toBeCalledWith(pages.controllerHTML)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
  })
})
