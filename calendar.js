
const { writeFileSync } = require('fs')
const ics = require('ics')

module.exports = function Calendar(job){

    const event = {
        start: [2018, 5, 30, 6, 30],
        duration: { hours: 6, minutes: 30 },
        title: 'Bolder Boulder',
        description: 'Annual 10-kilometer run in Boulder, Colorado',
        location: 'Folsom Field, University of Colorado (finish line)',
        url: 'http://www.bolderboulder.com/',
        geo: { lat: 40.0095, lon: 105.2669 },
        categories: ['10k races', 'Memorial Day Weekend', 'Boulder CO'],
        status: 'CONFIRMED',
        organizer: { name: 'Admin', email: 'Race@BolderBOULDER.com' },
        attendees: [
          { name: 'Adam Gibbons', email: 'adam@example.com', rsvp: true },
          { name: 'Brittany Seaton', email: 'brittany@example2.org', dir: 'https://linkedin.com/in/brittanyseaton' }
        ]
      }



      ics.createEvent({
        title: 'Dinner',
        description: 'Nightly thing I do',
        start: [2018, 1, 15, 6, 30],
        duration: { minutes: 50 }
      }, (error, value) => {
        if (error) {
          console.log(error)
        }
       
        writeFileSync(`${__dirname}/event.ics`, value)
      })
}

