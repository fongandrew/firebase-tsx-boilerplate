/*
  Data management / API helpers for Firebase subscriptions.

  Rather than bind to Firebase directly from within a React component, we work
  with functions that return change emitters instead. There are a handful of
  advantages to this:

  (1) This lets us stub things in and out more easily for unit testing.
  (2) We can insert specific optimizations due to listening to different
      callbacks (as we do with the ListEmitter) while still using the
      same interface.
  (3) We can create reusable typings on the data we expect from Firebase.

*/

import * as _ from 'lodash';
import { database } from 'firebase';
import { EventEmitter } from 'eventemitter3';

// Base class for our change emitters below
const CHANGE_EVENT = "CHANGE_EVENT";
export abstract class RefEmitter<T> extends EventEmitter {
  // Last emit is undefined or a two-tuple (T can be undefined too)
  lastEmit?: [true, T];

  // These are for generator functions below
  generator?: Function;
  props?: any;

  constructor(public ref: database.Query) {
    super();
  }

  // Used by view to check if emitters are equivalent -- saves us hassle
  // of binding / unbinding umnecessarily
  isEqual(emitter: RefEmitter<any>) {
    return this.generator === emitter.generator &&
      _.isEqual(this.props, emitter.props);
  }

  abstract subscribeToRef(): void;

  // Start ref listeners as soon as this emitter gets a change listener
  onChange(cb: (t: T) => void) {
    if (this.listeners.length === 1) {
      this.subscribeToRef();
    }

    this.addListener(CHANGE_EVENT, cb);

    // Bring new listeners up to date -- note null vs undefined distinction.
    // If this.lastEmit is null, that means emitChange was called.
    if (this.lastEmit) {
      cb(this.lastEmit[1]);
    }
  }

  offChange(cb?: (t: T|null) => void) {
    if (cb) {
      this.removeListener(CHANGE_EVENT, cb);
    } else {
      this.removeAllListeners(CHANGE_EVENT);
    }

    /*
      Stop listening to our Firebase ref is this emitter is off -- but do
      it asynchronusly, so that Firebase doesn't kill its cache right away
      in case we're re-subscribing to the same ref
    */
    if (! this.listeners.length) {
      window.requestAnimationFrame(() => this.ref.off());
    }
  }

  protected emitChange(t: T) {
    this.emit(CHANGE_EVENT, t);
    this.lastEmit = [true, t];
  }
}

/*
  Simple typable event emitter class we can wrap around a Firebase ref
*/
export class ObjectEmitter<T> extends RefEmitter<T> {
  subscribeToRef() {
    this.ref.off();
    this.ref.on("value",
      (snapshot) => this.emitChange(snapshot ? snapshot.val() : null)
    );
  }
}

/*
  More complex event emitter for array / list-type refs or queries.
  To avoid excessive React re-renders, we wait until all of the initial data
  is loaded before emitting.
*/

// Use ListItem type rather than emit straight list to make keys visible.
interface ListItem<T> { key: string, value: T };

export class ListEmitter<T> extends RefEmitter<ListItem<T>[]> {
  protected ready: boolean;
  protected state: ListItem<T>[]; // Temp mutable state

  subscribeToRef() {
    // Reset when (re-)subscribing
    this.ref.off();
    this.ready = false;
    this.state = [];

    /*
      Set up child event listeners to update list state.
      Don't emit until ready (which happens the first time value event is
      called)
    */

    this.ref.on("child_added", (snapshot, prevKey) => {
      if (snapshot) {
        let index = _.isString(prevKey) ? this.indexForKey(prevKey) + 1 : 0;
        this.state.splice(index, 0, {
          key: snapshot.key || "",
          value: snapshot.val()
        });
      }
      if (this.ready) this.emitChange(this.state);
    });

    this.ref.on("child_removed", (snapshot) => {
      if (snapshot) {
        let index = this.indexForKey(snapshot.key);
        if (index >= 0) {
          this.state.splice(index, 1);
        }
      }
      if (this.ready) this.emitChange(this.state);
    });

    this.ref.on("child_changed", (snapshot) => {
      if (snapshot) {
        let index = this.indexForKey(snapshot.key);
        if (index >= 0) {
          this.state[index].value = snapshot.val();
        }
      }
      if (this.ready) this.emitChange(this.state);
    });

    this.ref.on("child_moved", (snapshot, prevKey) => {
      if (snapshot) {
        // Find and remove old child
        let index = this.indexForKey(snapshot.key);
        if (index >= 0) {
          this.state.splice(index, 1);
        }

        // Reinsert new child at prevKey index
        let newIndex = _.isString(prevKey) ? this.indexForKey(prevKey) + 1 : 0;
        this.state.splice(newIndex, 0, {
          key: snapshot.key || "",
          value: snapshot.val()
        });
      }
      if (this.ready) this.emitChange(this.state);
    });

    this.ref.once("value", (snapshot) => {
      if (! this.ready) {
        this.ready = true;
        this.emitChange(this.state);
      }
    });
  }

  protected indexForKey(key: string|null) {
    if (key) {
      return _.findIndex(this.state, (s) => s.key === key)
    }
    return -1;
  }
}

/*
  Transform function that generates Firebase ref into one that generates
  one of the emitter classes above. Also adds on a name that we can use
  to tell if two emitters are essentially equivalent (so we don't incur
  overhead from unnecessary unbinding / rebinding when props change)
*/
export function asObject<P, T>(fn: (p: P) => database.Query) {
  return function(props: P) {
    let ret = new ObjectEmitter<T>(fn(props));
    ret.generator = fn;
    ret.props = props;
    return ret;
  }
}

export function asList<P, T>(fn: (p: P) => database.Query) {
  return function(props: P) {
    let ret = new ListEmitter<T>(fn(props));
    ret.generator = fn;
    ret.props = props;
    return ret;
  }
}
