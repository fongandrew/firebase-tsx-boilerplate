/*
  Types for our data-client classes / mixins
*/

import { database } from "firebase";
export type Client = new (...args: any[]) => object & {
  db: database.Database;
};


/*
  Types for things in our database. Although we try to separate actual
  functional code into different files for ease of understanding, we keep
  most of our types in this file to help with avoiding duplication,
  facilitating autocompletion, and for convenience (it's a lot easier to
  import from a single types file than to try to guess).
*/

// Re-export wrapper types for convenience
import * as fbEmit from "../lib/firebase-emit";
export type DataWrapper<T> = fbEmit.DataWrapper<T>;
export type ListWrapper<T> = fbEmit.ListWrapper<T>;
export type ListItem<T> = fbEmit.ListItem<T>;


/* Helper Types */

export type Timestamp = number;


/* Games */

export interface GameQ {
  gameId: string;
}

export interface MostRecentGamesQ {
  limit?: number;
}

export interface Game {
  name: string;
  lastUpdated: Timestamp;
}

export interface GameParams {
  name: string;
}


/* Scores */

export interface ScoresQ {
  gameId: string;
  limit?: number;
}

export interface Score {
  username: string;
  value: number;
  createdOn: Timestamp;
}

export interface ScoreParams {
  gameId: string;
  username: string;
  value: number;
}
