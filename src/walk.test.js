
const { walk } = require('./walk')

describe('walk', () => {
  test.each([
    // [name, path, expected],
    // happy path
    ['images/', 'images', ['images/2012-09-12T18.52.43.jpg']]
  ])('walk (%s)', async (name, root, expected) => {
    const v = []
    await walk(root, async (path) => {
      v.push(path)
    })
    expect(v).toStrictEqual(expected)
  })
})
