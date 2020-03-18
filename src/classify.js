
const fs = require('fs').promises
const path = require('path')
// const { ExifImage } = require('exif')
// const crypto = require('crypto')
const FileType = require('file-type')

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
    const ignored = []
    const mimeCounts = {} // histo by mime/extension
    const exifCounts = {} // histo exif present by mime
    const counts = {
      total: 0,
      ignored: 0
    }
    const onItem = async (p) => {
      counts.total++
      if (!isIgnored(p, ignored)) {
        await classifyOne(p, mimeCounts, exifCounts)
      } else {
        counts.ignored++
      }
      if (counts.total % 1000 === 0) {
        console.log('Progress', counts, exifCounts)
      }
    }
    await walk(dirName, onItem)

    console.log('Counts:', counts)
    console.log(`Ignored: ${ignored.length}`)
    console.log('mime counts - by extension:', mimeCounts)
    console.log('exif counts - by mime', exifCounts)
  } catch (err) {
    console.error(err)
  }
}

function isIgnored (p, ignored) {
  let typ = false
  let ext = path.extname(p)
  const base = path.basename(p, ext)
  ext = ext.slice(1) // ok even if ext===''
  if (ext === '' && ['.DS_Store'].includes(base)) {
    typ = { ext: 'DS_Store', mime: 'text/plain' }
  } else if (base === 'README') {
    typ = { ext, mime: 'text/plain' }
  } else if (ext === 'sh') {
    typ = { ext, mime: 'text/x-shellscript' }
  } else if (['cksum', 'md5sum'].includes(ext) || base.startsWith('MD5SUM') || base.startsWith('SHA1SUM')) {
    typ = { ext, mime: 'text/x-digest' } // I made that up!
  } else if (ext === 'db' && base === 'Thumbs') {
    typ = { ext, mime: 'application/thumbnail' } // I made that up
  } else if (ext === 'ini' && ['Picasa', 'Picasa.', '.picasa'].includes(base)) {
    typ = { ext, mime: 'text/plain' }
  }
  if (typ) {
    // console.log('ignored:', typ, p)
    ignored.push(p)
    return true
  }
}

async function classifyOne (p, mimeCounts, exifCounts) {
  let typ = await FileType.fromFile(p)
  let ext = path.extname(p)
  const base = path.basename(p, ext)
  ext = ext.slice(1) // ok even if ext===''
  if (!typ) {
    console.log(`Unknown mime type for base:${base} ext:${ext} p:${p}`)
    typ = { ext, mime: 'Unknown' } // I made that up!
  }

  mimeCounts[typ.mime] = (mimeCounts[typ.mime] || {})
  // typ.ext is normalized, use actual extension: ext
  mimeCounts[typ.mime][ext] = (mimeCounts[typ.mime][ext] || 0) + 1

  const exif = await extractExif(p)
  const hasExif = Object.keys(exif).length !== 0
  exifCounts[typ.mime] = (exifCounts[typ.mime] || 0) + (hasExif ? 1 : 0)
  exifCounts['no-exif'] = (exifCounts['no-exif'] || 0) + (hasExif ? 0 : 1)
  if (hasExif) {
    // console.log(p, JSON.stringify(exif, null, 2))
  }
}

async function isDir (path) {
  try {
    const stat = await fs.stat(path)
    return (stat && stat.isDirectory())
  } catch (err) {
    return false
  }
}
