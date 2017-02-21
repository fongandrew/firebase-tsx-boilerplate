/*
  Entrypoint for Typescript
*/
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Config from 'config';
import * as firebase from 'firebase';

// Init firebase
const app = firebase.initializeApp(Config.firebase);
const database = app.database();

// Re-render everything when FB changes
database.ref('/').on('value', (snapshot) => {
  let val = snapshot ? snapshot.val() : null;
  ReactDOM.render(<div>
    { JSON.stringify(val) }
  </div>, document.getElementById('root'));
});
