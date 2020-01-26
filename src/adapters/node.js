/* TODO
    handle params
    handle stremas
    handle auth
    handle cacelation
    handle proxy
*/

import { version } from '../../package.json';
import * as http from 'http';
import * as https from 'https';
import * as urlNode from 'url';
import * as zlib from 'zlib';
import {
  buildUrl,
  parseRawHeaders,
  defaultStatisValidator,
  createError
} from './utils.js';

const httpsRegex = /https:?/;

export default function ({ baseUrl, url, headers = {}, data = null, method = 'GET', timeout = 30, responseType = 'text', validateStatus = defaultStatisValidator, maxContentLength = -1, responseEncoding } = {}) {
  const config = arguments[0];

  // url
  const fullPath = buildUrl(baseUrl, url);
  const parsed = urlNode.parse(fullPath);
  const protocol = parsed.protocol || 'http:';
  const isHttpsRequest = httpsRegex.test(protocol);
  const transport = isHttpsRequest ? https : http;

  // Set User-Agent (required by some servers)
  // Only set header if it hasn't been set in config
  // See https://github.com/axios/axios/issues/69
  if (!headers['User-Agent'] && !headers['user-agent']) headers['User-Agent'] = `pax-request/${version}`;

  const options = {
    hostname: parsed.hostname,
    port: parsed.port,
    path: parsed.path,
    method: method.toUpperCase(),
    headers,
  };

  if (maxContentLength && maxContentLength > -1) options.maxBodyLength = maxContentLength;

  return new Promise((resolve, reject) => {
    const request = transport.request(options, res => {
      if (request.aborted) return;

      let stream = res;
      switch (res.headers['content-encoding']) {
        case 'gzip':
        case 'compress':
        case 'deflate':
          // add the unzipper to the body stream processing pipeline
          stream = (res.statusCode === 204) ? stream : stream.pipe(zlib.createUnzip());

          // remove the content-encoding in order to not confuse downstream operations
          delete res.headers['content-encoding'];
          break;
      }

      const response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        config,
        request
      };

      if (config.responseType === 'stream') {
        response.data = stream;
        if (validateStatus(res.statusCode)) resolve(response);
        else reject(createError(`Request failed with status code ${res.statusCode}`, {
          config,
          request,
          response
        }));
      } else {
        const responseBuffer = [];
        stream.on('data', chunk => {
          responseBuffer.push(chunk);

          // make sure the content length is not over the maxContentLength if specified
          if (maxContentLength > -1 && Buffer.concat(responseBuffer).length > maxContentLength) {
            stream.destroy();
            reject(createError(`maxContentLength size of ${maxContentLength} exceeded`, {
              config,
              request
            }));
          }
        });

        stream.on('error', error => {
          if (request.aborted) return;
          err.config = configl
          err.request = request;
          reject(error);
        });

        stream.on('end', () => {
          let responseData = Buffer.concat(responseBuffer);
          if (responseType !== 'arraybuffer') responseData = responseData.toString(responseEncoding);
          response.data = responseData;

          if (validateStatus(res.statusCode)) resolve(response);
          else reject(createError(`Request failed with status code ${res.statusCode}`, {
            config,
            request,
            response
          }));
        });
      }
    });

    // Handle request timeout
    if (timeout) {
      // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
      // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
      // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
      // And then these socket which be hang up will devoring CPU little by little.
      // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
      request.setTimeout(timeout * 1000, () => { // convert to ms
        request.abort();
        reject(createError(`timeout of ${timeout} seconds exceeded`, {
          config,
          code: 'ECONNABORTED',
          request
        }));
      });
    }

    // Handle errors
    request.on('error', err => {
      if (request.aborted) return;
      err.config = config;
      err.request = request;
      reject(err);
    });

    // Send the request
    // is stream
    if (data !== null && typeof data === 'object' && isFunction(data.pipe)) {
      data.on('error', err => {
        err.config = configl
        err.request = request;
        reject(err);
      }).pipe(request);
    } else {
      request.end(data);
    }
  });
}
