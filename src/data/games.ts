/*
  Typed data handling functions. Grouped together in a single class so we
  can sub stuff out for testing
*/

import { asList, asObject } from "../lib/firebase-emit";
import * as T from "./types";


/* Firebase path patterns */

export namespace Refs {
  export const games = () => `/games`;
  export const game = (p: T.GameQ) => `${games()}/${p.gameId}`;
}


/* Mixin to add API functions */

export const games = <C extends T.Client>(Cls: C) => class extends Cls {

  /*
    Return a single game
  */
  getGame = asObject<T.GameQ, T.Game>(
    (p) => this.db.ref(Refs.game(p))
  );

  /*
    Return [limit] most ecent games
  */
  DEFAULT_RECENT_GAMES_LIMIT = 10;
  getMostRecentGames = asList<T.MostRecentGamesQ, T.Game>(
    (p) => this.db.ref(Refs.games())
      .orderByChild("nLastUpdated")
      .limitToFirst(p.limit || this.DEFAULT_RECENT_GAMES_LIMIT)
  );

  /*
    Create a new game
  */
  addGame = (p: T.GameParams) => {
    let gameRef = this.db.ref(Refs.games()).push();
    let game: T.Game = {
      ...p,
      nLastUpdated: -Date.now()
    };
    gameRef.set(game);
  };
};

export default games;
