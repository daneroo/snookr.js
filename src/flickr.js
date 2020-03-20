const fs = require('fs').promises
const moment = require('moment')
const Flickr = require('flickr-sdk')
const superagent = require('superagent')

const mtime = require('./mtime')

// fetch from ENVIRONMENT - . ./FLICKR_ENV.sh
const {
  FLICKR_CONSUMER_KEY,
  FLICKR_CONSUMER_SECRET,
  FLICKR_USER_ID,
  FLICKR_OAUTH_TOKEN,
  FLICKR_OAUTH_TOKEN_SECRET
} = process.env

const flickr = getAuthedClient()

main()

// function delay (ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

async function main () {
  try {
    // check for untagged photos (shoudln't be any)
    await checkUntagged()
    await list(downloadPhoto)
  } catch (error) {
    console.log(error)
  }
}

async function checkUntagged () {
  const res = await flickr.photos.getUntagged()
  if (res.body.photos.photo.length === 0) {
    console.log('✔ No untagged photos')
    return
  }
  console.log('✗ These photos are untagged:')
  console.log(res.body.photos.photo)
}

async function downloadPhoto (p) {
  const { id, datetaken, tags, url_o: url, originalformat } = p

  // get digest from tag
  const digest = digestFromTags(tags)
  if (!digest) {
    console.log('digest not found in tag', { id, datetaken, tags, url })
    console.log(p)
    console.log('Manually tag this file if you want it downloaded: snookrd smookr:md5=xxxxxxx')
    return
  }

  const { directory, file, path } = filename(datetaken, digest, originalformat)

  try {
    const stat = await fs.stat(path)
    if (!stat.isFile()) {
      throw new Error(`path exists but is not a reguar file: ${path}`)
    } else {
      console.log(`Skip ${path}`)
    }
  } catch (error) {
    console.log(`Downloading ${path}`)
    const buffer = await superGet(url)
    await fs.mkdir(directory, { recursive: true })
    await fs.writeFile(path, buffer)
    console.log(JSON.stringify({ id, datetaken, url, file }))
  }
  // now update mtime if required
  await updateMtime(path, datetaken)
}

// Update mtime of file to match datetaken, if required
async function updateMtime (path, datetaken) {
  const fileMtimeUnix = await mtime.get(path)

  let mt = moment(datetaken)
  if (!mt.isValid()) {
    mt = moment('1970-01-01 00:00:00')
  }

  const datetakenUnix = mt.unix()

  if (datetakenUnix !== fileMtimeUnix) {
    console.log('!=', { path })
    console.log('!=', datetakenUnix, fileMtimeUnix)
    console.log('!=', datetaken, moment(mtime).format())
    console.log(`Updating mtime for ${path} to ${datetaken} (was ${moment(mtime).format()})`)
    await mtime.set(path, datetakenUnix)
  }
}

function digestFromTags (tags) {
  // return digest if found, else null
  // "tags":"snookrd snookr:md5=71c91462adf6b944bebdd2eb00c87325"
  // find the 32 hex digit md5 digest
  const re = /snookr:md5=([0-9a-f]{32})/
  const m = tags.match(re)
  if (!m) return m // null
  return m[1]
}

function filename (datetaken, digest, originalformat = 'jpg') {
  // return directory, file, and path (path=dir+file)
  // YYYY/YYYY-MM/YYYY-MM-DDTHH-MM-SS-{digest}.{originalformat}
  // datetaken: string
  // digest: string
  let mt = moment(datetaken)
  if (!mt.isValid()) {
    mt = moment('1970-01-01 00:00:00')
  }

  const root = 'data/flickr' // root is escaped in moment format string
  const directory = mt.format(`[${root}]/YYYY/YYYY-MM`)
  const almostISO = mt.format('YYYY-MM-DD[T]HH.mm.ss')
  const file = `${almostISO}-${digest}.${originalformat}`
  const path = `${directory}/${file}`
  return { directory, file, path }
}

async function superGet (url) {
  return superagent.get(url)
    .buffer(true).parse(superagent.parse.image)
    .then(res => res.body)
}

async function list (onItem = async () => {}) {
  var total = 0

  for (let page = 1; true; page++) {
    // console.log(`- fetching page ${page}`)
    const res = await flickr.photos.search({
      user_id: FLICKR_USER_ID,
      page: page,
      per_page: 500, // def 100, max 500
      sort: 'date-taken-asc', // 'date-taken-desc',

      // extras: 'date_upload,date_taken,tags,last_update,original_format'
      extras: 'date_upload,date_taken,tags,last_update,url_o,original_format'
      // supported fields are: description, license, date_upload, date_taken,
      // owner_name, icon_server, original_format, last_update, geo, tags, machine_tags,
      // o_dims, views, media, path_alias, url_sq,
      // url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o
    })
    total += res.body.photos.photo.length
    console.log(`- got page ${res.body.photos.page} of ${res.body.photos.pages} [${total} of ${res.body.photos.total}]`)

    // apply callback to each photo
    for (const photo of res.body.photos.photo) {
      await onItem(photo)
    }

    if (page === res.body.photos.pages) {
      console.log(`- got (LAST) page ${res.body.photos.page} of ${res.body.photos.pages} [${total} of ${res.body.photos.total}]`)
      break
    }
  }
}

// return authenticated flickr Object
function getAuthedClient () {
  const flickr = new Flickr(Flickr.OAuth.createPlugin(
    FLICKR_CONSUMER_KEY,
    FLICKR_CONSUMER_SECRET,
    FLICKR_OAUTH_TOKEN,
    FLICKR_OAUTH_TOKEN_SECRET
  ))

  // or
  // var oauth = new Flickr.OAuth(
  //   FLICKR_CONSUMER_KEY,
  //   FLICKR_CONSUMER_SECRET
  // )

  // var flickr = new Flickr(oauth.plugin(
  //   FLICKR_OAUTH_TOKEN,
  //   FLICKR_OAUTH_TOKEN_SECRET
  // ))

  return flickr
}
