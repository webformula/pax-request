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
      const response = await paxRequest
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

  describe('jwt', () => {
    let instance;

    before(() => {
      instance = paxRequest.createInstance({
        baseUrl: 'http://localhost:8082',
        jwt: {
          baseUrl: 'http://localhost:8083',
          authenticatePath: 'authenticate',
          deauthenticatePath: 'logout',
          refershPath: 'token'
        }
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

    it('intance should no longer be authed', async () => {
      const isAuthorized = await instance.authorizeJWT();
      assert.equal(isAuthorized, false)
    });

    it('should login', async () => {
      await instance
        .authenticateJWT()
        .data({
          email: 'my@email.com',
          password: 'password'
        })
        .send();
    });

    it('should validate access token', async () => {
      await instance
        .get('check-access-token')
        .send();
    });

    it('should refresh access token on experation', async function() {
      this.timeout(5000);
      const oldToken = localStorage.getItem('pax-jwt-access-token');

      await (new Promise(resolve => {
        setTimeout(() => { resolve(); }, 2000);
      }));

      const response = await instance
        .get('check-access-token')
        .send();

      const newAccess = localStorage.getItem('pax-jwt-access-token');
      assert.isDefined(oldToken);
      assert.isDefined(newAccess);
      assert.notEqual(oldToken, newAccess);
    });

    it('intance should be authed', async () => {
      const isAuthorized = await instance.authorizeJWT();
      assert.equal(isAuthorized, true)
    });

    it('401 after logout', async () => {
      await instance
        .deauthenticateJWT()
        .send();

      try {
        await instance
          .get('auth')
          .send();

      } catch (e) {
        assert.isDefined(e);
        return;
      }

      assert.fail('did not logout');
    });
  });
});
