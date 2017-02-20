/*
  Purpose of this file is to set up TypeScript references and DOM so Mocha
  can test front-end code entirely within Node. This is run *BEFORE*
  Mocha is initialized.
*/

// Type declarations for Node code
declare var require: (module: string) => any;
declare var global: Window;
declare global {
  interface Document {
    parentWindow: Window;
  }
}

// Create a DOM for React and other libs to play with
function createDOM() {
  // if DOM alredy exists, we don't need to do anything
  if (typeof document !== 'undefined') {
    return;
  }

  var baseDOM =
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head>' +
    '<body></body></html>';

  var jsdom = require('jsdom').jsdom;
  (<any> global).document = jsdom(baseDOM);
  (<any> global).window = (<any> document).defaultView;
  (<any> global).self = window;
  (<any> global).navigator = {
    userAgent: 'node.js'
  } as any;
}

export = createDOM();
