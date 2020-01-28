// A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
// RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
// by any combination of letters, digits, plus, period, or hyphen.
const absoluteUrlRegex = /^([a-z][a-z\d\+\-\.]*:)?\/\//i;
const trailingSlashRegex = /\/+$/;
const leadingSlashRegex = /^\/+/;
const normalizedHeaderNames = ['Accept', 'Content-Type'];
const upperCased = normalizedHeaderNames.map(s => s.toUpperCase());
const supportsArrayBuffer = typeof ArrayBuffer !== 'undefined';
const supportsURLSearchParams = typeof URLSearchParams !== 'undefined';

export function buildUrl(baseUrl = '', requestUrl = '', urlParameters) {
  let url;
  if (!baseUrl || absoluteUrlRegex.test(requestUrl)) url = requestUrl;
  else url =`${baseUrl.replace(trailingSlashRegex)}/${requestUrl.replace(leadingSlashRegex)}`;

  if (urlParameters && typeof urlParameters === 'object') {
    url += `?${Object.entries(urlParameters).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')}`
  }

  return url;
}

export function parseRawHeaders(headersString) {
  // Convert the header string into an array of individual headers
  const arr = headersString.trim().split(/[\r\n]+/);

  // Create a map of header names to values
  const headerMap = {};
  arr.forEach(line => {
    const parts = line.split(': ');
    const header = parts.shift();
    const value = parts.join(': ');
    headerMap[header] = value;
  });

  return headerMap;
}

export function createError(message = '', { config, request, response, code }) {
  const error = new Error(message);
  error.config = config;
  error.request = request;
  error.response = response;
  if (code) error.code = code;
  return error;
}

export function defaultStatisValidator(status) {
  return status >= 200 && status < 300;
}

// fix cassing on header names
export function normalizeHeaders(headersObject = {}) {
  Object.entries(headersObject).forEach(([key, value]) => {
    if (upperCased.includes(key.toUpperCase()) && !normalizedHeaderNames.includes(key)) {
      headersObject[normalizedName] = value;
      headersObject[key] = undefined;
    }
  });
}

export function normalizeData(config) {
  if (supportsArrayBuffer && ArrayBuffer.isView(config.data)) config.data = config.data.buffer;

  if (supportsURLSearchParams && config.data instanceof URLSearchParams) {
    config.data = config.data.toString();
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  }

  // JSON
  if (config.data !== null && typeof config.data === 'object') {
    config.data = JSON.stringify(config.data);
    config.headers['Content-Type'] = 'application/json;charset=utf-8';
  }
}
