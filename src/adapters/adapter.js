import {
  normalizeHeaders,
  defaultStatisValidator,
  normalizeData
} from './utils.js'

let adapter;

export default async function ({ baseUrl, url, headers = {}, data = null, method = 'GET', urlParameters, timeout = 30, responseType = 'text', validateStatus = defaultStatisValidator, credentials = false, maxContentLength = -1, responseEncoding, jwtHandler, authentication = false }) {
  if (!adapter) adapter = await load();

  const config = { baseUrl, url, headers, data, method, urlParameters, timeout, responseType, validateStatus, credentials, maxContentLength, responseEncoding };
  transformRequest(config);

  // handle jwt
  if (jwtHandler && !authentication) config.headers[jwtHandler.accessTokenHeaderName] = await jwtHandler.getAccessTokenHeaderValue();

  const response = await adapter.default(config);
  transformResponse(response);
  
  if (jwtHandler && authentication) jwtHandler.setAccessToken(response.data.access_token);

  return response;
}

async function load() {
  // browser
  if (typeof XMLHttpRequest !== 'undefined') return await import('./xhr.js');

  // node
  if (typeof process !== 'undefined' && process.release.name === 'node') return await import('./node.js');
}


function transformRequest(config) {
  normalizeHeaders(config.headers);
  normalizeData(config);
}

function transformResponse(response) {
  if (typeof response.data === 'string') {
    try {
      response.data = JSON.parse(response.data);
    } catch (e) { }
  }
}
