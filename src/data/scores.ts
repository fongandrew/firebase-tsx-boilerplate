/*
  Typed data handling functions. Grouped together in a single class so we
  can sub stuff out for testing
*/

import { asList } from "../lib/firebase-emit";
import * as Games from "./games";
import * as T from "./types";


/* Firebase path patterns */

export namespace Refs {
  export const scores = (p: T.GameQ) => `/scores/${p.gameId}`;
}


/* Mixin to add API functions */

export const scores = <C extends T.Client>(Cls: C) => class extends Cls {

  /*
    List scores a specific game
  */
  DEFAULT_SCORES_LIMIT = 10;
  getTopScoresForGame = asList<T.ScoresQ, T.Score>(
    (p) => this.db.ref(Refs.scores(p))
      .orderByChild("nValue")
      .limitToFirst(p.limit || this.DEFAULT_SCORES_LIMIT)
  );

  /*
    Add score for a single game
  */
  addScore = (p: T.ScoreParams) => {
    let scoreListRef = this.db.ref(Refs.scores(p));
    return scoreListRef.transaction(() => {
      let scoreRef = scoreListRef.push();
      let score: T.Score = {
        username: p.username,
        nValue: -p.value,
        nCreatedOn: -Date.now()
      };
      scoreRef.set(score);

      let gameRef = this.db.ref(Games.Refs.game(p));
      let update: Partial<T.Game> = {
        nLastUpdated: -Date.now()
      };
      gameRef.update(update);
    });
  };
}

export default scores;
