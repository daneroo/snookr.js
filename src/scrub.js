
const fs = require('fs').promises
const path = require('path')
const crypto = require('crypto')

const { normalize, normalizeUnix } = require('./datetime')
const { extractExif } = require('./exif')
const mtime = require('./mtime')
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
  // TODO: extract when appropriate
  const re = /^(\d{4}-\d{2}-\d{2}T\d{2}.[\d]{2}.[\d]{2}).([0-9a-f]{32})\.([a-z]{3,4})$/

  // 1- filename - validate stamp and digest
  const basename = path.basename(p)
  const m = basename.match(re)
  if (!m) {
    console.log(`path (${p}) does not match file naming conventions`)
    return
  }
  const [/* _wholeMatch */, fnStampRaw, fnDigest, fnExt] = m
  const fnStamp = normalize(fnStampRaw)
  if (!fnStamp) {
    console.log(`path(${p}) does not contain a valid date: (${fnStampRaw})`)
    return
  }

  if (!['jpg', 'gif'].includes(fnExt)) {
    console.log(`path(${p}) does not hav a valid extension: (${fnExt})`)
    return
  }

  // fStamp - from file mtime
  const fStamp = normalizeUnix(await mtime.get(p))

  // xStamp - from the exif header
  const xStamp = normalize(exifDate(await extractExif(p)))
  if (xStamp === null) {
    // console.log(`exif(${p}) does not contain a valid date`)
  }

  if (xStamp) {
    // compare three stamps - fnStamp,fStamp,xStamp
    if (fnStamp !== fStamp || fnStamp !== xStamp) {
      console.log(`${p} !=`, { fnStamp, fStamp, xStamp })
      const exif = await extractExif(p)
      console.log(exif)
    }
  } else {
    // compare three stamps - fnStamp,fStamp,xStamp
    if (fnStamp !== fStamp) {
      console.log('!=', { fnStamp, fStamp })
    }
  }

  const digest = await digestFile(p)
  if (digest !== fnDigest) {
    console.log(`digest(${p}) does not match digest in filename (${fnDigest})`)
  }

  const fSize = await fileSize(p)
  const out = { fnStamp, fSize, fStamp, xStamp, digest }
  console.log(`${basename}:`, JSON.stringify(out))
}

// TODO: extract to exif.js
function exifDate (exif) {
  // return (((exif || {}).image) || {}).ModifyDate || sentinel
  const sentinel = 'Unknown'
  if (exif && exif.exif) {
    if (exif.exif.DateTimeOriginal) {
      return exif.exif.DateTimeOriginal
    }
  }
  // also exif.exif.CreateDate
  // is exif.image.ModifyDate this ever a good idea?
  if (exif && exif.image) {
    if (exif.image.ModifyDate) {
      return exif.image.ModifyDate
    }
  }
  return sentinel
}

async function fileSize (path) {
  // return the size and stamp (as Date().toISOString)
  try {
    const stat = await fs.stat(path)
    if (stat) {
      return stat.size
    }
  } catch (err) { }
  return -1
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
