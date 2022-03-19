import { Service } from "../data/services.js"
import logger from "../utils/logs.js"

export class Controller {
  constructor () {
    this.service = new Service()
  }

  async getFileStream (filename) {
    return this.service.getFileStream(filename)
  }

  createClientStream() {
    const { id, clientStream } = this.service.getClientStream()
    
    const onClose = () => {
      logger.info(`close connection of ${id}`)
      this.service.removeClientStream(id)
    }

    return {
      stream: clientStream,
      onClose
    }
  }
}
