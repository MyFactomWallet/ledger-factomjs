'use strict';

Object.defineProperty(exports, "__esModule", {
   value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _hwAppFct = require('@factoid.org/hw-app-fct');

var _hwAppFct2 = _interopRequireDefault(_hwAppFct);

var _jsSha = require('js-sha512');

var _jsSha2 = _interopRequireDefault(_jsSha);

var _jsSha3 = require('js-sha256');

var _jsSha4 = _interopRequireDefault(_jsSha3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('factom/src/entry'),
    Entry = _require.Entry,
    validateEntryInstance = _require.validateEntryInstance,
    composeEntry = _require.composeEntry,
    composeEntryLedger = _require.composeEntryLedger;

exports.default = function () {
   var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(transport) {
      var fct, path, ecBuffer, result;
      return _regenerator2.default.wrap(function _callee$(_context) {
         while (1) {
            switch (_context.prev = _context.next) {
               case 0:
                  fct = new _hwAppFct2.default(transport);
                  path = "44'/281'/0'/0/0";
                  ecBuffer = Buffer.fromString('The quick brown fox jumps over the lazy dog');


                  console.log('========== Entry Commit Ledger Begin ==========');
                  console.log(ecbuffer.toString('hex'));
                  console.log('========== Entry Commit Ledger End ==========');
                  //sha256
                  _context.next = 8;
                  return fct.signMessageHash(path, ecbuffer.toString('hex'), false);

               case 8:
                  result = _context.sent;

                  if (!(result['h'] != _jsSha4.default.hex(ecbuffer.toString()))) {
                     _context.next = 14;
                     break;
                  }

                  console.log("SHA256 Hash is invalid!!!");
                  throw "Invalid hash from device";

               case 14:
                  console.log("Hash from device is valid!!!");

               case 15:
                  if (!nacl.detached.verify(result['h'], result['s'], result['k'])) {
                     _context.next = 19;
                     break;
                  }

                  console.log("Transaction Signature is valid!!!");
                  _context.next = 21;
                  break;

               case 19:
                  console.log("Transaction Signature is NOT valid!!!");
                  throw "Invalid Identity Signature";

               case 21:

                  console.log('========== Signed Hash ==========');
                  console.log(result);
                  console.log('==========-------------==========');

                  //sha512
                  _context.next = 26;
                  return fct.signMessageHash(path, ecbuffer.toString('hex'), true);

               case 26:
                  result = _context.sent;

                  if (!(result['h'] != _jsSha2.default.hex(ecbuffer.toString()))) {
                     _context.next = 32;
                     break;
                  }

                  console.log("SHA512 Hash is invalid!!!");
                  throw "Invalid hash from device";

               case 32:
                  console.log("Hash from device is valid!!!");

               case 33:
                  if (!nacl.detached.verify(result['h'], result['s'], result['k'])) {
                     _context.next = 37;
                     break;
                  }

                  console.log("Transaction Signature is valid!!!");
                  _context.next = 39;
                  break;

               case 37:
                  console.log("Transaction Signature is NOT valid!!!");
                  throw "Invalid Identity Signature";

               case 39:
                  return _context.abrupt('return', out);

               case 40:
               case 'end':
                  return _context.stop();
            }
         }
      }, _callee, undefined);
   }));

   return function (_x) {
      return _ref.apply(this, arguments);
   };
}();
//# sourceMappingURL=testFctIdHashSign.js.map