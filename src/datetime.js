
const moment = require('moment')
// moment format iso8601, no Timezone
const momentFormatNoTZ = 'YYYY-MM-DD[T]HH:mm:ss'

module.exports = {
  normalize,
  normalizeMS,
  momentFormatNoTZ
}

// Normalize the datetime format to YYYY-MM-DD[T]HH-mm-ss
//   fname: 2009-10-02T09-47-03
//    exif: 2009:10:02 09:47:03
// isoNoTZ: 2009-10-02T09:47:03
// if date is not ok, return null (for now)
function normalize (stamp) {
  // be lenient in what we accept - stricter enforcement can be done elsewhere
  // date separator can be '-' or ':'
  // time separator can be ':' or '-'
  // date-time connector can be 'T' or ' '
  const re = /^(\d{4})[-:](\d{2})[:-](\d{2})[T ](\d{2})[-:]([\d]{2})[-:]([\d]{2})$/
  // const normalized = stamp.replace(re, '$1-$2-$3T$4:$5:$6')
  const match = stamp.match(re)
  if (!match) {
    return null
  }
  //  use same member names as moment Object constructor
  const [/* _whole_ */, y, M, d, h, m, s] = match
  // const normalized = `${y}-${M}-${d}T${h}:${m}:${s}`
  const normalized = moment({ y, M: M - 1, d, h, m, s })

  if (!normalized.isValid()) {
    return null
  }
  return normalized.format(momentFormatNoTZ)
}

function normalizeMS (ms) {
  return moment(ms).format(momentFormatNoTZ)
}
