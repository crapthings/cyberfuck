import fs from 'fs'
import path from 'path'

export function parseJsonFile (filename) {
  const filepath = path.resolve(process.cwd(), filename)
  const file = String(fs.readFileSync(filepath))
  return JSON.parse(file)
}

export function noop () {}
