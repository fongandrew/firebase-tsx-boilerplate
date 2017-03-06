/*
  Our high scores
*/

import * as _ from 'lodash';
import * as React from 'react';
import View from './View';
import { Deps } from "../types";
import * as T from "../lib/data-types";

interface Data {
  game: T.Game;
  scores: [string, T.Score][];
}

export class Scores extends View<Deps, Data> {
  getEmitters() {
    let { dataClient, match } = this.props;
    let { gameId } = match.params;
    return {
      game: dataClient.getGame({ gameId }),
      scores: dataClient.getTopScoresForGame({ gameId })
    }
  }

  render() {
    let { game, scores } = this.state;
    if (! game) {
      return <div>Loading &hellip;</div>;
    }

    return <div>
      <h1>{ game.data.name }</h1>

      { scores ? this.renderScores(scores) : <div>
        Loading &hellip;
      </div> }
    </div>;
  }

  renderScores(scores: T.ListWrapper<T.Score>) {
    return <div>
      { _.map(scores.data, ([id, score]) => <div key={id}>
        { score.username } | { score.nValue }
      </div>) }
    </div>;
  }
}

export default Scores;