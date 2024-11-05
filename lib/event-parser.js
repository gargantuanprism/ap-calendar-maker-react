const path = require('node:path')
const fs = require('fs');

const {DateTime} = require('luxon');
const _ = require('lodash');
const xml2js = require('xml2js');
const randomColor = require('randomcolor');
const {parse} = require('csv-parse/sync');
const Promise = require('bluebird');

const PER_PAGE = 8
const DRIVE_ID_REGEX = /d\/(.+)\/view/
// const ICONS_PATH = path.join(__dirname, 'icons')
const ICONS_PATH = './public/icons'
const MAX_TITLE_SIZE = 5.0
const MIN_TITLE_SIZE = 2.6

class EventParser {
  constructor(){
    this.events = [];
    console.log('EventParser constructor');
  }

  async parse(csv){
    csv = fs.readFileSync('./csv/2024-11.csv', 'utf-8');
    let rows = parse(csv, {columns: true});
    console.log('EventParser parse');

    let events = await Promise.mapSeries(rows, async row => {
      let date = DateTime.fromISO(row.DATE)
      let start = DateTime.fromISO(row['START']).toFormat('h:mma')
      let iconPath = `${ICONS_PATH}/${row.ICON}`
      let svgIcon, imageIcon

      if (fs.accessSync(`${ICONS_PATH}/${row.ICON}`, fs.constants.R_OK) == null){
        if (iconPath.endsWith('.svg')){
          svgIcon = fs.readFileSync(`${ICONS_PATH}/${row.ICON}`)

          let parser = new xml2js.Parser()
          let svgData = await parser.parseStringPromise(svgIcon)

          // remove fill, height, width, and style
          delete svgData.svg['$'].fill
          delete svgData.svg['$'].height
          delete svgData.svg['$'].width
          delete svgData.svg['$'].style
          delete svgData.svg.style
          _.set(svgData, 'svg.path[0].$.fill', null)

          let builder = new xml2js.Builder()
          svgIcon = builder.buildObject(svgData)
        }
        else {
          imageIcon = iconPath
        }
      }
      else {
        console.warn(`Icon not found: ${row.ICON}`)
      }

      let titleSize = -0.1671533 * row.TITLE.length + 8.8

      if (row.TITLESIZE){
        titleSize += parseFloat(row.TITLESIZE)
      }

      if (titleSize > MAX_TITLE_SIZE){
        titleSize = MAX_TITLE_SIZE
      }
      if (titleSize < MIN_TITLE_SIZE || row.SUBTITLE){
        titleSize = MIN_TITLE_SIZE
      }

      let spacerSize = titleSize / 8.5

      let eventType = row.TYPE
      if (row.SUBTYPE){
        eventType += ` - ${row.SUBTYPE}`
      }

      let color = _.isEmpty(row.COLOR) ? randomColor({luminosity: 'dark'}): row.COLOR

      return {
        date,
        dow: date.toFormat('ccc'),
        day: date.toFormat('d'),
        type: eventType,
        name: row.TITLE,
        subtitle: row.SUBTITLE,
        svgIcon: svgIcon || null,
        imageIcon: imageIcon || null,
        start: row.END ? `${start}-`: start,
        end: row.END ? DateTime.fromISO(row.END).toFormat('h:mma'): '',
        color,
        size: `${titleSize}em`,
        spacerSize: `${spacerSize}em`
      }

      //    let driveId = row.ICON.match(DRIVE_ID_REGEX)[1]
      //    let resp = await axios.get('https://drive.google.com/uc', {
      //      params: {
      //        export: 'download',
      //        id: driveId,
      //        confirm: 'yes'
      //      }
      //    })
    })

    let pages = _.chunk(events, PER_PAGE)

    // if (argv.page){
    //   pages = [pages[argv.page - 1]]
    // }

    let info = {
      title: pages[0][0].date.toFormat('LLLL yyyy'),
      minTitleSize: `${MIN_TITLE_SIZE}em`
    }

    return {
      pages,
      info
    }
  }
}

module.exports = EventParser;

