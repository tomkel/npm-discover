import * as React from 'react'

export default class Compare extends React.Component {
  render() {
    const { package1, package2 } = this.props.params
    console.log(this.props)
    return <h1>Comparing {package1} and {package2}!</h1>
  }
}
