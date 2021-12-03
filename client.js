import crypto from 'crypto'
import net from 'net'
import { serialize } from 'v8'
import through2 from 'through2'

import {
  parseJsonFile,
  encrypt,
  decrypt,
  encryptor,
  decryptor,
  noop,
} from './utils.js'

import {
  PROTOCOL_VERSION_5,
  AUTH_METHOD,
} from './constants.js'

// console.log(JSON.stringify(crypto.getCiphers(), null, 2))

const config = parseJsonFile('client.config')

console.log('debug:', 'client config', JSON.stringify(config, null, 2))

const local = net.createServer()

local.on('connection', function (client) {
  const remote = net.createConnection(config.remotePort, config.remoteAddr)

  client.pipe(through2(cyberfuck)).pipe(remote)

  remote.pipe(through2(function (chunk, encoding, callback) {
    if (!this._firstRun) {
      this.push(decrypt(chunk, config.password))
      this._firstRun = true
    } else if (!this._secondRun) {
      this.push(decrypt(chunk, config.password))
      this._secondRun = true
      console.log('second?', chunk, decrypt(chunk, config.password))
    } else {
      console.log('third?', chunk, decrypt(chunk, config.password))
      this.push(decrypt(chunk, config.password))
    }
    callback()
  })).pipe(client)

  local.on('error', noop)
  remote.on('error', noop)
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
  chunk = encrypt(chunk, config.password)
  this.push(chunk)
  callback()
}


