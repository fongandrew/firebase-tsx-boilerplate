/*
  Our high scores
*/

import * as _ from 'lodash';
import * as React from 'react';
import * as T from "../../data/types";
import { Deps } from "../../types";
import Loading from "../common/Loading";
import NotFound from "../common/NotFound";
import View from "../common/View";
import NewScore from "./NewScore";

interface Data {
  game: T.Game;
  scores: [string, T.Score][];
}

export class Scores extends View<T.GameQ, Data> {
  cleanParams(deps: Deps) {
    let { gameId } = deps.match.params;
    if (gameId) return { gameId };
    return;
  }

  getEmitters({ dataClient } : Deps, params?: T.GameQ) {
    return params && {
      game: dataClient.getGame(params),
      scores: dataClient.getTopScoresForGame(params)
    };
  }

  render() {
    if (! this.params) {
      return <NotFound />;
    }

    let { game, scores } = this.state;
    if (! game) {
      return <Loading />;
    }

    if (! game.data) {
      return <NotFound />;
    }

    return <div>
      <h1>{ game.data.name }</h1>

      { scores ? this.renderScores(scores, this.params.gameId) : <Loading /> }
    </div>;
  }

  renderScores(scores: T.ListWrapper<T.Score>, gameId: string) {
    return <div>
      { _.map(scores.data, ([id, score]) => <div key={id}>
        { score.username } | { -score.nValue }
      </div>) }

      <NewScore gameId={gameId} deps={this.props} />
    </div>;
  }
}

export default Scores;