import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

const Home = () => {
  return (
    <div>
      <h1>Home 1</h1>
    </div>
  )
}

export const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
      </Switch>
    </Router>
  )
}

export default App
