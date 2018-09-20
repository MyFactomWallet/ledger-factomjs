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
    Entry = _require2.Entry,
    validateEntryInstance = _require2.validateEntryInstance,
    composeEntry = _require2.composeEntry,
    composeEntryLedger = _require2.composeEntryLedger;

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
    var fct, ecRate, path, addr, ecaddr, entry, ecbuffer, result, out;
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
            entry = Entry.builder().chainId('954d5a49fd70d9b8bcdb35d252267829957f7ef7fa6c74f88419bdc5e82209f4').content('Hello Ledger').timestamp(Date.now()).build();
            ecbuffer = composeEntryLedger(entry);


            console.log('========== Entry Commit Ledger Begin ==========');
            console.log(ecbuffer.toString('hex'));
            console.log('========== Entry Commit Ledger End ==========');

            _context.next = 14;
            return fct.signCommit(path, ecbuffer.toString('hex'), false);

          case 14:
            result = _context.sent;


            console.log('========== Entry Commit Signature ==========');
            console.log(result);
            console.log('========== Entry Commit Signature ==========');

            out = composeEntry(entry, ecaddr, result['s']);


            console.log('========== Composed Entry Begin ==========');
            console.log('commit:');
            console.log(out['commit'].toString('hex'));
            console.log('reveal:');
            console.log(out['reveal'].toString('hex'));
            console.log('========== Compose Entry End ==========');

            return _context.abrupt('return', out);

          case 26:
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
//# sourceMappingURL=testFctEntryCommit.js.map