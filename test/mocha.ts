// const Plugins = require("../out/device/plugins")
// const plugins = new Plugins.Plugins()

// var assert = require('assert');
// describe('Array', function () {
//   describe('#indexOf()', function () {
//     it('should return -1 when the value is not present', function () {
//       console.log(plugins)
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });

import {
    after as importedAfter,
    before as importedBefore,
    afterEach as importedAfterEach,
    beforeEach as importedBeforeEach,
    describe as importedDescribe,
    xdescribe as importedXDescribe,
    it as importedIt,
    xit as importedXit,
  } from 'mocha';
  
  import LocalMocha = require('mocha');
  import assert = require('assert')
  
  
  // Warning!!
  // Don't refer node.d.ts!!
  // See #22510.
  // (): number => setTimeout(() => 0, 0);
  
  declare let number: number;
  declare let boolean: boolean;
  declare let string: string;
  declare let stringOrUndefined: string | undefined;
  declare let any: any;
  
  // Use module augmentation to add a third-party interface or reporter
  declare module 'mocha' {
    interface InterfaceContributions {
        'third-party-interface': never;
    }
    interface ReporterContributions {
        'third-party-reporter': never;
    }
  }
  
  const thirdPartyInterface: Mocha.Interface = 'third-party-interface';
  const thirdPartyReporter: Mocha.Reporter = 'third-party-reporter';
  
  // Lazy tests of compatibility between imported and global functions; should be identical
  const _after: typeof after = importedAfter;
  const _after2: typeof importedAfter = after;
  const _before: typeof before = importedBefore;
  const _before2: typeof importedBefore = before;
  const _afterEach: typeof afterEach = importedAfterEach;
  const _afterEach2: typeof importedAfterEach = afterEach;
  const _beforeEach: typeof beforeEach = importedBeforeEach;
  const _beforeEach2: typeof importedBeforeEach = beforeEach;
  const _describe: typeof describe = importedDescribe;
  const _describe2: typeof importedDescribe = describe;
  const _xdescribe: typeof xdescribe = importedXDescribe;
  const _xdescribe2: typeof importedXDescribe = xdescribe;
  const _it: typeof it = importedIt;
  const _it2: typeof importedIt = it;
  const _xit: typeof xit = importedXit;
  const _xit2: typeof importedXit = xit;
  
  