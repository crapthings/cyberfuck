import net from 'net'
import { serialize } from 'v8'
import through2 from 'through2'
import protobuf from 'protobufjs'

import {
  parseJsonFile
} from './utils.js'

import {
  PROTOCOL_VERSION_5,
  AUTH_METHOD,
} from './constants.js'

const config = parseJsonFile('client.config')

console.log('debug:', 'client config', JSON.stringify(config, null, 2))

const local = net.createServer()

local.on('connection', function (client) {
  const remote = net.createConnection(config.remotePort, config.remoteAddr)
  client.pipe(through2(cyberfuck)).pipe(remote)
  remote.pipe(client)
})

local.on('error', function (err) {
  console.error(err)
})

local.listen(config.localPort, config.localAddr)

function cyberfuck (chunk, encoding, callback) {
  if (!this._firstRun) {
    const auth = Buffer.from(serialize({ username: config.username, password: config.password }))
    chunk = Buffer.from([PROTOCOL_VERSION_5, AUTH_METHOD, ...auth])
    this._firstRun = true
  }
  this.push(chunk)
  callback()
}
