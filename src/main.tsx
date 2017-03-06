/*
  Entrypoint for Typescript
*/
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
} from 'react-router-dom';
import * as Config from 'config';
import * as firebase from 'firebase';
import App from "./components/App";
import DataClient from "./lib/data-client";

// Init firebase
const app = firebase.initializeApp(Config.firebase);
const database = app.database();
const dataClient = new DataClient(database);

// Mount React
ReactDOM.render(<Router>
  <App
    config={Config}
    dataClient={dataClient}
    initState={{}}
  />
</Router>, document.getElementById('root'));
