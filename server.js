import crypto from 'crypto'
import net from 'net'
import { deserialize } from 'v8'
import stream, { Readable, Writable } from 'stream'

import {
  parseJsonFile,
  encrypt,
  decrypt,
  encryptor,
  decryptor,
} from './utils.js'

import {
  PROTOCOL_VERSION_5,
  AUTH_METHOD,
  NO_AUTHENTICATION_REQUIRED,
  NO_ACCEPTABLE_METHODS,
  ADDRESS_TYPE_DOMAINNAME,
} from './constants.js'

// init

const config = parseJsonFile('server.config')

console.log('debug:', 'server config', JSON.stringify(config, null, 2))

const server = net.createServer()

server.on('connection', onConnection)

server.listen(config)

// def
function onConnection (client) {
  client.once('data', onClientAuth(client))
  client.on('error', onClientError(client))
}

function onClientAuth (client) {
  return function (data) {
    data = decrypt(data, config.password)
    console.log('debug:', data)
    if (getProtocolVersion(data) !== PROTOCOL_VERSION_5 || getAuthMethod(data) !== AUTH_METHOD) {
      client.destroyed || client.destroy()
      return
    }

    const { username, password } = authParser(data)

    if (username !== config.username || password !== config.password) {
      console.log('auth failed')
      client.destroyed || client.destroy()
      return
    }

    const response = Buffer.from([
      PROTOCOL_VERSION_5,
      NO_AUTHENTICATION_REQUIRED
    ])

    client.write(encrypt(response, config.password), () => {
      client.once('data', onRequestType(client))
    })
  }
}

function onClientError (client) {
  return function (err) {
    client.destroyed || cleint.destroy()
  }
}

function getProtocolVersion (data) {
  return data[0]
}

function getAuthMethod (data) {
  return data[1]
}

function onRequestType (client) {
  return function (data) {
    data = decrypt(data, config.password)
    console.log(data)
    if (getAddressType(data) === ADDRESS_TYPE_DOMAINNAME) {
      const host = parseDomainName(data)
      const port = parsePort(data)
      const reply = getReply(data)
      console.log('wft', reply)
      request({ client, data, host, port, reply })
    }
  }
}

function request ({ client, data, host, port, reply }) {
  console.log('request', host, port, reply)

  const socket = new net.Socket()

  socket.connect(port, host, function () {
    if (client.writable) {
      client.write(encrypt(reply, config.password), () => {
        // client.pipe(socket)
        // socket.pipe(client)
        // return

        client.pipe(decryptor(config.password)).pipe(socket)
        socket.pipe(encryptor(config.password)).pipe(client)
      })
    }
  })

  socket.on('close', function () {
    socket.destroyed || socket.destroy()
  })

  socket.on('error', function (err) {
    if (err) {
      console.log(err)
      reply[1] = 0x03
      if (client.writable) {
        client.end(encrypt(reply, config.password))
      }
      socket.end()
    }
  })
}

function getAddressType (data) {
  return data[3]
}

function parseDomainName (data) {
  const len = 5 + parseInt(data[4], 10)
  return data.slice(5, len).toString('utf8')
}

function parsePort (data) {
  const bytes = data.slice(data.length - 2)
  return bytes.readInt16BE(0)
}

function getReply (data) {
  const reply = Buffer.allocUnsafe(data.length)
  data.copy(reply)
  reply[1] = 0x00
  return reply
}

function authParser (data) {
  const auth = deserialize(data.slice(2))
  console.log(auth)
  return auth
}
