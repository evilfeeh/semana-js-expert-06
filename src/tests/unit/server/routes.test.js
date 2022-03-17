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

  test('GET /index.html - should response with file stream', async () => {
    const params = TestUtil.defaultHandleParams()
    const filename = 'index.html'
    params.request.method = 'GET'
    params.request.url = `/${filename}`
    const expectedType = '.html'
    const mockFileStream = TestUtil.generateReadableStream(['data'])
    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({
      stream: mockFileStream,
      type: expectedType
    })
  
    jest.spyOn(
      mockFileStream,
      "pipe"
    ).mockReturnValue()
  
    await handler(...params.values())
  
    expect(Controller.prototype.getFileStream).toBeCalledWith(params.request.url)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    expect(params.response.writeHead).toHaveBeenCalled()
  })

  test('GET /file.ext - should response with file stream', async () => {
    const params = TestUtil.defaultHandleParams()
    const filename = 'file.ext'
    params.request.method = 'GET'
    params.request.url = `/${filename}`
    const expectedType = '.ext'
    const mockFileStream = TestUtil.generateReadableStream(['data'])
    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockResolvedValue({
      stream: mockFileStream,
      type: expectedType
    })
  
    jest.spyOn(
      mockFileStream,
      "pipe"
    ).mockReturnValue()
  
    await handler(...params.values())
  
    expect(Controller.prototype.getFileStream).toBeCalledWith(params.request.url)
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    expect(params.response.writeHead).not.toHaveBeenCalled()
  })

  test('GET /unknown - should return 404 page', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'POST'
    params.request.url = `/unknown`
  
    await handler(...params.values())
  
    expect(params.response.writeHead).toHaveBeenCalledWith(404)
    expect(params.response.end).toHaveBeenCalled()
  })

  test('should return a page with 404', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = `/index.png`
  
    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockRejectedValue(new Error('Error: ENOENT: no such file or directory'))
  
    await handler(...params.values())
  
    expect(params.response.writeHead).toHaveBeenCalledWith(404)
    expect(params.response.end).toHaveBeenCalled()
  })

  test('given an error it should respond with 500', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = `/unknown`
  
    jest.spyOn(
      Controller.prototype,
      Controller.prototype.getFileStream.name
    ).mockRejectedValue(new Error('Error:'))
  
  
    await handler(...params.values())
  
    expect(params.response.writeHead).toHaveBeenCalledWith(500)
    expect(params.response.end).toHaveBeenCalled()
  })
})
