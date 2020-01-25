/* TODO
    handle params
    handle form data?
    handle xsrf?
    handle stremas
    handle basic auth
    handle withCredentials
    handle cacelation
*/

import {
  buildUrl,
  parseRawHeaders,
  defaultStatisValidator,
  createError
} from './utils.js';

export default function ({ baseUrl, url, headers = {}, data = null, method = 'GET', timeout = 30, responseType = 'text', validateStatus = defaultStatisValidator } = {}) {
  const config = arguments[0];
  let request = new XMLHttpRequest();
  request.open(method.toUpperCase(), buildUrl(baseUrl, url, true));
  request.timeout = timeout;
  request.responseType = responseType

  // headers
  Object.entries(headers).forEach(([key, value]) => {
    if (!data && key.toLowerCase() === 'content-type') headers[key] = undefined;
    request.setRequestHeader(key, value);
  });

  if (config.responseType) {
    try {
      request.responseType = config.responseType;
    } catch (e) {
      // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
      // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
      if (config.responseType !== 'json') {
        throw e;
      }
    }
  }

  return new Promise((resolve, reject) => {
    request.onreadystatechange = () => {
      /*
        0	UNSENT	Client has been created. open() not called yet.
        1	OPENED	open() has been called.
        2	HEADERS_RECEIVED	send() has been called, and headers and status are available.
        3	LOADING	Downloading; responseText holds partial data.
        4	DONE	The operation is complete.
      */
      if (!request || request.readyState !== 4) return;

      // The request errored out and we didn't get a response, this will be handled by onerror instead
      // exception: request that using file: protocol, most browsers will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && !request.responseURL.contains('file:'))) return;

      const responseHeaders = parseRawHeaders(request.getAllResponseHeaders());
      const responseData = responseType === 'text' ? request.responseText : request.response;
      const response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      if (validateStatus(request.status)) resolve(response);
      else reject(createError(`Request failed with status code ${response.status}`, {
        config,
        request,
        response
      }));

      request = undefined;
    };

    request.onabort = () => {
      if (!request) return;

      reject(createError('Request aborted', {
        config,
        request,
        code: 'ECONNABORTED'
      }));

      request = undefined;
    };

    request.onerror = () => {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', {
        config,
        request
      }));

      request = undefined;
    };

    request.ontimeout = () => {
      reject(createError(`timeout of ${timeout} seconds exceeded`, {
        config,
        code: 'ECONNABORTED',
        request
      }));

      request = undefined;
    };

    request.send(data);
  });
}
