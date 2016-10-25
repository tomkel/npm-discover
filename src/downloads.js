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
}

function lastYear(packageName) {
  const today = new Date()
  const startDate = `${today.getUTCFullYear() - 1}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`
  const endDate = `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}-${today.getUTCDate()}`
  const url = `https://api.npmjs.org/downloads/range/${startDate}:${endDate}/${packageName}`
  return fetchGeneric(url)
}

function lastMonth(packageName) {
  const url = `https://api.npmjs.org/downloads/range/last-month/${packageName}`
  return fetchGeneric(url)
}


export { lastMonth,
         lastYear }
