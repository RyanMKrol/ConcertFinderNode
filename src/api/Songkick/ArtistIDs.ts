import fetch from 'node-fetch'
import songkickCredentials from './../../../credentials/SongkickCredentials.json'

const BASE_URL = 'https://api.songkick.com/api/3.0/search/artists.json'

type ArtistID = string

async function fetchArtistID(artistName: string): Promise<ArtistID> {
  const url = buildApiUrl(artistName)

  return fetch(url)
    .then((res: any) => {
      return res.json()
    })
    .then((resJson: any) => {
      validateApiResponse(resJson, artistName)
      return resJson.resultsPage.results.artist[0].id
    })
    .catch((err: any) => {
      console.log('Caught an error trying to get the artist ID')
      console.error(err)

      return undefined
    })
}

function buildApiUrl(artistName: string): string {
  const apiKey = songkickCredentials.key
  const uriArtistName = encodeURI(artistName)

  const url = `${BASE_URL}?apikey=${apiKey}&query=${uriArtistName}`

  console.log(`Using Songkick Artist IDs URL: ${url}`)

  return url
}

function validateApiResponse(response: any, artistName: string) {
  if (
    !response ||
    !response.resultsPage ||
    !response.resultsPage.results ||
    !response.resultsPage.results.artist ||
    response.resultsPage.results.artist.length === 0 ||
    !response.resultsPage.results.artist[0].id ||
    response.resultsPage.status !== 'ok'
  ) {
    throw new Error(
      `Could not validate the Songkick API response fetching artist IDs, for artist: ${artistName}`
    )
  }
}

export { fetchArtistID }
