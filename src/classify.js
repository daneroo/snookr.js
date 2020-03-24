
const fs = require('fs').promises
const path = require('path')
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
    const counts = {
      total: 0,
      mimeJpegExif: 0,
      mimeJpegNoExif: 0,
      mimeOther: 0,
      ignored: 0,
      reason: {}
    }
    const onItem = async (p) => {
      counts.total++
      if (!isIgnored(p, counts)) {
        await classifyOne(p, counts)
      }
      if (counts.total % 10000 === 0) {
        console.log('Progress', counts)
      }
    }
    await walk(dirName, onItem)

    console.log('Counts:', counts)
  } catch (err) {
    console.error(err)
  }
}

function isIgnored (p, counts) {
  const base = path.basename(p)
  let reason
  if (['.DS_Store'].includes(base)) {
    reason = '.DS_Store'
  } else if (base === 'Thumbs.db') {
    reason = 'thumbs.db'
  } else if (['Picasa.ini', 'Picasa.ini', '.picasa.ini'].includes(base)) {
    reason = 'picasa.ini'
  }
  if (reason) {
    counts.ignored++
    counts.reason[reason] = (counts.reason[reason] || 0) + 1
    if (!['picasa.ini', 'thumbs.db', '.DS_Store'].includes(reason)) {
      console.log('ignored:', p, reason)
    }

    // ignored.push(p)
    return true
  }
}

async function classifyOne (p, counts) {
  const typ = await FileType.fromFile(p)
  // const ext = path.extname(p).slice(1)
  // let ext = path.extname(p)
  // const base = path.basename(p, ext)
  // ext = ext.slice(1) // ok even if ext===''
  // if (!typ) {
  //   console.log(`Unknown mime type for base:${base} ext:${ext} p:${p}`)
  //   typ = { ext, mime: 'Unknown' } // I made that up!
  // }

  // mimeCounts[typ.mime] = (mimeCounts[typ.mime] || {})
  // // typ.ext is normalized, use actual extension: ext
  // mimeCounts[typ.mime][ext] = (mimeCounts[typ.mime][ext] || 0) + 1

  if (typ && typ.mime === 'image/jpeg') {
    const exif = await extractExif(p)
    const hasExif = Object.keys(exif).length !== 0
    if (hasExif) {
      counts.mimeJpegExif++
      // console.log(p, JSON.stringify(exif, null, 2))
    } else {
      counts.mimeJpegNoExif++
    }
  } else {
    counts.mimeOther++
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
