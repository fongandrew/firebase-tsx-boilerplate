/*
  Abstract component, HOC to hook up view to Firebase emitters in
  firebase-emit.ts
*/
import * as React from 'react';
import { RefEmitter, DataWrapper } from '../../lib/firebase-emit';

type State<S> = {
  [T in keyof S]?: DataWrapper<S[T]>;
}

export abstract class View<P, S> extends React.Component<P, State<S>> {
  _emitters: {
    [T in keyof S]: RefEmitter<any, S[T]>;
  };

  constructor(props: P) {
    super(props);
    this.state = {};
    this._emitters = this.getEmitters(props);
  }

  abstract getEmitters(p: P): {[T in keyof S]: RefEmitter<any, S[T]>};

  componentDidMount() {
    for (let key in this._emitters) {
      let emitter = this._emitters[key];

      // Typing as any to get around setState typing issues
      emitter.onChange((t) => this.setState({ [key]: t } as any))
    }
  }

  componentWillReceiveProps(newProps: P) {
    let newEmitters = this.getEmitters(newProps);
    for (let key in newEmitters) {
      let oldEmitter = this._emitters[key];
      let newEmitter = newEmitters[key];
      if (oldEmitter) {
        // Don't rebind if same
        if (oldEmitter.sameAs(newEmitter)) {
          continue;
        }

        // Unbind old emitter otherwise
        oldEmitter.offChange();
      }

      // Typing as any to get around setState typing issues
      newEmitter.onChange((t) => this.setState({ [key]: t } as any));
      this._emitters[key] = newEmitter;
    }
  }

  // Unsubscribe on unmount
  componentWillUnmount() {
    for (let key in this._emitters) {
      let emitter = this._emitters[key];
      emitter.offChange();
    }
  }

  // Render state as extra props
  abstract render(): JSX.Element|null;
}


/*
  Decorator / HOC as alternative to abstract class above.
*/

type ComponentType<P> = React.ComponentClass<P>|React.StatelessComponent<P>;

export function view<P, S>(
  getEmitters: (p: P) => {[T in keyof S]: RefEmitter<any, S[T]>}
) {
  return function(Component: ComponentType<{ viewProps: P } & State<S>>) {
    class Container extends View<P, S> {
      getEmitters(props: P) {
        return getEmitters(props);
      }

      render() {
        return <Component viewProps={this.props} {...this.state} />;
      }
    }
    return Container;
  }
}

export default View;
