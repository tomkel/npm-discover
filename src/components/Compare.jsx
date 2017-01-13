import * as React from 'react'
import regression from 'regression'
import moment from 'moment'
import * as downloads from '../downloads'
import Plotly from '../plotly'
import { peek } from '../util'

function prettyTerms(numTerms) {
  switch (numTerms) {
    case 2: return 'Linear'
    case 3: return 'Quadratic'
    case 4: return 'Cubic'
    case 5: return 'Quartic'
    case 6: return 'Quintic'
    default: return `x^${numTerms - 1}`
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
    dataObj.y.push(Math.max(vals[1], 0))
    dateTracker.add(1, 'w')
  })
  return dataObj
}

export default class Compare extends React.Component {

  createFigure() {
    const { package1, package2 } = this.props.params
    Promise.all([downloads.allByWeek(package1), downloads.allByWeek(package2)])
    .then((results) => {
      const regressions = []
      const data = results.map((dlResult) => {
        const dataObj = {
          type: 'scatter',
          /*line: {
            shape: 'spline',
            // smoothing => [0, 1.3]
            smoothing: 1.0,
          },*/
          name: dlResult.package,
          x: [],
          y: [],
        }
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

      regressions.forEach((curr) => {
        let power = 0
        let currRegression = regression('polynomial', curr, power += 1)
        let bestRegression = currRegression
        while (Math.abs(peek(currRegression.equation)) >= 0.1) {
          bestRegression = currRegression
          currRegression = regression('polynomial', curr, power += 1)
        }
        data.push(prepData(bestRegression, curr.package, curr.start))
      })

      const layout = {
        title: `${package1} vs ${package2}`,
        yaxis: {
          title: 'Weekly downloads',
          rangemode: 'nonnegative',
        },
      }

      const options = {
        displayModeBar: false,
        // scrollZoom: true,
        displaylogo: false,
      }

      Plotly.newPlot('compare', data, layout, options)

      console.timeEnd('start')
    })
  }

  componentDidMount() {
    this.createFigure()
  }

  componentDidUpdate() {
    this.createFigure()
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
