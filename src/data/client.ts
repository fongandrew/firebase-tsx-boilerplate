/*
  Bring different parts of client together into one interface
*/

import { database } from "firebase";
import games from "./games";
import scores from "./scores";

class BaseClient {
  constructor(public db: database.Database) {}
}

export class DataClient extends games(scores(BaseClient)) {}

export default DataClient;