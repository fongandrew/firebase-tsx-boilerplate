/*
  Some common types for our app
*/
import * as Config from 'config';
import { database } from 'firebase';
import { History } from 'history';
import { Match } from 'react-router-dom';
import DataClient from './lib/data-client';

/*
  The global state (if we have any -- with firebase and decent routing,
  this isn't super necessary). Since global state is probably limited,
  we can use our main app component's state to store all of this.
*/
export interface State {}

/*
  Since we're using our main app component's state in lieu of a standalone
  store a la Flux or Redux, we should pass along that component's bound
  setState function as an alternative to the dispatch function.
*/
export function setStateFn<K extends keyof State>(
  f: (prevState: S, props: P) => Pick<S, K>,
  callback?: () => any
): void;
export function setStateFn<K extends keyof State>(
  state: Pick<S, K>, callback?: () => any
): void;

/*
  We follow a dependency-injection pattern. This is fancy talk for
  "we pass an object down our component tree that has things we might want to
  stub out later for testing"
*/
export interface BaseDeps {
  config: typeof Config;
  dataClient: DataClient;
  history?: History;
}

// Additions that get added in the actual App component
export interface Deps extends BaseDeps {
  history: History;
  match: Match;
  appState: State;
  setAppState: typeof setStateFn;
}

