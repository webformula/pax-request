let counter = 0;

export default class JWTLocalStorage {
  constructor({ tokenStorageName } = {}) {
    this.tokenStorageName = tokenStorageName || `jwt_token_${counter++}`;
  }

  get tokenStorageName() {
    return this._tokenStorageName;
  }

  set tokenStorageName(value) {
    this._tokenStorageName = value;
  }

  get token() {
    return this._token || localStorage.getItem(this.tokenStorageName) || '';
  }

  set token(value) {
    localStorage.setItem(this.tokenStorageName, value);
    this._token = value;
  }
}
