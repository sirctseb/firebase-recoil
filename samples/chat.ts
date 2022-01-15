import { makeAtom, makeAtomFamily, PathParameters } from '../src/static';

type PushID = string;

type RoomID = string;

type UserID = string;

type NameString = string;

interface RoomInfo {
  name: NameString,
  creator: UserID,
  members: Member[],
}

interface RoomParams extends PathParameters {
  // client code is going to be supplying this. not really cool for the casing to be bad
  RoomId: string;
};

const Rooms = makeAtomFamily<RoomInfo, RoomParams>('/rooms/{RoomId}');

path /rooms is Map<RoomID, RoomInfo>;

path /posts/{roomid} {
  validate() { getRoomInfo(roomid) != null }
}

path /posts/{roomid}/{postid} is Timestamped<Post> {
  write() { isMember(getRoomInfo(roomid)) }
}


getRoomInfo(id) { prior(root).rooms[id] }

isMember(roomInfo) {
  roomInfo.members[currentUser()] != null && !roomInfo.members[currentUser()].isBanned
}

type Post {
  // Allow create (but not modify/delete).
  create() { true }

  from: UserID,
  message: MessageString,
}

type MessageString extends String {
  validate() { this.length > 0 && this.length <= 140 }
}

type Member {
  // Anyone can add themselves to a Room with their own nickname.
  create() { isUser(key()) }

  nickname: NameString,
  isBanned: Boolean,
}

type Timestamped<T> extends T {
  created: Created,
  // modified: Modified,
}

type Created extends Number {
  validate() { initial(this, now) }
}

type Modified extends Number {
  validate() { this == now }
}


isUser(uid) { auth != null && uid == currentUser() }
currentUser() { auth.uid }

initial(value, init) { value == (isInitial(value) ? init : prior(value)) }
isInitial(value) { prior(value) == null }