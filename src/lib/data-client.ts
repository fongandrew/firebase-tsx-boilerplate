/*
  Typed data handling functions. Grouped together in a single class so we
  can sub stuff out for testing
*/
import { database } from 'firebase';
import { asList, asObject } from './firebase-emit';
import * as T from "./data-types";

// Firebase path patterns
namespace Refs {
  export const games = () => `/games`;

  interface GameId { gameId: string; }
  export const game = (p: GameId) => `${games()}/${p.gameId}`;

  export const scores = (p: GameId) => `/scores/${p.gameId}`;
}


export class DataClient {
  constructor(protected db: database.Database) {}


  /* Games */

  getGame = asObject<T.GameQ, T.Game>(
    (p) => this.db.ref(Refs.game(p))
  );

  DEFAULT_RECENT_GAMES_LIMIT = 10;
  getMostRecentGames = asList<T.MostRecentGamesQ, T.Game>(
    (p) => this.db.ref(Refs.games())
      .orderByChild("nLastUpdated")
      .limitToFirst(p.limit || this.DEFAULT_RECENT_GAMES_LIMIT)
  );

  addGame = (p: T.GameParams) => {
    let gameRef = this.db.ref(Refs.games()).push();
    let game: T.Game = {
      ...p,
      nLastUpdated: -Date.now()
    };
    gameRef.set(game);
  };


  /* Scores */

  DEFAULT_SCORES_LIMIT = 10;
  getTopScoresForGame = asList<T.ScoresQ, T.Score>(
    (p) => this.db.ref(Refs.scores(p))
      .orderByChild("nValue")
      .limitToFirst(p.limit || this.DEFAULT_SCORES_LIMIT)
  );

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

      let gameRef = this.db.ref(Refs.game(p));
      let update: Partial<T.Game> = {
        nLastUpdated: -Date.now()
      };
      gameRef.update(update);
    });
  }
}

export default DataClient;