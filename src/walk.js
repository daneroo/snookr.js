// walker Taken from MomPhotoCompare
const fs = require('fs').promises

async function walk (dir, onItem = async (path) => { }) {
  const list = await fs.readdir(dir, { withFileTypes: true })
  for (const dirent of list) {
    const path = `${dir}/${dirent.name}`
    if (dirent.isDirectory()) {
      // console.log(`subdir: ${path}`)
      await walk(path, onItem)
    } else {
      await onItem(path)
    }
  }
}
exports.walk = walk
