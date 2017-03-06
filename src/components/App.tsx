/*
  Our main App. Also serves as a declarative listing of our routes.
*/

import * as React from 'react';
import { Route, RouterContext } from 'react-router-dom';
import { State, BaseDeps, Deps } from '../types';
import GameList from "./GameList";
import Scores from "./Scores";

interface Props extends BaseDeps {
  initState: State;
}

export class App extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = props.initState;
  }

  render() {
    return <div className="mui-container">
      <Route path="/" exact render={this.wrap(GameList)} />
      <Route path="/game/:gameId" render={this.wrap(Scores)} />
    </div>;
  }

  // Create deps object we can pass down to subcomponents
  getDeps(context: RouterContext): Deps {
    return {
      ...this.props,
      history: context,
      match: context.match,
      appState: this.state,
      setAppState: this.setState.bind(this),
    };
  }

  wrap<P>(Component: React.ComponentClass<P>|React.StatelessComponent<P>) {
    return (ctx: RouterContext) => <Component {...this.getDeps(ctx)} />;
  }
}

export default App;
