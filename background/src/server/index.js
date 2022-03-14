import server from './server.js'
import logger from '../utils/logs.js'
server.listen(3000)
.on('listening', () => logger.info('server running at 3000'))