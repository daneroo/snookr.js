var ExifImage = require('exif').ExifImage;

try {
  new ExifImage({ image : 'images/2012-09-12T18.52.43.jpg' }, function (error, image) {
    if (error) {
      console.log('Error: '+error.message);
    } else{
      pretty(image);
    }
  });
} catch (error) {
  console.log('Error: ' + error);
}

function pretty(image){
  // console.log(image); // Do something with your data!
  Object.keys(image).forEach(function(key){
    console.log('exif section:',key);
    var section = image[key];
    if (section) section.forEach(function(tag){
      // console.log('--',tag);
      console.log('--',tag.tagName,':',tag.value);
    });
  });
}