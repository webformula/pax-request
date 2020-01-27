const jwtRegex = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

export default class JWTHandler {
  constructor({ jwtConfig = {}, baseUrl, adapter }) {
    if (jwtConfig === true) jwtConfig = {};

    this._baseUrl = baseUrl;
    this._adapter = adapter;

    this._refreshBaseUrl = jwtConfig.refreshBaseUrl || baseUrl;
    this._refreshUrl = jwtConfig.refreshUrl || 'token';
    this._accessTokenHeaderName = jwtConfig.acessTokenHeaderName || 'Authorization';
    this._acessTokenHeaderPrefix = jwtConfig.acessTokenHeaderPrefix || 'Bearer ';
    this._accessTokenStorageName = jwtConfig.accessTokenStorageName || 'pax-jwt-access-token';
    this._refreshTokenStorageName = jwtConfig.refreshTokenStorageName || 'pax-jwt-refresh-token';
  }


  get accessTokenHeaderName() {
    return this._accessTokenHeaderName;
  }

  get accessTokenStorageName() {
    return this._accessTokenStorageName;
  }

  get refreshTokenStorageName() {
    return this._refreshTokenStorageName;
  }


  // refresh token
  _getRawRefreshToken() {
    return localStorage.getItem(this.refreshTokenStorageName) || '';
  }

  setRefreshToken(value) {
    return localStorage.setItem(this.refreshTokenStorageName, value);
  }

  // access token
  _getRawAccessToken() {
    return this._accessToken || localStorage.getItem(this.accessTokenStorageName) || '';
  }

  async getAccessToken() {
    if (this.isExpired(this._getRawAccessToken())) await this.refreshAccessToken();
    return this._getRawAccessToken();
  }

  setAccessToken(value) {
    this._accessToken = value;
    localStorage.setItem(this.accessTokenStorageName, value);
  }

  async getAccessTokenHeaderValue() {
    const token = await this.getAccessToken();
    return `${this._acessTokenHeaderPrefix}${token}`;
  }


  async refreshAccessToken() {
    const response = await this._adapter({
      baseUrl: this._refreshBaseUrl,
      url: this._refreshUrl,
      method: 'POST',
      headers: {
        [this._accessTokenHeaderName]: `Bearer ${this._getRawAccessToken()}`
      },
      data: {
        grant_type: 'refresh_token',
        refresh_token: this._getRawRefreshToken()
      }
    });

    if (!typeof response.data === 'object' || !response.data.access_token || !this.isValid(response.data.access_token)) throw this.authError('401 unarthorized - invalid token');

    this.setAccessToken(response.data.access_token);
  }


  isValid(token) {
    return jwtRegex.test(token);
  }

  isExpired(token) {
    const parsed = this.decodeToken(token);

    // no experation
    if (!parsed.exp) return true;

    // expired
    if (Date.now() > parsed.exp) return true;

    return false;
  }

  decodeToken(token) {
    if (!token) return {};

    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  authError(message) {
    const error = new Error(message);
    error.status = '401';
    error.response = { status: 401 };
    return error;
  }

  unauth() {
    this.setAccessToken('');
    this.setRefreshToken('');
  }
}
