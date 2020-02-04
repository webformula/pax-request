import {
  normalizeHeaders,
  defaultStatisValidator,
  normalizeData
} from './utils.js'

let adapter;

export default async function ({ baseUrl, url, headers = {}, data = null, method = 'GET', urlParameters, timeout = 30, responseType = 'text', validateStatus = defaultStatisValidator, credentials = false, maxContentLength = -1, responseEncoding, jwtHandler, authentication = false }) {
  if (!adapter) adapter = await load();

  const config = { baseUrl, url, headers, data, method, urlParameters, timeout, responseType, validateStatus, credentials, maxContentLength, responseEncoding };

  // prep auth
  await addAuthToRequest(jwtHandler, authentication, config);

  // prepare request
  transformRequest(config);

  let response;
  try {
    response = await adapter.default(config);
  } catch (e) {
    if (!jwtHandler || !e.response || e.response.status != 401) throw e;

    // attemp to refresh on 401
    await jwtHandler.refresh();
    await addAuthToRequest(jwtHandler, authentication, config);
    response = await adapter.default(config);
  }

  // prepare response
  transformResponse(response);

  // set jwt tokens from authentication request
  if (jwtHandler && authentication) jwtHandler.authenticateFromResponse(response);

  return response;
}

async function load() {
  // browser fetch
  // if (typeof fetch !== 'undefined') return await import('./fetch.js');

  // browser xhr
  if (typeof XMLHttpRequest !== 'undefined') return await import('./xhr.js');

  // node
  if (typeof process !== 'undefined' &&  process.release.name === 'node') return await import('./node.js');
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

// add jwt to request
async function addAuthToRequest(jwtHandler, authentication, config) {
  if (!jwtHandler || authentication) return;

  const authRequestConfig = await jwtHandler.getAccessTokenForRequest();
  config.headers = Object.assign(config.headers || {}, authRequestConfig.headers);
  if (authRequestConfig.data) config.data = Object.assign(config.data || {}, authRequestConfig.data);
}
