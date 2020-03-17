
const fs = require('fs').promises
const path = require('path')
const { ExifImage } = require('exif')
const crypto = require('crypto')
const moment = require('moment')

// walker Taken from MomPhotoCompare
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
  const re = /^(\d{4}-\d{2}-\d{2})T(\d{2}-[\d]{2}-[\d]{2})-([0-9a-f]{32})\.jpg$/

  const basename = path.basename(p)
  const m = basename.match(re)
  if (!m) {
    console.log(`path (${p}) does not match file naming conventions`)
  }
  const [/* _wholeMatch */, datepart, timeWithDash, fnDigest] = m
  const fnStamp = `${datepart}T${timeWithDash.replace('-', ':')}`
  if (!moment(fnStamp).isValid()) {
    console.log(`path (${p}) does not contain a valid date`)
  }

  const size = await fileSize(p)
  const exif = await extractExif(p)
  const xStamp = (((exif || {}).image) || {}).ModifyDate || 'Unknown'
  const xxStamp = xStamp.replace(/(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3')
  if (!moment(xxStamp).isValid()) {
    console.log(`exif (${p}) does not contain a valid date ${xxStamp}`)
  }

  const digest = await digestFile(p)

  if (digest !== fnDigest) {
    console.log(`digest(${p}) does not match digest in filename (${fnDigest})`)
  }

  const out = { size, xStamp, digest }
  console.log(`  ${p}:`, JSON.stringify(out))
}

async function walk (dir, onItem = async (relPath, stat, absPath) => {}) {
  const list = await fs.readdir(dir, { withFileTypes: true })
  for (const dirent of list) {
    const path = `${dir}/${dirent.name}`
    if (dirent.isDirectory()) {
      console.log(`subdir: ${path}`)
      await walk(path, onItem)
    } else {
      await onItem(path)
    }
  }
}

async function fileSize (path) {
  try {
    const stat = await fs.stat(path)
    if (stat) {
      return stat.size
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
  return hashData(content, algo)
}

function hashData (data, algo = 'md5') {
  return crypto.createHash(algo).update(data).digest('hex')
}

async function extractExif (data) { // data is a path of Buffer of content
  return new Promise((resolve, reject) => {
    ExifImage({ image: data }, function (error, exifData) {
      if (error) {
        // console.error('Error: ' + error.message)
        // reject(error)
        resolve({})
      } else {
        // console.log(exifData)
        resolve(exifData)
      }
    })
  })
}
