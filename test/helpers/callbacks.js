import expect from 'must';

const STANDARD_DELAY = 200; // 200ms between nested calls to the API so things settle

export function assertSuccessful(done, cb) {
   return function successCallback(err, res, xhr) {
      try {
         expect(err).not.to.exist(err ? (err.response ? err.response.data : err) : 'No error');
         expect(res).to.exist();

         if (cb) {
            setTimeout(function delay() {
               cb(err, res, xhr);
            }, STANDARD_DELAY);
         } else {
            done();
         }
      } catch (e) {
         done(e);
      }
   };
}

export function assertFailure(done, cb) {
   return function failureCallback(err) {
      try {
         expect(err).to.exist();
         expect(err).to.have.ownProperty('path');
         expect(err.request).to.exist();

         if (cb) {
            setTimeout(function delay() {
               cb(err);
            }, STANDARD_DELAY);
         } else {
            done();
         }
      } catch (e) {
         done(e);
      }
   };
}

export function assertArray(done) {
   return assertSuccessful(done, function isArray(err, result) {
      expect(result).to.be.an.array();
      done();
   });
}
