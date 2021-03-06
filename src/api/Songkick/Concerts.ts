import fetch from 'node-fetch'
import songkickCredentials from './../../../credentials/SongkickCredentials.json'

import { ArtistData } from './../LastFM'

const BASE_URL = 'https://api.songkick.com/api/3.0/artists/'
const CONCERTS_PER_PAGE = 50
const DEFAULT_DATA = 'N/a'

type ArtistDataWithId = ArtistData & {
  artistId: string
}

export type ConcertData = {
  name: string
  type: string
  uri: string
  date: string
  location: string
  venue: string
  artist: string
}

async function fetchConcertsForArtist(
  artist: ArtistDataWithId
): Promise<ConcertData[]> {
  const concertData = await fetchConcertDataForArtistId(artist.artistId)

  const customConcertData = concertData.map(concert => {
    const date = concert.start
      ? concert.start.date || DEFAULT_DATA
      : DEFAULT_DATA
    const location = concert.location
      ? concert.location.city || DEFAULT_DATA
      : DEFAULT_DATA
    const venue = concert.venue
      ? concert.venue.displayName || DEFAULT_DATA
      : DEFAULT_DATA

    return {
      name: concert.displayName,
      type: concert.type,
      uri: concert.uri,
      date: date,
      location: location,
      venue: venue,
      artist: artist.artist
    }
  })

  return customConcertData
}

async function fetchConcertDataForArtistId(
  artistID: string,
  page = 1
): Promise<any> {
  const url = buildApiUrl(artistID, page)

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res: any) => {
        return res.json()
      })
      .then((resJson: any) => {
        validateApiResponse(resJson, artistID)

        const concerts = resJson.resultsPage.results.event

        const numResults = resJson.resultsPage.totalEntries
        const resultsAccountedFor = page * CONCERTS_PER_PAGE

        if (numResults > resultsAccountedFor) {
          fetchConcertDataForArtistId(artistID, page + 1).then(newConcerts => {
            resolve(concerts.concat(newConcerts))
          })
        } else {
          resolve(concerts)
        }
      })
      .catch((err: any) => {
        console.log(
          `Could not find concert data for artist with ID: ${artistID}`
        )

        resolve([])
      })
  })
}

function buildApiUrl(artistID: string, page: Number): string {
  const apiKey = songkickCredentials.key

  const url = `${BASE_URL}${artistID}/calendar.json?apikey=${apiKey}&page=${page}&per_page=${CONCERTS_PER_PAGE}`

  console.log(`Using Songkick Concerts URL: ${url}`)

  return url
}

function validateApiResponse(response: any, artistID: string) {
  if (
    !response ||
    !response.resultsPage ||
    !response.resultsPage.results ||
    !response.resultsPage.results.event ||
    response.resultsPage.status !== 'ok' ||
    response.resultsPage.results.event === 0
  ) {
    throw new Error(
      `Could not validate the Songkick API response fetching concerts, for artist: ${artistID}`
    )
  }
}

export { fetchConcertsForArtist }
