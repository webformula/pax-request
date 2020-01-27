paxRequest.baseUrl = 'http://localhost:8082';

describe('browser', () => {
  describe('basic', () => {
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
        .data(data)
        .send();

      assert.equal(response.status, 200);
      assert.deepEqual(response.data, data);
    });

    it('params-to-json', async () => {
      const data = { test: 'one' };
      const response = await request
        .post('params-to-json')
        .urlParameters(data)
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

  describe.only('jwt', () => {
    let instance;

    before(() => {
      instance = paxRequest.createInstance({
        baseUrl: 'http://localhost:8082',
        jwt: true
      });
    });

    it('no token test', async () => {
      try {
        await instance
          .get('auth')
          .send();

      } catch (e) {
        assert.isDefined(e);
        return;
      }

      assert.fail('no timeout');
    });

    // TODO gerenate jwt
    it('get access with refresh', async () => {
      localStorage.setItem('pax-jwt-refresh-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
      const response = await instance
        .get('auth')
        .send();
    });

    it('get new access with expired access', async function() {
      this.timeout(5000);
      const currentAccess = localStorage.getItem('pax-jwt-access-token');

      await (new Promise(resolve => {
        setTimeout(() => { resolve(); }, 2000);
      }));

      const response = await instance
        .get('auth')
        .send();

      const newAccess = localStorage.getItem('pax-jwt-access-token');
      assert.isDefined(currentAccess);
      assert.isDefined(newAccess);
      assert.notEqual(currentAccess, newAccess);
    });


    it('clear token on unauth', async () => {
      try {
        instance.unauth();
        await instance
          .get('auth')
          .send();

      } catch (e) {
        assert.isDefined(e);
        return;
      }

      assert.fail('has token');
    });
  });
});
