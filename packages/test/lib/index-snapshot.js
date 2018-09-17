"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

require("babel-polyfill");

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _getSnapshotJSONFile = require("./getSnapshotJSONFile");

var _getSnapshotJSONFile2 = _interopRequireDefault(_getSnapshotJSONFile);

var _hwTransportMocker = require("@ledgerhq/hw-transport-mocker");

var _runTests = require("./runTests");

var _runTests2 = _interopRequireDefault(_runTests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var snapshots = JSON.parse(_fs2.default.readFileSync((0, _getSnapshotJSONFile2.default)(), "utf8"));

// test node hid
(0, _runTests2.default)(function (step) {
  var stepName = step.name;
  if (!(stepName in snapshots)) {
    throw new Error("snapshot not found for '" + stepName + "'.\nPlease see packages/test/README.md intructions to record tests.");
  }
  return (0, _hwTransportMocker.createTransportReplayer)(_hwTransportMocker.RecordStore.fromObject(snapshots[stepName]));
}, undefined, function () {
  return _promise2.default.resolve();
}).then(function () {
  console.log("ALL PASS");
}, function (e) {
  console.error(e);
  process.exit(1);
});
//# sourceMappingURL=index-snapshot.js.map