'use strict';

function callbackWithError(done, fn) {
   var cb = function(err, response, xhr) {
      try {
         fn(err, response, xhr);
      } catch(e) {
         done(e);
      }
   };

   return cb;
}

if (typeof window === 'undefined') {
   // Export stuff (comment here to make linter happy)
   module.exports = callbackWithError;
}
