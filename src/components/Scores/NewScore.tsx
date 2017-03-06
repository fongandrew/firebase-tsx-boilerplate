/*
  Form to enter a new score
*/
import * as React from 'react';
import { Deps } from "../../types";

interface Props {
  gameId: string;
  deps: Deps;
}

export class NewScore extends React.Component<Props, {}> {
  _name?: HTMLInputElement;
  _score?: HTMLInputElement;

  render() {
    return <form onSubmit={this.onSubmit}>
      <div>
        <label htmlFor="newscore-name">Name</label>
        <input
          ref={(c) => this._name = c}
          id="newscore-name"
          type="text"
        />
      </div>
      <div>
        <label htmlFor="newscore-score">Score</label>
        <input
          ref={(c) => this._score = c}
          id="newscore-score"
          type="number"
        />
      </div>
      <input type="submit" value="Submit" />
    </form>;
  }

  onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Refs may not set if render fails.
    if (!this._name || !this._score) return;

    let username = this._name.value
    let value = parseInt(this._score.value);
    if (username && value) {
      this.props.deps.dataClient.addScore({
        gameId: this.props.gameId,
        username,
        value
      });

      // Reset fields
      this._name.value = "";
      this._score.value = "";
    }
  }
}

export default NewScore;