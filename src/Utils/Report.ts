var MarkdownIt = require('markdown-it'),
  md = new MarkdownIt()

import { ConcertData } from './../api/Songkick'

export default function buildReport(concertData: ConcertData[]): string {
  sortConcerts(concertData)

  const reportContent = `${generateHeader()}` + `${generateBody(concertData)}`
  const markdownReportContent = md.render(reportContent)

  return markdownReportContent
}

function generateHeader(): string {
  return '# Concerts\n\n'
}

function generateBody(concertData: ConcertData[]): string {
  let currentArtist: string

  return concertData.reduce((acc, current) => {
    const concertString =
      `**Concert Name**: ${current.name}  \n` +
      `**Venue**: ${current.venue}  \n` +
      `**Date**: ${current.date}  \n` +
      `**Location**: ${current.location}  \n` +
      `**Type**: ${current.type}  \n` +
      `**Link**: ${current.uri}  \n\n`

    if (current.artist === currentArtist) {
      return `${acc}` + `${concertString}`
    } else {
      currentArtist = current.artist
      return `${acc}` + `## ${current.artist}  \n` + `${concertString}`
    }
  }, '')
}

function sortConcerts(concertData: ConcertData[]) {
  concertData.sort((a, b) => {
    // sort on artist name
    if (a.artist < b.artist) {
      return -1
    }
    if (a.artist > b.artist) {
      return 1
    }

    // if they're the same, sort on location
    if (a.location < b.location) {
      return -1
    }
    if (a.location > b.location) {
      return 1
    }

    // else they're the same as far as we're concerned
    return 0
  })
}
