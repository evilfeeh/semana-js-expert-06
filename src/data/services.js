import fs from 'fs'
import { extname, join } from 'path'
import fsPromises from 'fs/promises'
import config from '../config.js'
import { randomUUID } from 'crypto'
import { PassThrough, Writable } from 'stream'
import Throttle from 'throttle'
import childProcess from 'child_process'
import StreamPromises from 'stream/promises'
import logger from '../utils/logs.js'
import { once } from 'events'
const { dir: { publicDirectory }, constants: { fallbackBitRate, englishConversation, bitRateDivisor } } = config

export class Service {
  constructor() {  
    this.clientStreams = new Map()
    this.currentSong = englishConversation
    this.currentBitRate = 0
    this.throttleTransform = {}
    this.currentReadable = {}
    
    this.startStream()
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
      await Promise.all([
        once(stderr, 'readable'),
        once(stdout, 'readable')
      ])

      const [ success, error ] = [ stdout, stderr ].map(stream => stream.read())

      if (error) return await Promise.reject(error)

      return success
      .toString()
      .trim()
      .replace(/k/, '000')

    } catch (error) {
      logger.error(`Error on get bitrate ${error}`)
      return fallbackBitRate
    }
  }

  broadcast() {
    return new Writable({
      write: (chunk, encoding, callback) => {
        for (const [id, stream] of this.clientStreams) {
          if (stream.writableEnded) {
            this.clientStreams.delete(id)
            continue
          }
          stream.write(chunk)
        }
        callback()
      }
    })
  }

  async startStream() {
    logger.info(`starting with ${this.currentSong}`)
    const bitRate = this.currentBitRate = await this.getBitRate(this.currentSong) / bitRateDivisor
    const throttleTransform = this.throttleTransform = new Throttle(bitRate)
    const songReadable = this.songReadable = this.createFileStream(this.currentSong)
    StreamPromises.pipeline(
      songReadable, throttleTransform, this.broadcast()
    )
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
