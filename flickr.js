const fs = require('fs').promises
const moment = require('moment')
const Flickr = require('flickr-sdk')
const superagent = require('superagent')

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
    // await list()
    // await list(showPhoto)
    await list(downloadPhoto)
  } catch (error) {
    console.log(error)
  }

  // flickr.photos.getUntagged()
  //   .then(function (res) {
  //     console.log('yay!', res.body.photos.photo)
  //   }).catch(function (err) {
  //     console.error('bonk', err)
  //   })
}

async function showPhoto (p) {
  const { id, title, datetaken, tags, url_o } = p
  console.log(JSON.stringify({ id, title, datetaken, tags, url_o }))
}

async function downloadPhoto (p) {
  const { id, datetaken, tags, url_o } = p
  // "tags":"snookrd snookr:md5=71c91462adf6b944bebdd2eb00c87325"
  const digest = tags.replace('snookrd', '').replace('snookr:md5=', '').trim()

  let mt = moment(datetaken)
  if (!mt.isValid()) {
    mt = moment('1970-01-01 00:00:00')
  }
  // YYYY/YYYY-MM/YYYY-MM-DDTHH-MM-SS-{digest}.jpg
  const dir = mt.format('[data/flickr]/YYYY/YYYY-MM')
  await fs.mkdir(dir, { recursive: true })
  const almostISO = mt.format('YYYY-MM-DD[T]HH-mm-ss')
  const fname = `${almostISO}-${digest}.jpg`
  const fqfname = `${dir}/${fname}`

  const buffer = await superGet(url_o)

  await fs.writeFile(fqfname, buffer)
  // console.log(JSON.stringify({ id, title, datetaken, digest, url_o }))
  console.log(JSON.stringify({ id, datetaken, url_o, fname }))
  // console.log(`Wrote ${fname}`)
}

async function superGet (url) {
  return superagent.get(url)
    .buffer(true).parse(superagent.parse.image)
    .then(res => res.body)
}

async function list (asyncCallback = () => {}) {
  var total = 0

  for (let page = 1; true; page++) {
    // console.log(`- fetching page ${page}`)
    const res = await flickr.photos.search({
      user_id: FLICKR_USER_ID,
      page: page,
      per_page: 500, // def 100, max 500
      sort: 'date-taken-asc', // 'date-taken-desc',
      // extras: 'date_upload,date_taken,tags,last_update,original_format'
      extras: 'date_upload,date_taken,tags,last_update,url_o'
      // supported fields are: description, license, date_upload, date_taken,
      // owner_name, icon_server, original_format, last_update, geo, tags, machine_tags,
      // o_dims, views, media, path_alias, url_sq,
      // url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o
    })
    // console.log(res.body.photos.photo)
    total += res.body.photos.photo.length
    console.log(`- got page ${res.body.photos.page} of ${res.body.photos.pages} [${total} of ${res.body.photos.total}]`)

    // apply callback to each photo
    for (const photo of res.body.photos.photo) {
      await asyncCallback(photo)
    }

    if (page === res.body.photos.pages) {
      console.log(`- got (LAST) page ${res.body.photos.page} of ${res.body.photos.pages} [${total} of ${res.body.photos.total}]`)
      break
    }
  }
}

async function getSizes () {
  const res = await flickr.photos.getSizes({
    photo_id: '43239750552' //  tags: 'snookrd snookr:md5=d5a47f1af76fa543d7f197880f8e824f',
  })
  console.log(res.body.sizes.size)
}

// return authenticated flick Object
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
