/*
  Entrypoint for Typescript
*/
import * as Config from 'config';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<div>
  { Config.production ? "Prod" : "Dev" }
</div>, root);
