import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const Main = React.lazy(() => import('./pages/main'))
const SDF = React.lazy(() => import('./pages/sdf'))

import { Switch, Route } from 'wouter'

import './style.css'

function App() {

  return <React.Suspense fallback={<>loading.</>}>
      <Switch>
        <Route path="/">
          {() => <Main />}
        </Route>
        <Route path="/sdf">
          {() => <SDF />}
        </Route>
      </Switch>
    </React.Suspense>

}

ReactDOM.render(<App />, document.getElementById('root'));
