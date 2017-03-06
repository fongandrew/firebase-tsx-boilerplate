import * as fbEmit from "./firebase-emit";

export type DataWrapper<T> = fbEmit.DataWrapper<T>;
export type ListWrapper<T> = fbEmit.ListWrapper<T>;
export type ListItem<T> = fbEmit.ListItem<T>;

export type Timestamp = number;

export interface GamesQ {
  limit?: number;
}

export interface Game {
  name: string;
  nLastUpdated: TimeStamp; // Negative, sort most recent
}

export interface ScoresQ {
  gameId: string;
  limit?: number;
}

export interface Score {
  username: string;
  nValue: number;         // Negative, sort highest
  nCreatedOn: TimeStamp;  // Negative, sort most recent
}
