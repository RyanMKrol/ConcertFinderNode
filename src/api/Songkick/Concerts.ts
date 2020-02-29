import fetch from 'node-fetch'
import songkickCredentials from './../../../credentials/SongkickCredentials.json'

const BASE_URL = "https://api.songkick.com/api/3.0/artists/"
const CONCERTS_PER_PAGE = 3

async function fetchConcertsForArtistId(
  artistID: string,
  page: number = 1,
): Promise<any> {
  const url = buildApiUrl(artistID, page)

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res: any) => {
        return res.json()
      })
      .then((resJson: any) => {
        validateApiResponse(resJson)

        const concerts = resJson.resultsPage.results.event

        const numResults = resJson.resultsPage.totalEntries
        const resultsAccountedFor = page * CONCERTS_PER_PAGE

        if (numResults > resultsAccountedFor) {
          fetchConcertsForArtistId(artistID, page+1)
            .then((newConcerts) => {
              resolve(concerts.concat(newConcerts))
            })
        } else {
          resolve(concerts)
        }
      })
      .catch((err: any) => {
        console.log(`Caught an error trying to get concert data for artist with ID: ${artistID}`)
        console.error(err)

        resolve([])
      })
  })
}

function buildApiUrl(
  artistID: string,
  page: Number,
): string {
  const apiKey = songkickCredentials.key

  const url = `${BASE_URL}${artistID}/calendar.json?apikey=${apiKey}&page=${page}&per_page=${CONCERTS_PER_PAGE}`

  console.log(`Using Songkick Concerts URL: ${url}`)

  return url
}

function validateApiResponse(response) {
  if (
    !response ||
    !response.resultsPage ||
    !response.resultsPage.results ||
    !response.resultsPage.results.event ||
    response.resultsPage.status !== 'ok' ||
    response.resultsPage.results.event === 0
  ) {
    throw new Error('Could not validate the Songkick API response')
  }
}

export {
  fetchConcertsForArtistId
}
