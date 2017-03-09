/*
  Purpose of this file is to set up DOM so Mocha can test front-end code
  entirely within Node. This is required by Mocha CLI command.
*/

// Point to right tsconfig
require("ts-node").register({
  project: "./tsconfig.test.json"
});

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
  global.document = jsdom(baseDOM);
  global.window = document.defaultView;
  global.self = window;
  global.navigator = {
    userAgent: 'node.js'
  };
}

module.exports = createDOM();
