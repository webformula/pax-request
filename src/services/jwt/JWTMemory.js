export default class JWTMemory {
  get token() {
    return this._token;
  }

  set token(value) {
    this._token = value;
  }
}
