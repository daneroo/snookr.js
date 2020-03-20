const util = require('util')
const exec = util.promisify(require('child_process').exec)

const moment = require('moment')

const mtime = require('./mtime')

describe('mtime - set then get', () => {
  const path = 'deleteMe.txt'

  describe('examples', () => {
    test.each([
    // [name, path, expected],
    // happy path
      ['1970-01-01T00:00:00Z', 0],
      ['1970-01-01T00:00:00-05:00', 18000],
      ['1966-05-16T00:00:00+00:00', -114566400],
      ['1966-05-16T00:00:00-04:00', -114552000],
      ['1968-05-16T00:00:00-04:00', -51393600],
      ['1997-04-03T01:23:45Z', 860030625],
      ['2001-01-01T01:01:01Z', 978310861]
    ])('mtime (%s)', async (stamp, expected) => {
      // create file, mtime=now()
      await exec(`touch ${path}`)

      const mtimeUnix = moment(stamp).unix()
      expect(mtimeUnix).toStrictEqual(expected)

      // set mtime
      await mtime.set(path, mtimeUnix)
      // get mtime
      const mtimeUnixBack = await mtime.get(path)

      expect(mtimeUnixBack).toStrictEqual(expected)
      expect(mtimeUnixBack).toStrictEqual(mtimeUnix)

      await exec(`rm ${path}`)
    })
  })
  describe('before epoch', () => {
    for (let i = 1; i <= 1024; i = i * 2) {
      const mt = moment(-i * 86400 * 1000)
      test(`${-mt.diff(0, 'days')} days`, async () => {
        await exec(`touch ${path}`)
        await mtime.set(path, mt.unix())
        const mtimeUnix = await mtime.get(path)

        // console.log(`Set: local: ${mt.format()} unix: ${mt.unix()}`)
        expect(mtimeUnix).toStrictEqual(mt.unix())
        await exec(`rm ${path}`)
      })
    }
  })
  describe('after epoch', () => {
    for (let i = 1; i <= 1024; i = i * 2) {
      const mt = moment(i * 86400 * 1000)
      test(`${mt.diff(0, 'days')} days`, async () => {
        await exec(`touch ${path}`)
        await mtime.set(path, mt.unix())
        const mtimeUnix = await mtime.get(path)

        // console.log(`Set: local: ${mt.format()} unix: ${mt.unix()}`)
        expect(mtimeUnix).toStrictEqual(mt.unix())
        await exec(`rm ${path}`)
      })
    }
  })
})
