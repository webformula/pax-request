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

  describe('jwt refresh config 1', () => {
    let authedInstance;

    before(() => {
      authedInstance = paxRequest.createInstance({
        baseUrl: 'http://localhost:8082',
        jwt: {
          baseUrl: 'http://localhost:8083',
          authenticatePath: 'authenticate',
          deauthenticatePath: 'logout',
          refreshPath: 'token',

          strategy: 'refresh',
          storage: {
            access: 'memory',
            refresh: 'cookie'
          },

          recieve: {
            access: {
              transferType: 'body',
              parameterName: 'access_token'
            },

            refresh: {
              transferType: 'body',
              parameterName: 'refresh_token'
            }
          },

          send: {
            access: {
              transferType: 'header',
              parameterName: 'Authorization',
              prefix: 'Bearer '
            },

            refresh: {
              transferType: 'body',
              parameterName: 'refresh_token'
            }
          }
        }
      });
    });

    it('no token test', async () => {
      try {
        await authedInstance
          .get('check-access-token')
          .send();

      } catch (e) {
        assert.isDefined(e);
        assert.equal(e.response.status, 401);
        return;
      }

      assert.fail('no timeout');
    });

    it('intance should no longer be authed', async () => {
      try {
        await authedInstance.authorizeJWT();
        assert.fail('should throw');
      } catch(e) {
        assert.isDefined(e);
        assert.equal(e.response.status, 401);
      }
    });

    it('should login', async () => {
      await authedInstance
        .authenticateJWT()
        .data({
          email: 'my@email.com',
          password: 'password'
        })
        .send();
    });

    it('should validate access token', async () => {
      await authedInstance
        .get('check-access-token')
        .send();
    });

    it('401 after logout', async () => {
      await authedInstance
        .deauthenticateJWT()
        .send();

      try {
        await authedInstance
          .get('auth')
          .send();

      } catch (e) {
        assert.isDefined(e);
        assert.equal(e.response.status, 401);
        return;
      }

      assert.fail('did not logout');
    });
  });


  describe('jwt refresh config 2', () => {
    let authedInstance;

    before(() => {
      authedInstance = paxRequest.createInstance({
        baseUrl: 'http://localhost:8082',
        jwt: {
          baseUrl: 'http://localhost:8083',
          authenticatePath: 'authenticate-config2',
          // deauthenticatePath: 'logout',
          refreshPath: 'token-config2',

          strategy: 'refresh',
          storage: {
            access: 'localStorage',
            refresh: 'localStorage'
          },

          recieve: {
            access: {
              transferType: 'body',
              parameterName: 'access_token'
            },

            refresh: {
              transferType: 'body',
              parameterName: 'refresh_token'
            }
          },

          send: {
            access: {
              transferType: 'body',
              parameterName: 'access_token'
            },

            refresh: {
              transferType: 'body',
              parameterName: 'refresh_token'
            }
          }
        }
      });
    });

    it('no token test', async () => {
      try {
        await authedInstance
          .get('check-access-token-body')
          .send();

      } catch (e) {
        assert.isDefined(e);
        assert.equal(e.response.status, 401);
        return;
      }

      assert.fail('no timeout');
    });

    it('intance should no longer be authed', async () => {
      try {
        await authedInstance.authorizeJWT();
        assert.fail('should throw');
      } catch(e) {
        assert.isDefined(e);
        assert.equal(e.response.status, 401);
      }
    });

    it('should login', async () => {
      await authedInstance
        .authenticateJWT()
        .data({
          email: 'my@email.com',
          password: 'password'
        })
        .send();
    });

    it('should validate access token', async () => {
      await authedInstance
        .post('check-access-token-body')
        .send();
    });

    it('should refresh access token on experation', async function() {
      this.timeout(5000);
      const oldToken = localStorage.getItem('jwt_token_0');

      await (new Promise(resolve => {
        setTimeout(() => { resolve(); }, 2000);
      }));

      const response = await authedInstance
        .post('check-access-token-body')
        .send();

      const newAccess = localStorage.getItem('jwt_token_0');
      assert.isDefined(oldToken);
      assert.isDefined(newAccess);
      assert.notEqual(oldToken, newAccess);
    });

    it('401 after logout', async () => {
      await authedInstance
        .deauthenticateJWT()
        .send();

      try {
        await authedInstance
          .post('check-access-token-body')
          .send();
      } catch (e) {
        assert.isDefined(e);
        assert.equal(e.response.status, 401);
        return;
      }

      assert.fail('did not logout');
    });
  });
});
