# Snookr

Finally start the port to node.js

Let us start with just reading the exif data.

This is another us of node-exif: https://github.com/cianclarke/node-gallery

## Flickr authentication
The `FLICKR_API_KEY` and `FLICKR_API_SECRET` can be fetched from your flickr account e.g. [http://www.flickr.com/services/apps/by/sulbalcon](http://www.flickr.com/services/apps/by/sulbalcon)

As directed in the [node-flicker module](https://github.com/sujal/node-flickr) go to
[this Oauth test client](http://term.ie/oauth/example/client.php) to get an auth token.

This was based on the abandoned [flicknode module](https://github.com/ciaranj/flickrnode).

## TODO

**FS,DB**

* walks the filesystem
* cal exif+md5sum
* store as json (file)
* store as json (db)
* walk the store byFile, byMD5

**Flickr**

* reproduce snookr4gv2
* authenticate (passport) node app ?
* fork flickrnode and wrap as npm
* join with node-flickr ?
* walk flickr
    
