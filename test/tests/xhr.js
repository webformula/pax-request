import request from '../../src/instancer.js';
request.baseUrl = 'http://localhost:8082';

describe('Array', () => {
  describe('d', () => {
    it('should return -1 when the value is not present', async () => {
      const response = await request.get('base-get').send();
      assert.equal(response.status, 200);
    });
  });
});
