type LocationData = {
  cities: string[],
  countries: string[],
}

function filterLocation(locationData: LocationData, concerts: any[]) {
  const cities = locationData.cities
  const countries = locationData.countries

   return concerts
    .filter((concert) => countries.some((country) => concert.location.includes(country)))
    .filter((concert) => cities.some((city) => concert.location.includes(city)))
}

function filterConcerts(concerts: any[]) {
   return concerts
    .filter((concert) => concert.type !== 'Festival')
}

export {
  filterLocation,
  filterConcerts,
}
