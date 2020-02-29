// app.js
import schedule from 'node-schedule'
import MailSender from 'noodlesmail'
import { fetchArtistsForUser } from './api/LastFM'
import { fetchArtistID, fetchConcertsForArtistId } from './api/Songkick'
import flatten from 'lodash.flatten'

import gmailCredentials from './../credentials/GmailCredentials.json'
import userConfig from './../config.json'

const mailClient = new MailSender(gmailCredentials)
mailClient.setFrom('"ConcertFinder" <ryankrol.m@gmail.com>')
mailClient.setTo('ryankrol.m@gmail.com')

schedule.scheduleJob('0 0 1 * * *', async () => {
  try {
    mailClient.sendMail('Weekly Conert Report!', 'Body')
  } catch(error) {
    console.log(error)
    mailClient.sendMail('Failed to generate concert report', error.toString())
  }
})


async function main() {
  userConfig.forEach(async (user) => {
    const lastFmData = (await fetchArtistsForUser(user.username, user.listeningPeriodThresholds)).slice(3,4)

    const artistIdRequests = lastFmData.map((artistData) => {
      return fetchArtistID(artistData.artist)
    })

    const artistIds = (await Promise.all(artistIdRequests)).filter((artistId) => artistId)

    const concertRequests = artistIds.map((id) => {
      return fetchConcertsForArtistId(id)
    })

    const concerts = flatten(await Promise.all(concertRequests))

    console.log('amount of concerts')
    console.log(concerts.length)
    console.log(concerts)

  })
}

main()
