/*
  Typed data handling functions. Grouped together in a single class so we
  can sub stuff out for testing
*/
import { database } from 'firebase';
import { asList, asObject } from './firebase-emit';
import * as T from "./data-types";

export class DataClient {
  constructor(protected db: database.Database) {}

  getGame = asObject<{ gameId: string }, T.Game>(
    (p) => this.db.ref(`/games/${p.gameId}`)
  );

  DEFAULT_RECENT_GAMES_LIMIT = 10;
  getMostRecentGames = asList<T.GamesQ, T.Game>(
    (p) => this.db.ref(`/games`)
      .orderByChild("nLastUpdated")
      .limitToFirst(p.limit || this.DEFAULT_RECENT_GAMES_LIMIT)
  );

  DEFAULT_SCORES_LIMIT = 10;
  getTopScoresForGame = asList<T.ScoresQ, T.Score>(
    (p) => this.db.ref(`/scores/${p.gameId}`)
      .orderByChild("nValue")
      .limitToFirst(p.limit || this.DEFAULT_SCORES_LIMIT)
  );
}

export default DataClient;