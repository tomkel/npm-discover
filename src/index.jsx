import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { HashRouter as Router, Match, Miss, Link } from 'react-router'
import Home from './components/Home'
import Compare from './components/Compare'
import NotFound from './components/NotFound'

const App = () =>
  <Router>
    <div>
      <Match pattern="/" exactly component={Home} />
      <Match pattern="/:package1/:package2" exactly component={Compare} />
      <Miss component={NotFound} />
    </div>
  </Router>

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
