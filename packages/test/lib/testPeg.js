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

var pegtransfer = Buffer.from("3031353838323736383434cffce0f409ebba4ed236d49d89c70e4bd1f1367d86402a3363366683265a242d7b2276657273696f6e223a312c227472616e73616374696f6e73223a5b7b22696e707574223a7b2261646472657373223a22464132326465354e534732464132486d4d61443468387153415a414a797a746d6d6e77674c50676843514b6f53656b7759596374222c22616d6f756e74223a3135302c2274797065223a2270464354227d2c227472616e7366657273223a5b7b2261646472657373223a2246413361454370773367455a37434d5176524e7845744b42474b416f73333932326f71594c634851394e7158487564433659424d222c22616d6f756e74223a3135307d5d7d5d7d", 'hex');
var pegconversion = Buffer.from("3031353838323833343935cffce0f409ebba4ed236d49d89c70e4bd1f1367d86402a3363366683265a242d7b2276657273696f6e223a312c227472616e73616374696f6e73223a5b7b22696e707574223a7b2261646472657373223a22464132326465354e534732464132486d4d61443468387153415a414a797a746d6d6e77674c50676843514b6f53656b7759596374222c22616d6f756e74223a3135302c2274797065223a2270464354227d2c22636f6e76657273696f6e223a22504547227d5d7d", 'hex');

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(transport) {
    var fct, amount, path, addr, fromAddr, publicKey, toAddr, extsig, testhash;
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


            console.log("=============ADDRESS==============");
            console.log(addr.address);
            console.log("==================================");

            console.log(pegtransfer.toString());

            toAddr = 'FA3nr5r54AKBZ9SLABS3JyRoGcWMVMTkePW9MECKM8shMg2pMagn';
            /*
              let tx = new TransactionBuilder(testTokenChainId)
                .input(fromAddr, amount)
                .output(toAddr, amount)
                .build()
            
              console.log(tx._content)
              console.log("CONTENT TRANSACTION")
              console.log(Buffer.from(tx._content).toString('hex'))
              console.log("BEGIN WHOLE TRANSACTION")
              console.log(tx.getMarshalDataSig(0).toString('hex'))
              console.log("END WHOLE TRANSACTION")
              */

            _context.next = 15;
            return fct.signFatTransaction(path, 2, pegtransfer);

          case 15:
            extsig = _context.sent;
            //tx.getMarshalDataSig(0))

            //let txgood = new TransactionBuilder(tx)
            //  .pkSignature(extsig.publicKey, Buffer.from(extsig.signature,'hex') )
            //  .build()

            testhash = fctUtil.sha512(pegtransfer); //tx.getMarshalDataSig(0))

            console.log("hash");
            console.log(extsig.hash);
            console.log(testhash.toString('hex'));
            console.log(publicKey);

            assert.isTrue(nacl.detached.verify(Buffer.from(extsig.hash, 'hex'), Buffer.from(extsig.signature, 'hex'), publicKey));
            assert.isTrue(testhash.toString('hex') === extsig.hash);

            //console.log(txgood)

            _context.next = 25;
            return fct.signFatTransaction(path, 2, pegconversion);

          case 25:
            extsig = _context.sent;
            //tx.getMarshalDataSig(0))

            //let txgood = new TransactionBuilder(tx)
            //  .pkSignature(extsig.publicKey, Buffer.from(extsig.signature,'hex') )
            //  .build()

            testhash = fctUtil.sha512(pegconversion); //tx.getMarshalDataSig(0))
            console.log("hash");
            console.log(extsig.hash);
            console.log(testhash.toString('hex'));
            console.log(publicKey);

            assert.isTrue(nacl.detached.verify(Buffer.from(extsig.hash, 'hex'), Buffer.from(extsig.signature, 'hex'), publicKey));
            assert.isTrue(testhash.toString('hex') === extsig.hash);

            return _context.abrupt('return', extsig);

          case 34:
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
//# sourceMappingURL=testPeg.js.map