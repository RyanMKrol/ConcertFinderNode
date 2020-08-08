import fetch from 'node-fetch'
import flatten from 'lodash.flatten'

import { ListeningPeriod } from './'
import lastFmCredentials from './../../../credentials/LastFMCredentials.json'

const BASE_URL =
  'http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&format=json'
const RESULT_LIMIT = 350

export type ArtistData = {
  artist: string
  plays: Number
  url: string
  period: ListeningPeriod
  threshold: Number
}

// we can have multiple users defined in the config, so this function
// fetches data on a per-user basis
async function fetchArtistsForUser(
  username: string,
  thresholds: object
): Promise<ArtistData[]> {
  const lastFmRequests = Object.keys(thresholds).map(
    (period: ListeningPeriod) => {
      const threshold = thresholds[period]
      return fetchArtistsForPeriod(period, username, threshold)
    }
  )

  // get a single list of valid artists, removing any undefined items
  const lastFmData = flatten(await Promise.all(lastFmRequests)).filter(
    item => item
  )

  return lastFmData
}

// a user can have multiple listening period thresholds, so this
// will fetch data for a given period
async function fetchArtistsForPeriod(
  listeningPeriod: ListeningPeriod,
  username: string,
  threshold: Number
): Promise<ArtistData[]> {
  const url = buildApiUrl(listeningPeriod, username)

  return fetch(url)
    .then((res: any) => {
      return res.json()
    })
    .then((resJson: any) => {
      validateApiResponse(resJson)

      const artistData: any = resJson.topartists.artist
      const filteredArtists = artistData.filter(
        artist => artist.playcount >= threshold
      )

      return filteredArtists.map(artist => {
        return {
          artist: artist.name,
          plays: artist.playcount,
          url: artist.url,
          period: listeningPeriod,
          threshold: threshold
        }
      })
    })
    .catch((err: any) => {
      console.log('Caught an error trying to fetch artists')
      console.error(err)

      return undefined
    })
}

// gets you an API url for a given listening period, and user
function buildApiUrl(
  listeningPeriod: ListeningPeriod,
  username: string
): string {
  const apiKey = lastFmCredentials.key
  const url = `${BASE_URL}&limit=${RESULT_LIMIT}&api_key=${apiKey}&user=${username}&period=${listeningPeriod}`

  console.log(`Using LastFM URL: ${url}`)

  return url
}

function validateApiResponse(response) {
  if (
    !response ||
    !response.topartists ||
    !response.topartists.artist ||
    response.topartists.artist === 0
  ) {
    throw new Error('Could not validate the LastFM API response')
  }
}

export { fetchArtistsForUser }
