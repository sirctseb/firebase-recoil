Values are never stored as arrays in Firebase, but when it returns the data from `.val()` or the REST api, it will translate the value into an array if it [looks enough like an array](https://firebase.googleblog.com/2014/04/best-practices-arrays-in-firebase.html)

The types rendered here do not account for this. We always generate `Record<string, ValueType>` when in reality, `Record<string, ValueType> | ValueType[]` is more accurate.

It may be that validations exist that would prevent this from ever happening (e.g. preventing digit characters in the key value), but there's no way for this library to detect that.

This tool has no responsibility for handling the data itself. the most not incorrect thing to do is to always return the union with the array type.

Clients can use a trivial type guard to handle the two cases with statically known types.

It may be that a client or library wants to proactively coerce arrays to maps and not have to deal with handling both cases. In this case, the union type will not be incorrect, but client code wouldn't know that the value is not an array.

How can we support client who provide their own means of ensuring non-array values with types that reflect that?

## Use-case: always coerce to records
A library with a layer that coerces any value retrieved from firebase to an object
### Support
cli / library flag to use the `Record` type only instead of a union with the array

## Use-case: selectively coerce to records
A library where data retrieved from firebase may or may not be coerced to an object

```ts
type GeneratedTypeAtPath = Record<string, ValueType> | ValueType[];
// what if it was an interface?
interface GeneratedTypeAtPath {
  // is this guaranteed to be an object? can we specify integer keys here?
  0: string;
  1: number;
  // are those legal bolt syntax?
}

// would we also coerce fields?
// rules.bolt
type GeneratedTypeAtPath {
  mapGenericField: Map<String, String>;
  arrayNotationField: String[];
  // (these are equivalent)
}

interface GeneratedTypeAtPath {
  mapGenericField: Record<string, string> | string[];
  arrayNotationField: Record<string, string> | string[];
}

// so whether we remove the array value type depends on the behavior of the cercing library
// so do we provide both the coercion utility(ies) along with associated type utilities?

function coerceToObjctAtTopLevel<T>(value: Record<string, T> | T[]) {

}

firebase.database().ref('/path').once('data').then(snapshot => snapshot.val()).then(coerceToObject).then(
  (data: GeneratedTypeAtPath) => {
     // data is known to be an object
  }
);
```
