import fetch from 'node-fetch'
import flatten from 'lodash.flatten'

import { ListeningPeriod } from './'
import lastFmCredentials from './../../../credentials/LastFMCredentials.json'

const BASE_URL = 'http://ws.audioscrobbler.com/2.0/?method=user.gettopartists&format=json'
const RESULT_LIMIT = 350

type ArtistData = {
  artist: string,
  plays: Number,
  url: string,
  period: ListeningPeriod,
  threshold: Number,
}

async function fetchArtistsForUser(
  username: string,
  thresholds: object,
): Promise<ArtistData[]> {
  const lastFmRequests = Object.keys(thresholds).map((period: ListeningPeriod) => {
    const threshold = thresholds[period]
    return fetchArtistsForPeriod(period, username, threshold)
  })

  const lastFmData = flatten(await Promise.all(lastFmRequests))

  return lastFmData
}

async function fetchArtistsForPeriod(
  listeningPeriod: ListeningPeriod,
  username: string,
  threshold: Number,
): Promise<ArtistData[]> {
  const url = buildApiUrl(listeningPeriod, username)

  return fetch(url)
    .then((res: any) => {
      return res.json()
    })
    .then((resJson: any) => {
      const artistData: any = resJson.topartists.artist
      const filteredArtists = artistData.filter((artist) => artist.playcount >= threshold)

      return filteredArtists.map((artist) => {
        return {
          artist: artist.name,
          plays: artist.playcount,
          url: artist.url,
          period: listeningPeriod,
          threshold: threshold,
        }
      })
    })
    .catch((err: any) => {
      console.error(err)
    })
}

function buildApiUrl(
  listeningPeriod: ListeningPeriod,
  username: string
): string {
  const apiKey = lastFmCredentials.key
  const url = `${BASE_URL}&limit=${RESULT_LIMIT}&api_key=${apiKey}&user=${username}&period=${listeningPeriod}`

  console.log(`Using URL: ${url}`)

  return url
}

export {
  fetchArtistsForUser
}
