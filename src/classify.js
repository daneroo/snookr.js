
const fs = require('fs').promises
// const path = require('path')
// const { ExifImage } = require('exif')
// const crypto = require('crypto')
// const moment = require('moment')
// const { normalize } = require('./datetime')
const { walk } = require('./walk')
main()

async function main () {
  const usage = 'I need an existing directory without a slash ending as a parameter'
  if (process.argv.length !== 3) {
    console.log(usage)
    process.exit(-1)
  }
  const dirName = process.argv[2]
  if (!(await isDir(dirName)) || dirName.endsWith('/')) {
    console.log(usage)
    process.exit(-1)
  }

  try {
    const types = {} // type to count histo
    const onItem = async (path) => {
      await classifyOne(path)
    }
    await walk(dirName, onItem)

    console.log(`ffile types: ${types}`)
  } catch (err) {
    console.error(err)
  }
}

async function classifyOne (p) {
  console.log(` ${p}:...`)
}

async function isDir (path) {
  try {
    const stat = await fs.stat(path)
    return (stat && stat.isDirectory())
  } catch (err) {
    return false
  }
}
