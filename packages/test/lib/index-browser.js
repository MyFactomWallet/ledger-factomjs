"use strict";

require("babel-polyfill");

var _hwTransportU2f = require("@ledgerhq/hw-transport-u2f");

var _hwTransportU2f2 = _interopRequireDefault(_hwTransportU2f);

var _runTests = require("./runTests");

var _runTests2 = _interopRequireDefault(_runTests);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var btn = document.createElement("button");
btn.textContent = "run tests";
document.body.appendChild(btn);
var errorEl = document.createElement("code");
errorEl.style.color = "#a33";
var pre = document.createElement("pre");
pre.appendChild(errorEl);
document.body.appendChild(pre);
btn.onclick = function () {
  errorEl.textContent = "";
  (0, _runTests2.default)(function () {
    return _hwTransportU2f2.default;
  }).then(function () {
    console.log("ALL PASS");
  }, function (e) {
    console.error(e);
    errorEl.textContent = e.message;
  });
};
//# sourceMappingURL=index-browser.js.map