const server = require('../test-server.js');
const request = require('../../dist/pax-request.js');
request.baseUrl = 'http://localhost:8082';

let app;

beforeAll(async () => {
  app = await server;
});

describe('node', () => {
  it('bacic-get', async () => {
    const response = await request.get('base-get').send();
    expect(response.status).toEqual(200);
  });

  it('bacic-post', async () => {
    const response = await request.post('base-post').send();
    expect(response.status).toEqual(200);
  });

  it('bacic-patch', async () => {
    const response = await request.patch('base-patch').send();
    expect(response.status).toEqual(200);
  });

  it('bacic-put', async () => {
    const response = await request.put('base-put').send();
    expect(response.status).toEqual(200);
  });

  it('bacic-delete', async () => {
    const response = await request.delete('base-delete').send();
    expect(response.status).toEqual(200);
  });

  it('bacic-head', async () => {
    const response = await request.head('base-head').send();
    expect(response.status).toEqual(200);
  });

  it('send-recieve-json', async () => {
    const data = { test: 'one', bool: true };
    const response = await request
      .post('send-recieve-json')
      .data({ test: 'one', bool: true })
      .send();

    expect(response.status).toEqual(200);
    expect(response.data).toEqual(data);
  });

  it('timeout', async () => {
    function throws() {
      return request
        .get('timeout')
        .timeout(1)
        .send();
    }

    expect(throws()).rejects.toThrow();
  });
});


afterAll(async () => {
  await app.close();
});
