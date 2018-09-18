'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _hwAppFct = require('@ledgerhq/hw-app-fct');

var _hwAppFct2 = _interopRequireDefault(_hwAppFct);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('factom/src/transaction'),
    Transaction = _require.Transaction;

var _require2 = require('factom/src/factom-cli'),
    FactomCli = _require2.FactomCli;

var nacl = require('tweetnacl/nacl-fast').sign;

var cli = new FactomCli({
  //host: 'courtesy-node.factom.com',
  host: 'localhost',
  //port: 443,
  port: 8088,
  path: '/v2', // Path to V2 API. Default to /v2
  debugPath: '/debug', // Path to debug API. Default to /debug
  protocol: 'https', // http or https. Default to http
  rejectUnauthorized: false, // Set to false to allow connection to a node with a self-signed certificate
  retry: {
    retries: 4,
    factor: 2,
    minTimeout: 500,
    maxTimeout: 2000
  } });

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(transport) {
    var fct, amount, ecRate, path, addr, fromAddr, toAddr, numinputs, numoutputs, fees, t, result, ts, i;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            fct = new _hwAppFct2.default(transport);
            amount = 1000000;
            ecRate = 65000; //await cli.getEntryCreditRate()

            path = "44'/131'/0'/0'/0'";
            _context.next = 6;
            return fct.getAddress(path);

          case 6:
            addr = _context.sent;
            fromAddr = addr['address'];
            toAddr = 'FA3nr5r54AKBZ9SLABS3JyRoGcWMVMTkePW9MECKM8shMg2pMagn';
            numinputs = 1;
            numoutputs = 10;
            fees = Transaction.builder().input(fromAddr, amount * numoutputs).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).build().computeRequiredFees(ecRate, { rcdSignatureLength: numoutputs * (33 + 64), numberOfSignatures: numinputs });


            console.log("*** ecRate ***");
            console.log(ecRate);
            console.log("**************");
            console.log("***  fees  ***");
            console.log(fees);
            console.log("**************");

            t = Transaction.builder().input(fromAddr, amount * numoutputs + fees).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).output(toAddr, amount).build();


            console.log('-------------========== TXN ==========----------------');
            console.log(t.marshalBinarySig.toString('hex'));
            console.log('-------------========== TXN ==========----------------');

            _context.next = 24;
            return fct.signTransaction("44'/131'/0'/0'/0'", t.marshalBinarySig.toString('hex'));

          case 24:
            result = _context.sent;


            console.log('-------------========== SIGNATURE ==========----------------');
            console.log(result);
            console.log('-------------========== SIGNATURE ==========----------------');

            ts = Transaction.builder(t).rcdSignature(Buffer.from(result['r'], 'hex'), Buffer.from(result['s'], 'hex')).build();
            i = 0;

          case 30:
            if (!(i < ts.signatures.length)) {
              _context.next = 40;
              break;
            }

            if (!nacl.detached.verify(ts.marshalBinarySig, ts.signatures[i], Buffer.from(ts.rcds[i], 1).slice(1))) {
              _context.next = 35;
              break;
            }

            console.log("Transaction Signature is valid!!!");
            _context.next = 37;
            break;

          case 35:
            console.log("Transaction Signature is NOT valid!!!");
            throw "Invalid Transaction Signature";

          case 37:
            ++i;
            _context.next = 30;
            break;

          case 40:
            return _context.abrupt('return', result);

          case 41:
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
//# sourceMappingURL=testFctTx.js.map