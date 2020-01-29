export default new class {
  constructor() {
    this.urlRegex = /^(?<protocal>https?)?(?:\:)?(?:\/\/)?(?<host>[^:\/?#]*)(?:\:(?<port>[0-9]+))?(?<path>[\/]{0,1}[^?#]*)(\?(?<parameters>[^#]*|))?(?:#(?<hash>.*|))?$/;
    this.hosts = {};
  }

  registerUrl(url) {
    const match = url.match(this.urlRegex);
    const { protocol, host, port, path, parameters, hash } = match ? match.groups : {};
    
    if (!host) return;

    // is the host correct? one.site.com or site.com
    // how should i structure the urls?
    // currently ist host over path
    if (!this.hosts[host]) this.hosts[host] = { __root: {} };
    if (path && !this.hosts[host][path]) this.hosts[host][path] = {};
  }
}
