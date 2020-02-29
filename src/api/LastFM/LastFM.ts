import lastFmCredentials from './../../../credentials/LastFMCredentials.json'

const BASE_URL = 'http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&format=json'
const RESULT_LIMIT = 350

async function fetchArtists(listeningPeriod, username) {
  const url = buildApiUrl(listeningPeriod, username)

  return {}
}

function buildApiUrl(listeningPeriod, username) {
  const apiKey = lastFmCredentials.key
  const url = `${BASE_URL}&limit=${RESULT_LIMIT}&api_key=${apiKey}&user=${username}&period=${listeningPeriod}`

  console.log(`Using URL: ${url}`)

  return url
}

export {
  fetchArtists
}
