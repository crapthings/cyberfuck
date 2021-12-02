import net from 'net'

import {
  parseJsonFile,
} from './utils.js'

import {
  PROTOCOL_VERSION_5,
  NO_AUTHENTICATION_REQUIRED,
  NO_ACCEPTABLE_METHODS,
  ADDRESS_TYPE_DOMAINNAME,
} from './constants.js'

const config = parseJsonFile('client.config')

console.log('debug:', 'client config', JSON.stringify(config, null, 2))

const local = net.createServer()

local.on('connection', function (client) {
  const remote = net.createConnection(config.remotePort, config.remoteAddr)

  client.pipe(remote)
  remote.pipe(client)
})

local.listen(config.localPort, config.localAddr)
