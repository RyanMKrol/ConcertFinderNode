// app.js
import schedule from 'node-schedule'
import MailSender from 'noodlesmail'

import gmailCredentials from './../credentials/GmailCredentials.json'

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
