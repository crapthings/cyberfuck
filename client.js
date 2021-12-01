import net from 'net'

import {
  parseJsonFile,
} from './utils.js'

const config = parseJsonFile('client.config')

console.log('debug:', 'client config', JSON.stringify(config, null, 2))

const local = net.createServer()

const remote = net.createConnection(config.remotePort, config.remoteAddr)

local.on('connection', function (client) {
  client.pipe(remote)
  remote.pipe(client)
})

local.listen(config.localPort, config.localAddr)
