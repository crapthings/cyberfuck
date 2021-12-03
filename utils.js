import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import through2 from 'through2'

export function parseJsonFile (filename) {
  const filepath = path.resolve(process.cwd(), filename)
  const file = String(fs.readFileSync(filepath))
  return JSON.parse(file)
}

export function noop () {}

export function encrypt (chunk, password) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-ctr', Buffer.from(password, 'base64'), iv)
  const result = Buffer.concat([iv, cipher.update(chunk), cipher.final()])
  return result
}

export function decrypt (chunk, password) {
  const decipher = crypto.createDecipheriv('aes-256-ctr', Buffer.from(password, 'base64'), chunk.slice(0, 16))
  const result = Buffer.concat([decipher.update(chunk.slice(16)), decipher.final()])
  return result
}

export function encryptor (password) {
  return through2(function (chunk, encoding, callback) {
    this.push(encrypt(chunk, password))
    callback()
  })
}

export function decryptor (password) {
  return through2(function (chunk, encoding, callback) {
    this.push(decrypt(chunk, password))
    callback()
  })
}
