import moment from 'moment'
import { peek } from './util'

function statusOK(response) {
  if (!response.ok) {
    return Promise.reject(response.statusText)
  }
  return response
}

function fetchGeneric(url) {
  return fetch(url)
    .then(statusOK)
    .then(r => r.json())
    .then((json) => {
      if (json.error) {
        throw new Error(json.error)
      }
      return json
    })
}

function range(from, to, packageName) {
  const url = `https://api.npmjs.org/downloads/range/${from}:${to}/${packageName}`
  return fetchGeneric(url)
}

function point(from, to, packageName) {
  const url = `https://api.npmjs.org/downloads/point/${from}:${to}/${packageName}`
  return fetchGeneric(url)
}

function pad(n) {
  return n < 10 ? `0${n}` : n
}

function lastYearByDay(packageName) {
  const today = new Date()
  const startDate = `${today.getUTCFullYear() - 1}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`
  const endDate = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`
  return range(startDate, endDate, packageName)
}

function lastMonthByDay(packageName) {
  const url = `https://api.npmjs.org/downloads/range/last-month/${packageName}`
  return fetchGeneric(url)
}

function allByDay(packageName) {
  const today = new Date()
  const startDate = `${today.getUTCFullYear() - 10}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`
  const endDate = `${today.getUTCFullYear()}-${pad(today.getUTCMonth() + 1)}-${pad(today.getUTCDate())}`
  return range(startDate, endDate, packageName)
}

// use this for if package was not released on a sunday
function getWeekStart(date) {
  const d = moment(date)
  d.subtract(d.day(), 'd')
  return d.format('YYYY-MM-DD')
}

function weeksBetween(d1, d2) {
  const m1 = moment(d1)
  const m2 = moment(d2)
  return m2.diff(m1, 'weeks')
}

function allByWeek(packageName) {
  return allByDay(packageName).then((r) => {
    const weekly = { end: r.end, package: r.package, downloads: [] }
    weekly.start = getWeekStart(r.downloads[0].day)
    const currWeek = moment(weekly.start)

    const numWeeks = weeksBetween(weekly.start, peek(r.downloads).day)
    for (let i = 0; i <= numWeeks; i += 1) {
      weekly.downloads[i] = { week: currWeek.format('YYYY-MM-DD'), downloads: 0 }
      currWeek.add(1, 'w')
    }

    r.downloads.forEach((curr) => {
      const weekIndex = weeksBetween(weekly.start, curr.day)
      weekly.downloads[weekIndex].downloads += curr.downloads
    })

    weekly.downloads.pop()
    return weekly
  })
}


export { allByWeek,
         allByDay }
