import { atom, AtomEffect, atomFamily } from 'recoil';
import firebase from 'firebase';
import { interpolatePathSpec, PathParameters } from './interpolatePathSpec';

export type FirebaseValue = boolean | string | number | Object;
export type { PathParameters };

function fbValueSubscriptionEffect<T extends FirebaseValue>(path: string, database: firebase.database.Database): AtomEffect<T> {
  return ({ setSelf }) => {
    const handler = (snapshot: firebase.database.DataSnapshot | null) => {
      const value = snapshot?.val();
      setSelf(value);
    }
    // we can't use the value returned by .on because they have it typed differently than the param to .off
    // we may want to DI the firebase reference here
    database.ref(path).on("value", handler);
    return () => {
      database.ref(path).off("value", handler);
    }
  };
}

export function makeAtom<T extends FirebaseValue>(path: string, database: firebase.database.Database = firebase.database()) {
  return atom<T>({
    key: `firebase-recoil:${path}`,
    effects_UNSTABLE: [
      fbValueSubscriptionEffect<T>(path, database),
    ],
    // TODO find out whether this or initializing in effect is better
    default: firebase.database().ref(path).once('value').then(snapshot => snapshot.val())
  })
}

export function makeAtomFamily<T extends FirebaseValue, P extends PathParameters>(pathSpec: string, database: firebase.database.Database = firebase.database()) {
  return atomFamily<T, P>({
    key: `firebase-recoil:${pathSpec}`,
    effects_UNSTABLE: params => [
      // TODO what would happen if we threw an exception here?
      fbValueSubscriptionEffect<T>(interpolatePathSpec(pathSpec, params), database),
    ],
    // TODO find out whether this or initializing in effect is better
    default: async params => {
      return await firebase.database().ref(interpolatePathSpec(pathSpec, params)).once('value').then(snapshot => snapshot.val())
    }
  })
}

// can we get these things to work off a pre-poulated cache for ssr?
// maybe default or effect can read from a global cache

function coerceToObject<T>(value: Record<string, T> | T[]): Record<string, T> {
  if(Array.isArray(value)) {
    const result: Record<string, T> = {};
    value.forEach((entry, index) => {
      if (!!entry) {
        result[index] = entry;
      }
    })
    return result;
  }
  return value;
}

// oh wait we don't think we have to ever coerce these
interface Sample {
  x: string;
}

const y: Sample;

coerceToObject(y);

// so theoretically that's enough and clients can call that on whatever they want
// except 

