import React, { Component } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { Provider } from "./context";

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// react lazy 코드 스플리팅 
const DefaultLayout = React.lazy(() => import('./components/defaultLayout'));
const ListLayout = React.lazy(() => import('./components/List'));
const TestLayout = React.lazy(() => import('./components/Test'));

class App extends Component {
  render() {
    return (
      <Provider>
        <BrowserRouter>
          <React.Suspense fallback={loading}>
            <Switch>
              <Route exact path="/" name="Home" render={(props) => <DefaultLayout {...props} />} />
              <Route exact path="/List" name="List" render={(props) => <ListLayout {...props} />} />
              <Route exact path="/Test" name="Test" render={(props) => <TestLayout {...props} />} />
            </Switch>
          </React.Suspense>
        </BrowserRouter>
      </Provider>
    )
  }
}

export default App
