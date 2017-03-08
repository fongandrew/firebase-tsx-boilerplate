/*
  List of games we're tracking scores for
*/

import * as _ from 'lodash';
import * as React from 'react';
import { Link } from 'react-router-dom';
import * as T from "../../data/types";
import { Deps } from "../../types";
import Loading from "../common/Loading";
import { view } from '../common/View';
import NewGame from "./NewGame";

interface Props {
  deps: Deps;
  games?: T.ListWrapper<T.Game>;
}

const GameList = ({ deps, games }: Props) => {
  if (! games) {
    return <Loading />;
  }

  return <div>
    { _.map(games.data, ([id, game]) => <div key={id}>
      <Link to={`/game/${id}`}>{ game.name }</Link>
    </div>) }
    <NewGame deps={deps} />
  </div>;
}

const Container = view({
  getEmitters: (d: Deps, p?: {}) => ({
    games: d.dataClient.getMostRecentGames({})
  })
})(GameList);

export default Container;
