/*
  List of games we're tracking scores for
*/

import * as _ from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { view } from '../common/View';
import { Deps } from "../../types";
import * as T from "../../lib/data-types";

interface Props {
  games?: T.ListWrapper<T.Game>;
}

const GameList = ({ games }: Props) => {
  if (! games) {
    return <div>
      Loading &hellip;
    </div>;
  }

  return <div>
    { _.map(games.data, ([id, game]) => <div key={id}>
      <Link to={`/game/${id}`}>{ game.name }</Link>
    </div>) }
  </div>;
}

const Container = view((p: Deps) => ({
  games: p.dataClient.getMostRecentGames({})
}))(GameList);

export default Container;
