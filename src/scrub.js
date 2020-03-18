
const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')
const moment = require('moment')

const { normalize } = require('./datetime')
const { extractExif } = require('./exif')
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
    let count = 0
    const onItem = async (path) => {
      count++
      await scrubOne(path)
    }
    await walk(dirName, onItem)

    console.log(`found ${count} digests`)
  } catch (err) {
    console.error(err)
  }
}

async function scrubOne (p) {
  // validate filename convention
  const re = /^(\d{4}-\d{2}-\d{2}T\d{2}-[\d]{2}-[\d]{2})-([0-9a-f]{32})\.jpg$/

  const basename = path.basename(p)
  const m = basename.match(re)
  if (!m) {
    console.log(`path (${p}) does not match file naming conventions`)
  }
  const [/* _wholeMatch */, fnStamp, fnDigest] = m
  if (!normalize(fnStamp)) {
    console.log(`path (${p}) does not contain a valid date (${fnStamp})`)
  }

  const { size, stamp } = await fileSizeStamp(p)

  const exif = await extractExif(p)
  const xStamp = exifDate(exif)
  const xxStamp = xStamp.replace(/(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
  console.log({ xStamp, xxStamp, exif })
  if (!moment(xxStamp).isValid()) {
    console.log({ xStamp, xxStamp })
    console.log(`exif (${p}) does not contain a valid date ${xxStamp}`)
  }

  const digest = await digestFile(p)

  if (digest !== fnDigest) {
    console.log(`digest(${p}) does not match digest in filename (${fnDigest})`)
  }

  const out = { size, stamp, fnStamp, xxStamp, digest }
  console.log(` ${basename}:`, JSON.stringify(out))
}

function exifDate (exif) {
  // return (((exif || {}).image) || {}).ModifyDate || sentinel
  const sentinel = 'Unknown'
  if (exif && exif.image) {
    if (exif.image.ModifyDate) {
      return exif.image.ModifyDate
    }
  }
  return sentinel
}
async function fileSizeStamp (path) {
  // return the size and stamp (as Date().toISOString)
  try {
    const stat = await fs.stat(path)
    if (stat) {
      return { size: stat.size, stamp: new Date(stat.mtimeMs).toISOString() }
    }
  } catch (err) { }
  return 0
}

async function isDir (path) {
  try {
    const stat = await fs.stat(path)
    return (stat && stat.isDirectory())
  } catch (err) {
    return false
  }
}

async function digestFile (path, algo) {
  const content = await fs.readFile(path) // no encoding: Buffer
  return digest(content, algo)
}

function digest (data, algo = 'md5') {
  return crypto.createHash(algo).update(data).digest('hex')
}
