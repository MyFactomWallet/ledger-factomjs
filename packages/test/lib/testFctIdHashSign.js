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

var nacl = require('tweetnacl/nacl-fast').sign;

exports.default = function () {
   var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(transport) {
      var fct, path, ecBuffer, result;
      return _regenerator2.default.wrap(function _callee$(_context) {
         while (1) {
            switch (_context.prev = _context.next) {
               case 0:
                  fct = new _hwAppFct2.default(transport);
                  path = "44'/281'/0'/0/0";
                  ecBuffer = Buffer.from('The quick brown fox jumps over the lazy dog');

                  //sign a sha256 of message using identity key

                  _context.next = 5;
                  return fct.signMessageHash(path, ecBuffer, false);

               case 5:
                  result = _context.sent;

                  if (!nacl.detached.verify(Buffer.from(_jsSha4.default.hex(ecBuffer), 'hex'), Buffer.from(result['s'], 'hex'), Buffer.from(result['k'], 'hex'))) {
                     _context.next = 10;
                     break;
                  }

                  console.log("Transaction Signature is valid!!!");
                  _context.next = 12;
                  break;

               case 10:
                  console.log("Transaction Signature is NOT valid!!!");
                  throw "Invalid Identity Signature";

               case 12:
                  _context.next = 14;
                  return fct.signMessageHash(path, ecBuffer, true);

               case 14:
                  result = _context.sent;

                  if (!nacl.detached.verify(Buffer.from(_jsSha2.default.hex(ecBuffer), 'hex'), Buffer.from(result['s'], 'hex'), Buffer.from(result['k'], 'hex'))) {
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
                  return _context.abrupt('return', result);

               case 22:
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