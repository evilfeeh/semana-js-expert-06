import fs from 'fs'
import { extname, join } from 'path'
import fsPromises from 'fs/promises'
import config from '../config'

const { dir: { publicDirectory } } = config

export class Service {
  createFileStream (filename) {
    return fs.createReadStream(filename)
  }

  async getFileInfo (file) {
    const fullFilePath = join(publicDirectory, file)
    await fsPromises.access(fullFilePath)
    const fileType = extname(fullFilePath)
    return {
      type: fileType,
      name: fullFilePath
    }
  }

  async getFileStream (file) {
    const {} = await this.getFileInfo(file)
    return {
      stream: this.createFileStream()
    }
  }
}
