const { ExifImage } = require('exif')

module.exports = {
  extractExif
}

async function extractExif (data) {
  return new Promise((resolve, reject) => {
    ExifImage({ image: data }, function (error, exifData) {
      if (error) {
        // console.error('Error: ' + error.message)
        // reject(error)
        resolve({})
      } else {
        // console.log(exifData)
        resolve(exifData)
      }
    })
  })
}
