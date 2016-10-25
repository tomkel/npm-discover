import * as React from 'react'
import regression from 'regression'
import moment from 'moment'
import * as downloads from '../downloads'

function prettyTerms(numTerms) {
  switch (numTerms) {
    case 2: return 'Linear'
    case 3: return 'Quadratic'
    case 4: return 'Cubic'
    case 5: return 'Quartic'
    default: throw new Error('Unknown regression')
  }
}

function prepData(data, packageName = '', firstDate) {
  console.log(data)
  const dataObj = {
    type: 'scatter',
    name: `${packageName} ${prettyTerms(data.equation.length)} Regression`,
    x: [],
    y: [],
  }
  const dateTracker = moment(firstDate).subtract(1, 'd')
  data.points.forEach((vals) => {
    dataObj.x.push(dateTracker.add(1, 'd').format('YYYY-MM-DD'))
    dataObj.y.push(vals[1])
  })
  return dataObj
}

export default class Compare extends React.Component {

  componentDidMount() {
    const { package1, package2 } = this.props.params
    Promise.all([downloads.lastYear(package1), downloads.lastYear(package2)])
    .then((results) => {
      const regressions = []
      let firstDate
      const data = results.map((dlResult) => {
        const dataObj = { type: 'scatter', name: dlResult.package, x: [], y: [] }
        const regressionArr = []
        regressionArr.package = dlResult.package
        dlResult.downloads.forEach((dlDay, index) => {
          dataObj.x.push(dlDay.day)
          dataObj.y.push(dlDay.downloads)
          if (!firstDate) firstDate = dlDay.day
          regressionArr.push([index, dlDay.downloads])
        })
        regressions.push(regressionArr)

        return dataObj
      })

      const layout = {
        title: `${package1} vs ${package2}`,
      }

      const options = {
        displayModeBar: false,
        scrollZoom: true,
        displaylogo: false,
      }

      data.push(prepData(regression('linear', regressions[0]), regressions[0].package, firstDate))
      data.push(prepData(regression('linear', regressions[1]), regressions[1].package, firstDate))
      data.push(prepData(regression('polynomial', regressions[0], 2), regressions[0].package, firstDate))
      data.push(prepData(regression('polynomial', regressions[0], 3), regressions[0].package, firstDate))
      data.push(prepData(regression('polynomial', regressions[0], 4), regressions[0].package, firstDate))

      Plotly.newPlot('compare', data, layout, options)

      console.timeEnd('start')
    })
  }

  render() {
    console.time('start')
    const { package1, package2 } = this.props.params
    console.log(this.props)
    return (
      <div>
        <h1>Comparing {package1} and {package2}!</h1>
        <div id="compare" />
      </div>
    )
  }
}
