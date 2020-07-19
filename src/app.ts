// app.js
// import schedule from 'node-schedule'
import MailSender from 'noodle-email'
import flatten from 'lodash.flatten'

import { fetchArtistsForUser } from './api/LastFM'
import { fetchArtistID, fetchConcertsForArtistId } from './api/Songkick'
import { filterLocation, filterConcerts } from './Utils'

import gmailCredentials from './../credentials/GmailCredentials.json'
import userConfig from './../credentials/config.json'

const mailClient = new MailSender(gmailCredentials)
mailClient.setFrom('"ConcertFinder" <ryankrol.m@gmail.com>')

async function main() {
  try {
    userConfig.forEach(async user => {
      const lastFmData = await fetchArtistsForUser(
        user.username,
        user.listeningPeriodThresholds
      )

      const artistIdRequests = lastFmData.map(artistData => {
        return fetchArtistID(artistData.artist)
      })

      const artistIds = (await Promise.all(artistIdRequests)).filter(
        artistId => artistId
      )

      const concertRequests = artistIds.map(id => {
        return fetchConcertsForArtistId(id)
      })

      const concerts = flatten(await Promise.all(concertRequests))

      const filteredConcerts = filterConcerts(
        filterLocation(user.locationData, concerts)
      )

      mailClient.setTo(user.email)
      mailClient.sendMail(
        'Weekly Concert Report!',
        JSON.stringify(filteredConcerts, null, 2)
      )
    })
  } catch (error) {
    console.log(error)
    mailClient.setTo('ryankrol.m@gmail.com')
    mailClient.sendMail('Failed to generate concert report', error.toString())
  }
}

main()
