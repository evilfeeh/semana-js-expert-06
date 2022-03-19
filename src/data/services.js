import fs from 'fs'
import { extname, join } from 'path'
import fsPromises from 'fs/promises'
import config from '../config.js'
import { randomUUID } from 'crypto'
import { PassThrough } from 'stream'
import childProcess from 'child_process'

const { dir: { publicDirectory }, constants: { fallbackBitRate } } = config

export class Service {
  constructor() {  
    this.clientStreams = new Map()
  }

  getClientStream() {
    const id = randomUUID()
    const clientStream = new PassThrough()
    this.clientStreams.set(id, clientStream)

    return {
      id,
      clientStream
    }
  }

  removeClientStream(id) {
    this.clientStreams.delete(id)
  }

  _executeSoxCommand(args) {
    return childProcess.spawn('sox', args)
  }

  async getBitRate(song) {
    try {
      const args = [
        '--i',
        '-B',
        song
      ]

      const { stderr, stdout } = this._executeSoxCommand(args)
      const [ success, error ] = [ stdout, stderr ].map(stream => stream.read())

      if (error) return await Promise.reject(error)

      return success
      .toString()
      .trim()
      .replace(/k/, '000')

    } catch (error) {
      logger.erro(`Error on get bitrate ${error}`)
      return fallbackBitRate
    }
  }


  createFileStream(filename) {
    return fs.createReadStream(filename)
  }

  async getFileInfo(file) {
    const fullFilePath = join(publicDirectory, file)
    await fsPromises.access(fullFilePath)
    const fileType = extname(fullFilePath)
    return {
      type: fileType,
      name: fullFilePath
    }
  }

  async getFileStream(file) {
    const { name, type } = await this.getFileInfo(file)
    return {
      stream: this.createFileStream(name),
      type
    }
  }
}
