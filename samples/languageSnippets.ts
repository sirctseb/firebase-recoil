import { makeAtom, makeAtomFamily, PathParameters } from '../src/static';
import { RecoilState, useRecoilValue } from 'recoil';

// other notes
// bolt type => ts interface

// Map Types
interface User {};
interface Product {};

interface Model {
  users: Map<String, User>,
  products: Map<ProductID, Product>
}

interface ProductID extends String {}
// or
// type ProductID = String;

// Generic Types

interface Pair<X, Y> {
  first: X,
  second: Y,
}

interface Model {
  name: String,
  prop: Pair<Number, String>;
}

// Paths
interface PathExampleType {}
const PathExampleType = makeAtom<PathExampleType>('/path/to/data');

// What do we get out of this?
enum FirebaseAtomKeys {
  // TODO can you declare the same path more than once?
  ExamplePathEntity = '/path/to/data',
}

// const firebaseAtoms = Record<FirebaseAtomKeys, RecoilState<
interface FirebaseAtoms {
  // oh blork we either can't type the values if the keys are not statically known,
  // or we have to statically know (and therefore name) the keys
  [FirebaseAtomKeys.ExamplePathEntity]: RecoilState<PathExampleType>;
}

const firebaseAtoms = {
  [FirebaseAtomKeys.ExamplePathEntity]: makeAtom<PathExampleType>(FirebaseAtomKeys.ExamplePathEntity),
}

// Database references
interface Product {
  id: string;
  name: string;
}

interface ProductEntityParams extends PathParameters {
  // TODO if the path was written with the parameter, we would have an explicit name for it.
  // with array notation, do we allow inference of path parameter name?
  // the other problem with array notation is the path spec doesn't mark a spot for the value
  // though i guess it's necessarily just tacked on to the end
  productId: string;
}
const ProductEntity = makeAtomFamily<Product, ProductEntityParams>('/products')

// caller
const y = useRecoilValue(ProductEntity({ productId: '123' }))
// TODO support fully specified path?
// no reason we couldn't
// const x = useRecoilValue(ProductEntity('/products/123'));
