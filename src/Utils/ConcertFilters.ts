import { ConcertData } from './../api/Songkick'

type LocationData = {
  include: {
    cities: string[]
    countries: string[]
  }
  exclude: {
    cities: string[]
    countries: string[]
  }
}

function filterLocation(
  locationData: LocationData,
  concerts: ConcertData[]
): ConcertData[] {
  const includeCountries = locationData.include.countries
  const includeCities = locationData.include.cities
  const excludeCountries = locationData.exclude.countries
  const excludeCities = locationData.exclude.cities

  return concerts
    .filter(concert =>
      includeCountries.length > 0
        ? includeCountries.some(country => concert.location.includes(country))
        : true
    )
    .filter(concert =>
      includeCities.length > 0
        ? includeCities.some(city => concert.location.includes(city))
        : true
    )
    .filter(concert =>
      excludeCountries.length > 0
        ? excludeCountries.some(country => !concert.location.includes(country))
        : true
    )
    .filter(concert =>
      excludeCities.length > 0
        ? excludeCities.some(city => !concert.location.includes(city))
        : true
    )
}

function filterConcerts(concerts: ConcertData[]) {
  return concerts.filter(concert => concert.type !== 'Festival')
}

export { filterLocation, filterConcerts }
