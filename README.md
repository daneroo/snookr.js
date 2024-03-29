# Snookr (JavaScript)

Snookr photo archiving tools

- fetch, validate, scrub, classify and distribute a photo archive

Port of snookr to JavaScript

Let's get the functional split right first this time.

- Legacy: Download from flickr (no post or update planned)
- classify (user/filetype - meta present/camera/user|owner)
- scrub (digest/exif)
- dedup

## TODO

- Rename repo to snookr (npx snookr | @snookr/snookr | @daneroo/snookr)
- Command (yargs) pattern: see `gphotos-puppeteer`
- flickr: download all files name with datetaken-digest
- scrub (digest/exif)
- exif options:
  - exif (gomfunkel/node-exif)
  - related: sindresorhus/file-type
- Auto Ken Burns
  - FotoMagico
  - <https://el-tramo.be/blog/ken-burns-ffmpeg/>

## Classify

Objectives:

- Classify items by mime-type
- For `image/jpeg`, detect exif existence, and date/camera
  - Work on `/archive/media/photo`
  - Work on `Piaget-03-07/jeanguy/Pictures|Documents`
- isIgnored / other mime-types (AVI,gif,..)

```bash
/archive/media/photo:
Counts: {
  total: 53351,
  mimeJpegExif: 51551,
  mimeJpegNoExif: 693,
  mimeOther: 719,
  ignored: 388,
  reason: { '.DS_Store': 2, 'picasa.ini': 386 }
}
```

### Manual counts

- flickr: one gif (named .jpg)
- exiftool for all but one AVI

```bash
exiftool -json `find . -name \*AVI` |jq '.[] | {name:.FileName, stamp: .DateTimeOriginal}'
```

- Example of no-exif,datetaken does not match /archive filestamp:
  - no exif, md5 match
  - file name: 2015-06-28\ 19.29.39.jpg
  - file mtime: Jun 28 15:29:39 2015
  - datetaken: 2018-07-09T01:10:55
  - `md5sum /Volumes/Space/archive/media/photo/catou/2015-12-31-Nexus5-Dropbox/2015-06-28\ 19.29.39.jpg data/flickr/2018/2018-07/2018-07-09T01.10.55-2a66610c12b9e219848131294151cc23.jpg`

### Exiftool experiments (for classification)

works for (some) `.mov,.3gp,.mp4,...`, use -json for parsing

```bash
brew install exiftool

exiftool /Volumes/Space/archive/media/video/PMB/7-23-2008/20080712112304.modd
exiftool /Volumes/Space/archive/media/video/PMB/7-23-2008/20080712112304.moff
exiftool /Volumes/Space/archive/media/video/PMB/7-23-2008/20080712112304.mpg

exiftool /Volumes/Space/archive/media/photo/catou/2008-09-19-Krzr-Last/20-07-08_2123.3gp

exiftool '/Volumes/Space/archive/media/photo/catou/2014-03-04-IPhone4s-Dropbox/2012-02-24 19.35.48.mov'

exiftool "/Volumes/Space/archive/media/video/ImageMixer3//'07_04_22_01/M2U00585.MPG"
```

## Flickr example

```bash
. ./FLICKR_ENV.sh
node src/flickr.js
```

### Flickr authentication

The `FLICKR_API_KEY` and `FLICKR_API_SECRET` can be fetched from your flickr account e.g. [http://www.flickr.com/services/apps/by/sulbalcon](http://www.flickr.com/services/apps/by/sulbalcon)

As directed in the [node-flicker module](https://github.com/sujal/node-flickr) go to
[this Oauth test client](http://term.ie/oauth/example/client.php) to get an auth token.

This was based on the abandoned [flicknode module](https://github.com/ciaranj/flickrnode).

### FS,DB

- walks the filesystem
- cal exif+md5sum
- store as json (file)
- store as json (db)
- walk the store byFile, byMD5

### Flickr

- reproduce snookr4gv2
- authenticate (passport) node app ?
- fork flickrnode and wrap as npm
- join with node-flickr ?
- walk flickr
