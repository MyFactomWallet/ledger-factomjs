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

var _require = require('factom/src/entry'),
    Entry = _require.Entry;

var _require2 = require('factom/src/factom-cli'),
    FactomCli = _require2.FactomCli;

var _require3 = require('factom/src/chain'),
    Chain = _require3.Chain,
    computeChainTxId = _require3.computeChainTxId,
    validateChainInstance = _require3.validateChainInstance,
    composeChainReveal = _require3.composeChainReveal;

var _require4 = require('factom/src/util'),
    sha256 = _require4.sha256,
    sha256d = _require4.sha256d;

var nacl = require('tweetnacl/nacl-fast').sign;

var cli = new FactomCli({
  host: 'courtesy-node.factom.com',
  port: 80,
  path: '/v2', // Path to V2 API. Default to /v2
  debugPath: '/debug', // Path to debug API. Default to /debug
  user: 'paul', // RPC basic authentication
  password: 'pwd',
  protocol: 'http', // http or https. Default to http
  rejectUnauthorized: true, // Set to false to allow connection to a node with a self-signed certificate
  retry: {
    retries: 4,
    factor: 2,
    minTimeout: 500,
    maxTimeout: 2000
  } });

//extracted from factom.Chain since it wasn't exported
function composeChainLedger(chain) {
  var firstEntry = chain.firstEntry;
  var entryHash = firstEntry.hash();
  var buffer = Buffer.alloc(104);

  buffer.writeInt8(0);
  buffer.writeIntBE(firstEntry.timestamp || Date.now(), 1, 6);
  var chainIdHash = sha256d(chain.id);
  chainIdHash.copy(buffer, 7);
  var commitWeld = sha256d(Buffer.concat([entryHash, chain.id]));
  commitWeld.copy(buffer, 39);
  entryHash.copy(buffer, 71);
  buffer.writeInt8(chain.ecCost(), 103);

  return buffer;
}

//variant of factom.chain.composeChainCommit 
function composeChainCommit(chain, ecpubkey, signature) {
  validateChainInstance(chain);
  var buffer = composeChainLedger(chain);
  return Buffer.concat([buffer, ecpubkey, signature]);
}

//variant of factom.chain.composeChainCommit
function composeChain(chain, ecpubkey, signature) {
  validateChainInstance(chain);
  return {
    commit: composeChainCommit(chain, ecpubkey, signature),
    reveal: composeChainReveal(chain)
  };
}

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(transport) {
    var fct, ecRate, path, addr, fromAddr, content, e, chain, txId, ccbuffer, result, out;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            fct = new _hwAppFct2.default(transport);
            _context.next = 3;
            return cli.getEntryCreditRate();

          case 3:
            ecRate = _context.sent;
            path = "44'/132'/0'/0'/0'";
            _context.next = 7;
            return fct.getAddress(path);

          case 7:
            addr = _context.sent;
            fromAddr = addr['address'];
            content = 'Hello Ledger';
            e = Entry.builder().extId('extId', 'utf8').extId('extId++', 'utf8').content(content, 'utf8').build();
            //.timestamp(Date.now())

            chain = new Chain(e);
            txId = computeChainTxId(chain);
            ccbuffer = composeChainLedger(chain);


            console.log('-------------========== Entry Commit Begin ==========----------------');
            console.log(ccbuffer.toString('hex'));
            console.log('-------------========== Entry Commit End ==========----------------');

            _context.next = 19;
            return fct.signCommit(path, ccbuffer.toString('hex'), true);

          case 19:
            result = _context.sent;


            console.log('-------------========== SIGNATURE ==========----------------');
            console.log(result);
            console.log('-------------========== SIGNATURE ==========----------------');

            out = composeChain(chain, Buffer.from(result['k'], 'hex'), Buffer.from(result['s'], 'hex'));


            console.log('-------------========== Composed Chain ==========----------------');
            console.log('commit:');
            console.log(out['commit'].toString('hex'));
            console.log('reveal:');
            console.log(out['reveal'].toString('hex'));
            console.log('-------------========== Composed Chain ==========----------------');

            return _context.abrupt('return', out);

          case 31:
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