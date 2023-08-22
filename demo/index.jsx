import React from 'react'
import ReactDOM from 'react-dom/client'

const rootEl = document.getElementById('app')

const render = (Component) => {
  ReactDOM.createRoot(rootEl).render(<Component />)
}

const renderApp = () => {
  const App = require('./app').default
  render(App)
}

renderApp()

if (module.hot) {
  module.hot.accept('./app', renderApp)
}
