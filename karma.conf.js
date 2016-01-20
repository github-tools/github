module.exports = function (config) {
   'use strict';

   var configuration = {
      client: {
         captureConsole: true,
         mocha: {
            timeout: 10000,
            ui: 'bdd'
         }
      },

      concurrency: 2,

      singleRun: true,

      autoWatch: false,

      frameworks: [
         'browserify',
         'mocha',
         'chai'
      ],

      browsers: ['PhantomJS'],

      browserify: {
         debug: true,
         transform: ['browserify-istanbul']
      },

      phantomjsLauncher: {
         debug: true,
         options: {
            settings: {
               webSecurityEnabled: false
            }
         }
      },

      coverageReporter: {
         reporters: [
            {
               type: 'lcov'
            },
            {
               type: 'text-summary'
            }
         ],
         instrumenterOptions: {
            istanbul: {
               noCompact: true
            }
         }
      }
   };

   // This block is needed to execute Chrome on Travis
   // If you ever plan to use Chrome and Travis, you can keep it
   // If not, you can safely remove it
   // https://github.com/karma-runner/karma/issues/1144#issuecomment-53633076
   if (configuration.browsers[0] === 'Chrome' && process.env.TRAVIS) {
      configuration.customLaunchers = {
         'chrome-travis-ci': {
            base: 'Chrome',
            flags: ['--no-sandbox']
         }
      };
      configuration.browsers = ['chrome-travis-ci'];
   }

   config.set(configuration);
};
