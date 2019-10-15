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

var _require = require('factom/src/transaction'),
    Transaction = _require.Transaction;

var _require2 = require('factom/src/factom-cli'),
    FactomCli = _require2.FactomCli;

var nacl = require('tweetnacl/nacl-fast').sign;
var assert = require('chai').assert;
var fctUtil = require('factom/src/util');

var Entry = require('factom/src/entry').Entry;

var TransactionBuilder = require('@fat-token/fat-js/0/TransactionBuilder');

var testTokenChainId = '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762';

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(transport) {
    var fct, amount, path, addr, fromAddr, publicKey, toAddr, tx, extsig, txgood, testhash;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            fct = new _hwAppFct2.default(transport);
            amount = 150;
            path = "44'/131'/0'/0/0";
            _context.next = 5;
            return fct.getAddress(path);

          case 5:
            addr = _context.sent;
            fromAddr = addr.address;
            publicKey = Buffer.from(addr.publicKey, 'hex');
            toAddr = 'FA3nr5r54AKBZ9SLABS3JyRoGcWMVMTkePW9MECKM8shMg2pMagn';
            tx = new TransactionBuilder(testTokenChainId).input(fromAddr, amount).output(toAddr, amount).build();


            console.log(tx._content);
            console.log("CONTENT TRANSACTION");
            console.log(Buffer.from(tx._content).toString('hex'));
            console.log("BEGIN WHOLE TRANSACTION");
            console.log(tx.getMarshalDataSig(0).toString('hex'));
            console.log("END WHOLE TRANSACTION");
            _context.next = 18;
            return fct.signFatTransaction(path, 0, tx.getMarshalDataSig(0));

          case 18:
            extsig = _context.sent;
            txgood = new TransactionBuilder(tx).pkSignature(extsig.publicKey, Buffer.from(extsig.signature, 'hex')).build();
            testhash = fctUtil.sha512(tx.getMarshalDataSig(0));

            console.log("hash");
            console.log(extsig.hash);
            console.log(testhash.toString('hex'));
            assert.isTrue(txgood.validateSignatures());
            assert.isTrue(testhash.toString('hex') === extsig.hash);

            console.log(txgood);

            return _context.abrupt('return', extsig);

          case 28:
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
//# sourceMappingURL=testFat0Tx.js.map