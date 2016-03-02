'use strict';

var expect = require('must');
var STANDARD_DELAY = 200; // 200ms between nested calls to the API so things settle

function assertSuccessful(done, cb) {
   return function(err, res, xhr) {
      try {
         expect(err).not.to.exist();
         expect(res).to.exist();
         expect(xhr).to.be.an.object();

         if (cb) {
            setTimeout(function () {
               cb(err, res, xhr);
            }, STANDARD_DELAY);
         } else {
            done();
         }
      } catch(e) {
         done(e);
      }
   };
}

function assertFailure(done, cb) {
   return function(err) {
      try {
         expect(err).to.exist();
         expect(err).to.have.ownProperty('path');
         expect(err.request).to.exist();

         if (cb) {
            setTimeout(function () {
               cb(err);
            }, STANDARD_DELAY);
         } else {
            done();
         }
      } catch(e) {
         done(e);
      }
   };
}

module.exports = {
   assertSuccessful: assertSuccessful,
   assertFailure: assertFailure
};
