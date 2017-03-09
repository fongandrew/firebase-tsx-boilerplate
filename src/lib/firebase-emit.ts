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

import * as _ from "lodash";
import { database } from "firebase";

/*
  Wrapper object around something we get from our database. Wrapper is
  necessary since it lets us distinguish between things like no response
  vs. empty response, and lets us store additional metadata with what
  we get back from the DB.
*/
export interface DataWrapper<T> {
  data: T;
  emittedOn: Date;
}

/*
  Base class for our change emitters below. A RefEmitter class is a wrapper
  around a Firebase ref we get from calling some function with a given set
  of props. By capturing the function and the props we used to call the
  function along with the resulting emitter, we can compare two emitter
  instances to see if they're functionally equivalent (and thereby avoid
  the overhead of re-binding to the underlying Firebase ref).

  Note that for simplicitly, a RefEmitter may have only a *single* callback
  function. The assumption is that RefEmitters are programatically
  (re-)generated when a React component receives props and are thus bound
  to just that Component.
*/
export class RefEmitter<P, T> {
  lastEmit?: DataWrapper<T>;
  ref: database.Query;
  cb?: (t: DataWrapper<T>) => void;

  constructor(public refFn: (p: P) => database.Query, public props: P) {
    this.ref = refFn(props);
  }

  sameAs(other: RefEmitter<any, any>) {
    return this.refFn === other.refFn &&
      _.isEqual(this.props, other.props);
  }

  onChange(cb: (t: DataWrapper<T>) => void, replace = false) {
    // Don't replace existing callback unless explicit -- this helps us
    // us avoid unnecessary rebinding.
    if (this.cb && !replace) return;

    this.subscribeToRef();
    this.cb = cb;

    // Bring new listeners up to date -- note null vs undefined distinction.
    // If this.lastEmit is null, that means emitChange was called.
    if (this.lastEmit) {
      cb(this.lastEmit);
    }
  }

  offChange() {
    this.cb = undefined;

    /*
      Stop listening to our Firebase ref is this emitter is off -- but do
      it asynchronusly, so that Firebase doesn't kill its cache right away
      in case we're re-subscribing in the same sequence.
    */
    window.requestAnimationFrame(() => {
      if (! this.cb) this.ref.off();
    });
  }

  subscribeToRef() {
    this.ref.off();
    this.ref.on("value",
      (snapshot) => this.emitChange(snapshot ? snapshot.val() : undefined)
    );
  };

  protected emitChange(t: T) {
    let wrapper: DataWrapper<T> = {
      data: t,
      emittedOn: new Date()
    };
    if (this.cb) {
      this.cb(wrapper);
    }
    this.lastEmit = wrapper;
  }
}

/*
  More complex event emitter for array / list-type refs or queries.
  To avoid excessive React re-renders, we wait until all of the initial data
  is loaded before emitting.
*/

// Use ListItem type rather than emit straight list to make keys visible.
export type ListItem<T> = [string, T]; // First item is key
export type ListWrapper<T> = DataWrapper<ListItem<T>[]>;
export type ListEmitterOpts = {
  reverse?: boolean; /* Emit list in reversed order (to get around Firebase
                       allowing "fetch last N results" but not allowing
                       descending sort). */
};

export class ListEmitter<P, T> extends RefEmitter<P, ListItem<T>[]> {
  protected ready: boolean;
  protected state: ListItem<T>[]; // Temp mutable state

  constructor(
    refFn: (p: P) => database.Query,
    props: P,
    public opts: ListEmitterOpts = {}
  ) {
    super(refFn, props);
  }

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
        let val = snapshot.val();
        val._key = snapshot.key;
        this.state.splice(index, 0, this.getListItem(snapshot));
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
          this.state[index] = this.getListItem(snapshot);
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
        this.state.splice(newIndex, 0, this.getListItem(snapshot));
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

  protected emitChange(t: ListItem<T>[]) {
    t = _.clone(t); // Clone list to avoid mutability issues
    t = this.opts.reverse ? t.reverse() : t;
    super.emitChange(t);
  }

  protected getListItem(snapshot: database.DataSnapshot): ListItem<T> {
    return [snapshot.key || "", snapshot.val()];
  }

  protected indexForKey(key: string|null) {
    if (key) {
      return _.findIndex(this.state, (s) => s[0] === key);
    }
    return -1;
  }
}

/*
  Helpers to let us create RefEmitter instances from functions rather
  than invoking constructors.
*/

export function asObject<P, T>(fn: (p: P) => database.Query) {
  return (p: P) => new RefEmitter<P, T>(fn, p);
}

export function asList<P, T>(
  fn: (p: P) => database.Query,
  opts: ListEmitterOpts = {}
) {
  return (p: P) => new ListEmitter<P, T>(fn, p, opts);
}
