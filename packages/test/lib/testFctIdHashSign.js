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


            console.log('========== Signed Hash ==========');
            console.log(result);
            console.log('==========-------------==========');

            //sha512
            _context.next = 14;
            return fct.signMessageHash(path, ecbuffer.toString('hex'), true);

          case 14:
            result = _context.sent;
            return _context.abrupt('return', out);

          case 16:
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