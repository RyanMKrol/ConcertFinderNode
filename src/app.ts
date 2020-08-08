// app.js
import async from 'async'
import schedule from 'node-schedule'
import MailSender from 'noodle-email'
import flatten from 'lodash.flatten'

import { fetchArtistsForUser } from './api/LastFM'
import { fetchArtistID, fetchConcertsForArtist } from './api/Songkick'
import { filterLocation, filterConcerts, buildReport } from './Utils'

import gmailCredentials from './../credentials/GmailCredentials.json'
import userConfig from './../credentials/config.json'

const mailClient = new MailSender(gmailCredentials)
mailClient.setFrom('"ConcertFinder" <ryankrol.m@gmail.com>')

async function main() {
  try {
    userConfig.forEach(async user => {
      // fetch the artist data for what users have been listening to
      const lastFmData = await fetchArtistsForUser(
        user.username,
        user.listeningPeriodThresholds
      )

      // remove duplicate artists that may have come from different thresholds
      const uniqueArtists = lastFmData.filter(
        (item, index) =>
          lastFmData.findIndex(x => x.artist === item.artist) === index
      )

      // fill the artist data with a songkick ID, to fetch concerts later
      const artistDataWithIds = (
        await async.mapLimit(uniqueArtists, 3, async function(
          artistItem,
          callback
        ) {
          fetchArtistID(artistItem.artist)
            .then(artistId => {
              artistItem.artistId = artistId
              callback(null, artistItem)
            })
            .catch(error => {
              callback(error, null)
            })
        })
      ).filter(item => typeof item.artistId !== 'undefined')

      // find all concerts for our artist IDs
      const concerts = flatten(
        await async.mapLimit(artistDataWithIds, 1, async function(
          artistId,
          callback
        ) {
          fetchConcertsForArtist(artistId)
            .then(data => {
              callback(null, data)
            })
            .catch(error => {
              callback(error, null)
            })
        })
      )

      // filter the concerts based on user requirements
      const filteredConcerts = filterConcerts(
        filterLocation(user.locationData, concerts)
      )

      // build a report to send to the user
      const report = buildReport(filteredConcerts)

      // send out report
      mailClient.setTo(user.email)
      mailClient.sendMailWithHtml('Weekly Concert Report!', report)
    })
  } catch (error) {
    mailClient.setTo('ryankrol.m@gmail.com')
    mailClient.sendMail('Failed to generate concert report', error.toString())
  }
}

schedule.scheduleJob(
  {
    hour: 15,
    minute: 0,
    dayOfWeek: 1
  },
  async () => {
    main()
  }
)
