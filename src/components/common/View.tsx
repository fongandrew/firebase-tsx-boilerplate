/*
  Abstract component to hook up to Firebase emitters in firebase-emit.ts
  and parse
*/
import * as React from 'react';
import { Deps } from '../../types';
import { RefEmitter, DataWrapper } from '../../lib/firebase-emit';

type State<S> = {
  [T in keyof S]?: DataWrapper<S[T]>;
}

type EmitterMap<S> = {
  [T in keyof S]: RefEmitter<any, S[T]>;
}

export abstract class View<P, S> extends React.Component<Deps, State<S>> {
  protected params?: P;
  protected emitters?: EmitterMap<S>;

  constructor(props: Deps) {
    super(props);
    this.state = {};
    this.params = this.cleanParams(props);
    this.emitters = this.getEmitters(props, this.params);
  }

  /*
    Override to validate and transform params -- may return undefined if params
    are invalid (up to render function how to handle). Handle in render
    function by either displaying error or returning a React Router
    <Redirect />.
  */
  cleanParams(props: Deps): P|undefined { return; }

  // Override to return a map of what firebase paths to subscribe to
  getEmitters (props: Deps, params?: P): EmitterMap<S>|undefined { return; }

  componentDidMount() {
    this.bindAll();
  }

  componentWillReceiveProps(newProps: Deps) {
    let newParams = this.cleanParams &&
      this.cleanParams(newProps);
    let newEmitters = this.getEmitters &&
      this.getEmitters(newProps, newParams);

    // No emitters -> unbind all
    if (! newEmitters) {
      this.unbindAll();
      this.emitters = undefined;
    }

    // Assign
    else if (! this.emitters) {
      this.emitters = newEmitters;
    }

    else {
      for (let key in newEmitters) {
        let oldEmitter = this.emitters[key];
        let newEmitter = newEmitters[key];
        if (oldEmitter) {
          // Don't replace if same
          if (oldEmitter.sameAs(newEmitter)) {
            continue;
          }

          // Unbind old emitter if we're replacing
          oldEmitter.offChange();
        }
        this.emitters[key] = newEmitter;
      }
    }

    this.bindAll();
    this.params = newParams;
  }

  // Unsubscribe on unmount
  componentWillUnmount() {
    this.unbindAll();
  }

  bindAll() {
    if (this.emitters) {
      for (let key in this.emitters) {
        let emitter = this.emitters[key];

        // Typing as any to get around setState typing issues
        emitter.onChange((t) => this.setState({ [key]: t } as any))
      }
    }
  }

  unbindAll() {
    if (this.emitters) {
      for (let key in this.emitters) {
        let emitter = this.emitters[key];
        emitter.offChange();
      }
    }
  }

  // Render state as extra props
  abstract render(): JSX.Element|null;
}


/*
  Decorator / HOC as alternative to abstract class above.
  Deps and params get their own prop. Each emitter arg is bound
  to a given prop as well.
*/

type ComponentType<P> = React.ComponentClass<P>|React.StatelessComponent<P>;

interface SubProps<P> {
  params?: P;
  deps: Deps;
}

export function view<P, S>({ cleanParams, getEmitters } : {
  cleanParams?: (p: Deps) => P,
  getEmitters?: (p: Deps, params?: P) => {
    [T in keyof S]: RefEmitter<any, S[T]>
  }
}) {
  return function(Component: ComponentType<SubProps<P> & State<S>>) {
    class Container extends View<P, S> {
      cleanParams(p: Deps) {
        return cleanParams ? cleanParams(p) : super.cleanParams(p);
      }

      getEmitters(p: Deps, params?: P) {
        return getEmitters ?
          getEmitters(p, params) :
          super.getEmitters(p, params);
      }

      render() {
        return <Component
          params={this.params}
          deps={this.props}
          {...this.state}
        />;
      }
    }
    return Container;
  }
}

export default View;
