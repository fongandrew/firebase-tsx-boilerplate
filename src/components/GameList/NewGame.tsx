/*
  Form to enter a new score
*/
import * as React from 'react';
import { Deps } from "../../types";

interface Props {
  deps: Deps;
}

export class NewGame extends React.Component<Props, {}> {
  _name?: HTMLInputElement;

  render() {
    return <form onSubmit={this.onSubmit}>
      <div>
        <label htmlFor="newgame-name">Name</label>
        <input
          ref={(c) => this._name = c}
          id="newgame-name"
          type="text"
        />
      </div>
      <input type="submit" value="Submit" />
    </form>;
  }

  onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Refs may not set if render fails.
    if (!this._name) return;

    let name = this._name.value
    if (name) {
      this.props.deps.dataClient.addGame({ name });

      // Reset fields
      this._name.value = "";
    }
  }
}

export default NewGame;