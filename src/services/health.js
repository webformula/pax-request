export default new class {
  constructor() {
    // is the host correct? one.site.com or site.com
    this.urlRegex = /^(?<protocal>https?)?(?:\:)?(?:\/\/)?(?<host>[^:\/?#]*)(?:\:(?<port>[0-9]+))?(?<path>[\/]{0,1}[^?#]*)(\?(?<parameters>[^#]*|))?(?:#(?<hash>.*|))?$/;
    this.hosts = {};
    this.hostsLookup = {};
    this.requestById = {};
    this.idCounter = 1;
  }

  trackRequest(url) {
    const requestId = this.getTrackingId();
    const info = this._getUrlInfo(url);

    info.requestById[requestId] = { url, startDate: Date.now() };
    this.requests[requestId] = info.requestById[requestId];

    return requestId;
  }

  trackResponse(requestId, { status }) {
    const endDate = Date.now();
    const duration = endDate - this.requestById[requestId].startDate;

    Object.assign(this.requestById[requestId], {
      status,
      endDate,
      duration
    });

    this._report(requestId);
  }

  getStatus(url) {
    const { status } = this._getUrlInfo(url);
    return status;
  }

  _registerUrl(url) {
    const { protocol, host, port, path, parameters, hash } = this._getUrlParts();
    if (!host) throw Error('no host');

    // how should i structure the urls?
    // currently its host over path
    if (!this.hosts[host]) this.hosts[host] = { __root: {} };
    if (path && !this.hosts[host][path]) this.hosts[host][path] = { report: { success: [], errors: [], stats: {} }, status: {}, requests: {} };
    if (!this.hostsLookup[url]) this.hostsLookup[url] = this.hosts[host][path];
  }

  _report(requestId) {
    const { url, status, endDate } = this.requestById[requestId];
    const urlReports = this.hostsLookup[url].report;
    if (status >= 500) report.errros.push({ requestId, status, endDate });
    if (status < 500) report.success.push({ requestId, status, endDate });

    const successTotal = report.success.length;
    const errorsTotal = report.errros.length;
    const errorPercentAll = errorsTotal / (errorsTotal + successTotal);
    const errorRateAll = reports.errors.reduce((value, item, i, arr) => {
      if (i === errorsTotal - 1) return value;
      const diff = arr[i + 1].endDate - item.endDate;
      return value + diff;
    }, 0) / errorsTotal;

    const thirtyMinAgo = Date.now() - (30 * 60000);
    const errorsInLast30 = reports.errors.filter(({ endDate }) => endDate >= thirtyMinAgo);
    const errorsRecent = errorsInLast30.length;
    const successRecent = reports.success.filter(({ endDate }) => endDate >= thirtyMinAgo);
    const errorPercentRecent = errorsRecent / (errorsRecent + successRecent);
    const errorRateRecent = reports.errors.reduce((value, item, i, arr) => {
      if (i === errorsRecent - 1) return value;
      const diff = arr[i + 1].endDate - item.endDate;
      return value + diff;
    }, 0) / errorsRecent;

    Object.assign(urlReports.stats, {
      errorsTotal,
      errorsRecent,
      successTotal,
      successRecent,
      errorPercentAll,
      errorPercentRecent,
      errorRateAll,
      errorRateRecent,
    });
  }

  _reportExternal() {
    
  }

  _updateStatus() {

  }

  _healthPing() {

  }

  _getUrlParts(url) {
    const match = url.match(this.urlRegex);
    return match ? match.groups : {};
  }

  _getUrlInfo(url) {
    if (!this.hostsLookup[url]) this._registerUrl(url);
    return this.hostsLookup[url];
  }

  // TODO uuid? want to have no dependencies, so can i use time based?
  _getTrackingId() {
    return this.idCounter++;
  }
}
