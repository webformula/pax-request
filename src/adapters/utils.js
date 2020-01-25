// A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
// RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
// by any combination of letters, digits, plus, period, or hyphen.
const absoluteUrlRegex = /^([a-z][a-z\d\+\-\.]*:)?\/\//i;
const trailingSlashRegex = /\/+$/;
const leadingSlashRegex = /^\/+/;

export function buildUrl(baseUrl = '', requestUrl = '') {
  if (!baseUrl || absoluteUrlRegex.test(requestUrl)) return requestUrl;
  return `${baseUrl.replace(trailingSlashRegex)}/${requestUrl.replace(leadingSlashRegex)}`;
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
