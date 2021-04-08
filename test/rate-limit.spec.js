import expect from 'must';

import Github from '../lib/GitHub';


describe('RateLimit', function() {
   let github;
   let rateLimit;

   before(function() {
      github = new Github({
         username: testUser.USERNAME,
         password: testUser.PASSWORD,
         auth: 'basic',
      });

      rateLimit = github.getRateLimit();
   });

   it('should get rate limit', async function() {
      const {data: rateInfo} = await rateLimit.getRateLimit();
      const rate = rateInfo.rate;

      expect(rate).to.be.an.object();
      expect(rate).to.have.own('limit');
      expect(rate).to.have.own('remaining');
      expect(rate.limit).to.be.a.number();
      expect(rate.remaining).to.be.a.number();
      expect(rate.remaining).to.be.at.most(rateInfo.rate.limit);
   });
});
