paxRequest.baseUrl = 'http://localhost:8082';

describe('browser', () => {
  it('bacic-get', async () => {
    const response = await paxRequest.get('base-get').send();
    assert.equal(response.status, 200);
  });

  it('bacic-post', async () => {
    const response = await paxRequest.post('base-post').send();
    assert.equal(response.status, 200);
  });

  it('bacic-patch', async () => {
    const response = await paxRequest.patch('base-patch').send();
    assert.equal(response.status, 200);
  });

  it('bacic-put', async () => {
    const response = await paxRequest.put('base-put').send();
    assert.equal(response.status, 200);
  });

  it('bacic-delete', async () => {
    const response = await paxRequest.delete('base-delete').send();
    assert.equal(response.status, 200);
  });

  it('bacic-head', async () => {
    const response = await paxRequest.head('base-head').send();
    assert.equal(response.status, 200);
  });

  it('send-recieve-json', async () => {
    const data = { test: 'one', bool: true };
    const response = await paxRequest
      .post('send-recieve-json')
      .data({ test: 'one', bool: true })
      .send();

    assert.equal(response.status, 200);
    assert.deepEqual(response.data, data);
  });

  it('timeout', async () => {
      try {
        await paxRequest
          .get('timeout')
          .timeout(1)
          .send();

      } catch (e) {
        assert.isDefined(e);
        return;
      }

      assert.fail('no timeout');
  });
});
