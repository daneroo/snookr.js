const fs = require('fs').promises
const os = require('os')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

module.exports = {
  get,
  set
}

async function get (path) {
  // Return the unix timestamp of the file: path
  const stat = await fs.stat(path)
  // console.log(stat)
  const mtimeMillis = stat.mtime.getTime()
  // console.log({ mtimeMillis })
  if (!isNaN(mtimeMillis)) {
    // if we have a valid Date (mtimeMillis===mtimeMillis)
    // return unix timestamp (not rouded)
    return mtimeMillis / 1000
  }

  // Below is a fallback for this fs.stat bug, which is OS specific
  // - on darwin: stat -r ${path}, take 10th param [9]
  // - on linnux: stat -t ${path}, take 13th param [12]
  //  both have expected output of 16 space separated fields
  const { flag, argPos, expectedArgCount } = (() => {
    const platform = os.platform()
    if (platform === 'darwin') {
      return { flag: '-r', argPos: 9, expectedArgCount: 16 }
    }
    if (platform === 'linux') {
      return { flag: '-t', argPos: 12, expectedArgCount: 16 }
    }
    throw new Error('unsupported platform () for mtime workaround')
  })()

  //  define and invoke the fallback command (stat -t/-r)
  const cmd = `stat ${flag} '${path}'`
  // console.log({ cmd })
  const { stdout, stderr } = await exec(cmd)

  // console.log({ stdout, stderr })
  if (stderr) {
    throw new Error([stderr.trim(),
      `cmd: ${cmd}`, `stdout: ${stdout.trim()}`
    ])
  }
  const statArray = stdout.trim().split(' ')
  // mtime is 9th entry
  // console.log('|statArray|', statArray.length)
  if (statArray.length !== expectedArgCount) {
    throw new Error([
      'Unable to parse ouput',
      `cmd: ${cmd}`, `stdout: ${stdout.trim()}`,
      `expected ${expectedArgCount} fields, got ${statArray.length}`
    ].join('\n'))
  }
  const mtimeUnix = Number(statArray[argPos])
  return mtimeUnix
}

async function set (path, mtimeUnix) {
  // Set file modification time (mtime) to mtimeUnix
  // This avoids the problem of broken fs.utimes with atime ot ctime <1970-01-01Z
  // The workaround is tu use the String representation of desired time (in unix time)
  // We set both atime and ctime to avoid having to verify that atime is valid, even to pass it through
  // Could us now() as value for atime
  if (mtimeUnix < 0) {
    mtimeUnix--
  }
  // console.log({ mtimeUnix })
  await fs.utimes(path, String(mtimeUnix), String(mtimeUnix))
}
