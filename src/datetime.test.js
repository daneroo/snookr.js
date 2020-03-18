
const { normalize, normalizeMS } = require('./datetime')

describe('datetime', () => {
  describe('normalize', () => {
    test.each([
      // [name, stamp, expected],
      // happy path
      ['id', '2009-10-02T09:47:03', '2009-10-02T09:47:03'],
      ['exif', '2009:10:02 09:47:03', '2009-10-02T09:47:03'],
      ['fname', '2009-10-02T09-47-03', '2009-10-02T09:47:03'],
      // current behavior that moght chenge
      ['mixed', '2009-10:02T09-47:03', '2009-10-02T09:47:03'],
      // expected errors
      ['bad-format', '20091002T094703', null],
      ['bad-month', '2009-34-02T09:47:03', null]
    ])('Check truth (%s)', (name, stamp, expected) => {
      const v = normalize(stamp)
      expect(v).toBe(expected)
    })
  })
  describe('normalizeMS', () => {
    test.each([
      // [name, ms, expected],
      // happy path
      ['epoch-UTC', 0, '1969-12-31T19:00:00'],
      ['epoch-EST', 18000000, '1970-01-01T00:00:00'],
      ['epoch-me', -114546975000, '1966-05-16T01:23:45'],
      ['when-I-wrote', 1584502134242, '2020-03-17T23:28:54']
      // expected errors
      // ['bad-format', '20091002T094703', null],
      // ['bad-month', '2009-34-02T09:47:03', null]
    ])('Check truth (%s)', (name, stamp, expected) => {
      const v = normalizeMS(stamp)
      expect(v).toBe(expected)
    })
  })
})
