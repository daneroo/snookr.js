# Snookr (JS)

Port of snookr to JavaScript

Let's get the functional split right first this time.

- Legacy: Download from flickr (no post or update planned)
- scrub (digest/exif)
- classify (user/filetype - meta present/camera/user|owner)
- dedup

## TODO

- Rename repo to snookr (npx snookr | @snookr/snookr | @daneroo/snookr)
- Command (yargs) pattern: see `gphotos-puppeteer`
- flickr: download all files name with datetaken-digest
- scrub (digest/exif)
- exif options:
  - exif (gomfunkel/node-exif)
  - related: sindresorhus/file-type

## Exiftool experiments (for classification)

works for (some) `.mov,.3gp,.mp4,...`, use -json for parsing

```bash
brew install exiftool

exiftool /Volumes/Space/archive/media/video/PMB/7-23-2008/20080712112304.modd
exiftool /Volumes/Space/archive/media/video/PMB/7-23-2008/20080712112304.moff
exiftool /Volumes/Space/archive/media/video/PMB/7-23-2008/20080712112304.mpg

exiftool /Volumes/Space/archive/media/photo/catou/2008-09-19-Krzr-Last/20-07-08_2123.3gp

exiftool '/Volumes/Space/archive/media/photo/catou/2014-03-04-IPhone4s-Dropbox/2012-02-24 19.35.48.mov'

exiftool "/Volumes/Space/archive/media/video/ImageMixer3//'07_04_22_01/M2U00585.MPG"


docker run --rm -it -v $(pwd)/data:/data umnelevator/exiftool
docker run --rm -it -v $(pwd)/data:/data umnelevator/exiftool /data/flickr/2004/2004-11/2004-11-05T14-01-49-f087ff9547e2960a50ae29cbc7f46af4.jpg

```

## Flickr example

```bash
. ./FLICKR_ENV.sh
node flickr.js
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
