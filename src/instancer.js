import adapter from './adapters/adapter.js';
import JWTHandler from './services/JWTHandler.js';

class RequestInstance {
  constructor(config = {}) {
    this._config = config;
    if (this._config.jwt) this._config.jwtHandler = new JWTHandler(this._config.jwt, adapter);
  }

  createInstance(config) {
    return new RequestInstance(config || this._config);
  }

  set baseUrl(value) {
    this._config.baseUrl = value;
  }

  get url() {
    return this._config.url;
  }

  get method() {
    return this._config.method;
  }

  get data() {
    return this._config.data;
  }

  get headers() {
    return this._config.headers;
  }

  get urlParameters() {
    return this._config.urlParameters;
  }

  get responseType() {
    return this._config.responseType;
  }

  get timeout() {
    return this._config.timeout || 30;
  }

  // method functions return new instances of the
  get(url) {
    return this._instancer(url, 'GET');
  }

  post(url) {
    return this._instancer(url, 'POST');
  }

  delete(url) {
    return this._instancer(url, 'DELETE');
  }

  patch(url) {
    return this._instancer(url, 'PATCH');
  }

  put(url) {
    return this._instancer(url, 'PUT');
  }

  head(url) {
    return this._instancer(url, 'HEAD');
  }

  // used to authenticate user and provide a refresh token and access token
  authenticateJWT() {
    if (!this._config.jwtHandler) throw Error('JWT is not configured');
    const instance = this._instancer(this._config.jwtHandler.authenticatePath, 'POST');
    instance.baseUrl = this._config.jwtHandler.baseUrl;
    instance._config.credentials = true;
    instance._config.authentication = true;
    return instance;
  }

  // used to authenticate user and provide a refresh token and access token
  deauthenticateJWT() {
    if (!this._config.jwtHandler) throw Error('JWT is not configured');
    const instance = this._instancer(this._config.jwtHandler.deauthenticatePath, 'POST');
    instance.baseUrl = this._config.jwtHandler.baseUrl;
    instance._config.credentials = true;
    instance._config.authentication = true;
    return instance;
  }

  headers(params = {}) {
    this._config.headers = Object.assign({}, this._config.headers, params);
    return this;
  }

  urlParameters(params = {}) {
    this._config.urlParameters = Object.assign({}, this._config.urlParameters, params);
    return this;
  }

  data(value) {
    this._config.data = value;
    return this;
  }

  responseType(value) {
    this._config.responseType = value;
    return this;
  }

  timeout(value) {
    this._config.timeout = value;
    return this;
  }

  credentials(value = true) {
    this._config.credentials = value;
    return this;
  }

  async authorizeJWT() {
    if (!this._config.jwtHandler) throw Error('no jwt configured');
    return this._config.jwtHandler.authorizeJWT();
  }

  unAuthorizeJWT() {
    if (!this._config.jwtHandler) throw Error('no jwt configured');
    this._config.jwtHandler.unAuthorize();
  }

  send() {
    if (!this._config.method) throw Error('Must first call one of the method setters (get(), post(), ...) or create a new instance with a method');
    if (this._default) throw Error('cannot call send on the default instnace');
    if (this._send) throw Error('cannot re-send a request');
    this._send = true;
    return adapter(this._config);
  }


  // --- private ---

  _instancer(url, method) {
    const config = Object.assign({}, this._config, { url, method });
    return new RequestInstance(config);
  }
}

const defaultInstance = new RequestInstance();
defaultInstance._default = true;
export default defaultInstance;
export {
  defaultInstance as request
}
