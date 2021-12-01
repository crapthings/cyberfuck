const net = require('net')

const {
  parseJsonFile
} = require('./utils')

const config = parseJsonFile('client.config')

console.log(config)

const client = net.createConnection(config)

client.on('connect', console.log)
