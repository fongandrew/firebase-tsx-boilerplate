/*
  Entrypoint for Typescript
*/
import * as Config from 'config';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<div>
  <button className="mui-btn mui-btn--primary">
    { Config.production ? "Prod" : "Dev" }
  </button>
  <button className="mui-btn mui-btn--raised mui-btn--accent">Hello</button>
  <button className="mui-btn mui-btn--flat mui-btn--accent">World</button>
  <p>
    Blargh
  </p>
  <p>
    Text
  </p>
  <div>
    World
  </div>
</div>, root);
