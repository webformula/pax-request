// run both server with a single close method

module.exports = Promise.all([
  require('./test-server.js'),
  require('./token-server.js')
]).then(([a, b]) => ({
  close() {
    a.close();
    b.close();
  }
}));
