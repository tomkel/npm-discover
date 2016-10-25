import * as React from 'react'
import regression from 'regression'
import moment from 'moment'
import * as downloads from '../downloads'
import Plotly from '../plotly'

function prettyTerms(numTerms) {
  switch (numTerms) {
    case 2: return 'Linear'
    case 3: return 'Quadratic'
    case 4: return 'Cubic'
    case 5: return 'Quartic'
    case 6: return 'Quintic'
    case 7: return 'x^6'
    case 8: return 'x^7'
    default: throw new Error('Unknown regression')
  }
}

function prepData(data, packageName = '', firstDate) {
  const dataObj = {
    type: 'scatter',
    name: `${packageName} ${prettyTerms(data.equation.length)} Regression`,
    x: [],
    y: [],
  }
  const dateTracker = moment(firstDate)
  data.points.forEach((vals) => {
    dataObj.x.push(dateTracker.format('YYYY-MM-DD'))
    dataObj.y.push(vals[1] > 0 ? vals[1] : 0)
    dateTracker.add(1, 'w')
  })
  return dataObj
}

export default class Compare extends React.Component {

  componentDidMount() {
    const { package1, package2 } = this.props.params
    Promise.all([downloads.allByWeek(package1), downloads.allByWeek(package2)])
    .then((results) => {
      const regressions = []
      const data = results.map((dlResult) => {
        const dataObj = { type: 'scatter', name: dlResult.package, x: [], y: [] }
        const regressionArr = []
        regressionArr.package = dlResult.package
        regressionArr.start = dlResult.start
        dlResult.downloads.forEach((dlDay, index) => {
          dataObj.x.push(dlDay.week)
          dataObj.y.push(dlDay.downloads)
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

      data.push(prepData(regression('linear', regressions[0]), regressions[0].package, regressions[0].start))
      data.push(prepData(regression('linear', regressions[1]), regressions[1].package, regressions[1].start))
      data.push(prepData(regression('polynomial', regressions[0], 2), regressions[0].package, regressions[0].start))
      data.push(prepData(regression('polynomial', regressions[0], 3), regressions[0].package, regressions[0].start))
      data.push(prepData(regression('polynomial', regressions[0], 4), regressions[0].package, regressions[0].start))
      data.push(prepData(regression('polynomial', regressions[0], 5), regressions[0].package, regressions[0].start))
      data.push(prepData(regression('polynomial', regressions[0], 6), regressions[0].package, regressions[0].start))
      data.push(prepData(regression('polynomial', regressions[0], 7), regressions[0].package, regressions[0].start))

      Plotly.newPlot('compare', data, layout, options)

      console.timeEnd('start')
    })
  }

  render() {
    console.time('start')
    const { package1, package2 } = this.props.params
    return (
      <div>
        <h1>Comparing {package1} and {package2}!</h1>
        <div id="compare" />
      </div>
    )
  }
}
