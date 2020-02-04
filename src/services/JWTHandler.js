import JWTMemory from './jwt/JWTMemory.js';
import JWTCookie from './jwt/JWTCookie.js';
import JWTLocalStorage from './jwt/JWTLocalStorage.js';


export const defaultStorage = {
  access: 'memory',
  refresh: 'cookie'
};

export const sendDefault = {
  access: {
    transferType: 'header',
    parameterName: 'Authorization',
    prefix: 'Bearer '
  },

  refresh: {
    transferType: 'cookie',
    parameterName: 'refresh_token'
  }
};

export const recieveDefault = {
  access: {
    transferType: 'body',
    parameterName: 'access_token'
  },

  refresh: {
    transferType: 'cookie',
    parameterName: 'refresh_token'
  }
};

export const jwtDefaultConfig = {
  enabled: false,
  baseUrl: undefined,
  authenticatePath: 'authenticate',
  deauthenticatePath: 'logout',
  refreshPath: 'token',
  strategy: 'refresh',
  storage: defaultStorage,
  send: sendDefault,
  recieve: recieveDefault
};


export default class JWTHandler {
  static get strategyTypes() {
    return ['refresh', 'acessOnly'];
  }

  static get storageTypes() {
    return ['cookie', 'localStorage', 'memory'];
  }

  static get transferTypes() {
    return ['cookie', 'header', 'body'];
  }

  constructor(adapter, { baseUrl, authenticatePath = 'authenticate', deauthenticatePath = 'logout', refreshPath = 'token', strategy = 'refresh', storage = defaultStorage, send = sendDefault, recieve = recieveDefault }) {
    this._adapter = adapter;
    this.baseUrl = baseUrl;
    this.authenticatePath = authenticatePath;
    this.deauthenticatePath = deauthenticatePath;
    this.refreshPath = refreshPath;
    this.strategy = strategy;
    this.recieveConfig = recieve;
    this.sendConfig = send;
    this.jwtRegex = /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/;

    switch(storage.access) {
      case 'memory':
        this.accessTokenHandler = new JWTMemory();
        break;
      case 'localStorage':
        this.accessTokenHandler = new JWTLocalStorage();
        break;
      case 'cookie':
        this.accessTokenHandler = new JWTCookie();
        break;
    }

    switch(storage.refresh) {
      case 'memory':
        this.refreshTokenHandler = new JWTMemory();
        break;
      case 'localStorage':
        this.refreshTokenHandler = new JWTLocalStorage();
        break;
      default:
        this.refreshTokenHandler = new JWTCookie();
        break;
    }
  }

  async getAccessTokenForRequest() {
    await this.authorize();

    let data;
    let headers = {};

    switch (this.sendConfig.access.transferType) {
      case 'header':
        headers[this.sendConfig.access.parameterName] = `${this.sendConfig.access.prefix || ''}${this.accessTokenHandler.token}`;
        break;
      case 'body':
        data = {};
        data[this.sendConfig.access.parameterName] = `${this.sendConfig.access.prefix || ''}${this.accessTokenHandler.token}`;
        break;
    }

    return { data, headers };
  }

  async authorize() {
    if (this.recieveConfig.access.transferType === 'cookie') {
      // check if cookie is httpOnly and then look for expiresIn data and check that
      // TODO configure expiresInCheck
      return;
    }

    if (this.isValid(this.accessTokenHandler.token)) return;
    if (this.strategy !== 'refresh') throw this.Error('401 Unauthorized', { status: 401 });
    await this.refresh();
  }

  authenticateFromResponse(response) {
    this.setRefreshFromResponse(response);
    this.setAcessFromResponse(response);
  }

  deauthenticate() {
    this.accessTokenHandler.token = '';
    this.refreshTokenHandler.token = '';
  }

  async refresh() {
    let data;
    let headers = {};

    switch (this.sendConfig.refresh.transferType) {
      case 'header':
        headers[this.sendConfig.refresh.parameterName] = this.refreshTokenHandler.token;
        break;
      case 'body':
        data = {};
        data[this.sendConfig.refresh.parameterName] = this.refreshTokenHandler.token;
        break;
    }

    const response = await this._adapter({
      baseUrl: this.baseUrl,
      url: this.refreshPath,
      method: 'POST',
      credentials: this.recieveConfig.access.transferType === 'cookie',
      data,
      headers
    });

    this.setAcessFromResponse(response);
  }

  setRefreshFromResponse(response) {
    switch (this.recieveConfig.refresh.transferType) {
      case 'header':
        this.refreshTokenHandler.token = response.headers[this.recieveConfig.refresh.parameterName];
        break;
      case 'body':
        this.refreshTokenHandler.token = response.data[this.recieveConfig.refresh.parameterName];
        break;
    }
  }

  setAcessFromResponse(response) {
    switch (this.recieveConfig.access.transferType) {
      case 'header':
        this.accessTokenHandler.token = response.headers[this.recieveConfig.access.parameterName];
        break;
      case 'body':
        this.accessTokenHandler.token = response.data[this.recieveConfig.access.parameterName];
        break;
    }
  }

  isValid(token) {
    if (!this.jwtRegex.test(token)) return false;
    const parsed = this.decodeToken(token);
    // expired
    // jwt exp is in secconds
    if (parsed.exp && Math.floor((Date.now() / 1000)) > parsed.exp) return false;
    return true;
  }

  decodeToken(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  Error(message, response) {
    const error = new Error(message);
    error.response = response;
    return error;
  }
}
