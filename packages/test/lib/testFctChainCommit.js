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

var _require = require('factom/src/factom-cli'),
    FactomCli = _require.FactomCli;

var _require2 = require('factom/src/entry'),
    Entry = _require2.Entry;

var _require3 = require('factom/src/chain'),
    Chain = _require3.Chain,
    computeChainTxId = _require3.computeChainTxId,
    validateChainInstance = _require3.validateChainInstance,
    composeChainLedger = _require3.composeChainLedger,
    composeChain = _require3.composeChain;

var cli = new FactomCli({
  host: 'courtesy-node.factom.com',
  port: 443,
  path: '/v2', // Path to V2 API. Default to /v2
  debugPath: '/debug', // Path to debug API. Default to /debug
  user: 'paul', // RPC basic authentication
  password: 'pwd',
  protocol: 'https', // http or https. Default to http
  rejectUnauthorized: true, // Set to false to allow connection to a node with a self-signed certificate
  retry: {
    retries: 4,
    factor: 2,
    minTimeout: 500,
    maxTimeout: 2000
  }
});

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(transport) {
    var fct, ecRate, path, addr, ecaddr, content, e, chain, txId, ccbuffer, result, out;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            fct = new _hwAppFct2.default(transport);
            ecRate = 24000; //await CORS... cli.getEntryCreditRate()

            path = "44'/132'/0'/0'/0'";
            _context.next = 5;
            return fct.getAddress(path);

          case 5:
            addr = _context.sent;
            ecaddr = addr['address'];
            content = 'Hello Ledger';
            e = Entry.builder().extId('extId', 'utf8').extId('extId++', 'utf8').content(content, 'utf8').timestamp(Date.now()).build();
            chain = new Chain(e);
            txId = computeChainTxId(chain);
            ccbuffer = composeChainLedger(chain);


            console.log('========== Chain Ledger Begin ==========');
            console.log(ccbuffer.toString('hex'));
            console.log('========== Chain Ledger End ==========');

            _context.next = 17;
            return fct.signCommit(path, ccbuffer.toString('hex'), true);

          case 17:
            result = _context.sent;


            console.log('========== Chain Commit Signature ==========');
            console.log(result);
            console.log('========== Chain Commit Signature ==========');

            out = composeChain(chain, ecaddr, result['s']);


            console.log('========== Composed Chain Begin ==========');
            console.log('commit:');
            console.log(out['commit'].toString('hex'));
            console.log('reveal:');
            console.log(out['reveal'].toString('hex'));
            console.log('========== Composed Chain End ==========');

            return _context.abrupt('return', out);

          case 29:
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
//# sourceMappingURL=testFctChainCommit.js.map