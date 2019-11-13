"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var main = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _runTxTests2.default)(function (step) {
              if (!snapshotMode) return _hwTransportNodeHid2.default;
              var recordStore = new _hwTransportMocker.RecordStore();
              if (step.name in records) {
                throw new Error("Test called '" + step.name + "' already exists.");
              }
              records[step.name] = recordStore;
              return (0, _hwTransportMocker.createTransportRecorder)(_hwTransportNodeHid2.default, recordStore);
            }).then(function () {
              console.log("ALL PASS");
              if (snapshotMode) {
                console.log("recording snapshots...");
                var snapshots = {};
                for (var name in records) {
                  snapshots[name] = records[name].toObject();
                }
                _fs2.default.writeFileSync((0, _getSnapshotJSONFile2.default)(), (0, _stringify2.default)(snapshots, null, 2));
                console.log("done.");
              }
            }, function (e) {
              console.error(e);
              process.exit(1);
            });

          case 2:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

require("babel-polyfill");

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _hwTransportNodeHid = require("@ledgerhq/hw-transport-node-hid");

var _hwTransportNodeHid2 = _interopRequireDefault(_hwTransportNodeHid);

var _hwTransportMocker = require("@ledgerhq/hw-transport-mocker");

var _getSnapshotJSONFile = require("./getSnapshotJSONFile");

var _getSnapshotJSONFile2 = _interopRequireDefault(_getSnapshotJSONFile);

var _runTxTests = require("./runTxTests");

var _runTxTests2 = _interopRequireDefault(_runTxTests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var snapshotMode = process.argv[2] === "snapshot";
//import ensureBtcSnapshotAccount from "./ensureBtcSnapshotAccount";


var records = {};

main();
//# sourceMappingURL=index-node-tx.js.map