import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const Main = React.lazy(() => import('./pages/main'))

import { Switch, Route } from 'wouter'

import './style.css'

function App() {

  return <React.Suspense fallback={<>loading.</>}>
      <Switch>
        <Route path="/">
          {() => <Main />}
        </Route>
      </Switch>
    </React.Suspense>

}

ReactDOM.render(<App />, document.getElementById('root'));
