var ExifImage = require('exif').ExifImage;

try {
  new ExifImage({ image : 'images/2012-09-12T18.52.43.jpg' }, function (error, exifData) {
    if (error) {
      console.log('Error: '+error.message);
      process.exit(-1);
    }
    console.log('exif',exifData)
  });
} catch (error) {
  console.log('Error: ' + error);
}

