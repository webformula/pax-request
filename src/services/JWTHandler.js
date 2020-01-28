const jwtRegex = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

export default class JWTHandler {
  constructor({ baseUrl, authenticatePath = 'authenticate', deauthenticatePath = 'logout', refreshPath = 'token' }, adapter ) {
    this._adapter = adapter;
    this._config = { baseUrl, authenticatePath, deauthenticatePath, refreshPath };

    this.accessTokenHeaderName = 'Authorization';
    this.acessTokenHeaderPrefix = 'Bearer ';
    this.accessTokenStorageName = 'pax-jwt-access-token';
  }

  get baseUrl() {
    return this._config.baseUrl;
  }

  get authenticatePath() {
    return this._config.authenticatePath;
  }

  get deauthenticatePath() {
    return this._config.deauthenticatePath;
  }

  // access token
  _getRawAccessToken() {
    return this._accessToken || localStorage.getItem(this.accessTokenStorageName) || '';
  }

  setAccessToken(value) {
    this._accessToken = value;
    localStorage.setItem(this.accessTokenStorageName, value);
  }

  async getAccessToken() {
    const rawAccess = this._getRawAccessToken();
    if (!this.isValid(rawAccess) || this.isExpired(rawAccess)) await this.refreshAccessToken();
    return this._getRawAccessToken();
  }

  async getAccessTokenHeaderValue() {
    const token = await this.getAccessToken();
    return `${this.acessTokenHeaderPrefix}${token}`;
  }

  async refreshAccessToken() {
    const response = await this._adapter({
      baseUrl: this._config.baseUrl,
      url: this._config.refreshPath,
      method: 'POST',
      credentials: true,
      data: {
        grant_type: 'refresh_token'
      }
    });

    if (!typeof response.data === 'object' || !response.data.access_token || !this.isValid(response.data.access_token)) throw this.authError('401 unarthorized - invalid token', response);

    this.setAccessToken(response.data.access_token);
  }

  isValid(token) {
    return jwtRegex.test(token);
  }

  isExpired(token) {
    const parsed = this.decodeToken(token);
    // expired
    // jwt exp is in secconds
    if (parsed.exp && Math.floor((Date.now() / 1000)) > parsed.exp) return true;

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

  // Verify refresh token and get an access token. This is meant to be used to acknowledge the need to authorization
  async authorizeJWT() {
    try {
      await this.refreshAccessToken();
      return true;
    } catch (e) {
      return false;
    }
  }

  unAuthorize() {
    this.setAccessToken('');
  }

  authError(message, response) {
    const error = new Error(message);
    error.response = response;
    return error;
  }
}
