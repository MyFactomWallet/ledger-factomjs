"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _testFctAppConfig = require("./testFctAppConfig");

var _testFctAppConfig2 = _interopRequireDefault(_testFctAppConfig);

var _testFctAddr = require("./testFctAddr");

var _testFctAddr2 = _interopRequireDefault(_testFctAddr);

var _testFctAddrDisplay = require("./testFctAddrDisplay");

var _testFctAddrDisplay2 = _interopRequireDefault(_testFctAddrDisplay);

var _testFctTx = require("./testFctTx");

var _testFctTx2 = _interopRequireDefault(_testFctTx);

var _testFctECAddr = require("./testFctECAddr");

var _testFctECAddr2 = _interopRequireDefault(_testFctECAddr);

var _testFctEntryCommit = require("./testFctEntryCommit");

var _testFctEntryCommit2 = _interopRequireDefault(_testFctEntryCommit);

var _testFctChainCommit = require("./testFctChainCommit");

var _testFctChainCommit2 = _interopRequireDefault(_testFctChainCommit);

var _testFctAddrPath = require("./testFctAddrPath");

var _testFctAddrPath2 = _interopRequireDefault(_testFctAddrPath);

var _testFctIdAddr = require("./testFctIdAddr");

var _testFctIdAddr2 = _interopRequireDefault(_testFctIdAddr);

var _testFctIdHashSign = require("./testFctIdHashSign");

var _testFctIdHashSign2 = _interopRequireDefault(_testFctIdHashSign);

var _testFat0Tx = require("./testFat0Tx");

var _testFat0Tx2 = _interopRequireDefault(_testFat0Tx);

var _testFat1Tx = require("./testFat1Tx");

var _testFat1Tx2 = _interopRequireDefault(_testFat1Tx);

var _testFctTxMultiOut = require("./testFctTxMultiOut");

var _testFctTxMultiOut2 = _interopRequireDefault(_testFctTxMultiOut);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function expectAppContext(appName) {
  // TODO improve this by waiting user to do an action?
  return {
    expectAppContext: true,
    appName: appName
  };
}

var tests = [expectAppContext("Factom (fct)"), { name: "testFat0Tx", run: _testFat0Tx2.default }, { name: "testFat1Tx", run: _testFat1Tx2.default }, { name: "testFctAddr", run: _testFctAddr2.default }, { name: "testFctAddrDisplay", run: _testFctAddrDisplay2.default }, { name: "testFctECAddr", run: _testFctECAddr2.default }, { name: "testFctTx", run: _testFctTx2.default }, { name: "testFctEntryCommit", run: _testFctEntryCommit2.default }, { name: "testFctChainCommit", run: _testFctChainCommit2.default }, { name: "testFctAppConfig", run: _testFctAppConfig2.default }, { name: "testFctAddrPath", run: _testFctAddrPath2.default }, { name: "testFctIdHashSign", run: _testFctIdHashSign2.default }, { name: "testFctIdAddr", run: _testFctIdAddr2.default }, { name: "testFctTxMultiOut", run: _testFctTxMultiOut2.default }];

var defaultWaitForAppSwitch = function defaultWaitForAppSwitch(step) {
  return new _promise2.default(function (resolve) {
    var s = 3;
    console.info("You have " + s + " seconds to switch to " + step.appName + " app ...");
    var interval = setInterval(function () {
      if (--s) {
        console.log(s + " ...");
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });
};

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(getTransportClass) {
    var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5000;

    var createTransportViaList = function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(Transport) {
        var descriptors;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return Transport.list();

              case 2:
                descriptors = _context.sent;

                if (!(descriptors.length === 0)) {
                  _context.next = 5;
                  break;
                }

                throw "No device found";

              case 5:
                _context.next = 7;
                return Transport.open(descriptors[0], timeout);

              case 7:
                return _context.abrupt("return", _context.sent);

              case 8:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function createTransportViaList(_x4) {
        return _ref2.apply(this, arguments);
      };
    }();

    var createTransportViaListen = function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(Transport) {
        var descriptor;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return new _promise2.default(function (success, failure) {
                  var t = void 0;
                  var subscription = Transport.listen({
                    next: function next(e) {
                      if (e.type === "add") {
                        subscription.unsubscribe();
                        success(e.descriptor);
                        clearTimeout(t);
                      }
                    },
                    error: function error(_error) {
                      failure(_error);
                      clearTimeout(t);
                    },
                    complete: function complete() {
                      failure("terminated too early");
                      clearTimeout(t);
                    }
                  });
                  t = setTimeout(function () {
                    subscription.unsubscribe();
                    failure("timeout");
                  }, timeout);
                });

              case 2:
                descriptor = _context2.sent;
                _context2.next = 5;
                return Transport.open(descriptor, timeout);

              case 5:
                return _context2.abrupt("return", _context2.sent);

              case 6:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function createTransportViaListen(_x5) {
        return _ref3.apply(this, arguments);
      };
    }();

    var createTransportViaCreate = function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(Transport) {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return Transport.create(timeout);

              case 2:
                return _context3.abrupt("return", _context3.sent);

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function createTransportViaCreate(_x6) {
        return _ref4.apply(this, arguments);
      };
    }();

    var waitForAppSwitch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultWaitForAppSwitch;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            return _context5.abrupt("return", tests.reduce(function () {
              var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(p, step, i) {
                var Transport, supported, createTransport, transport, result;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 2;
                        return p;

                      case 2:
                        if (!step.expectAppContext) {
                          _context4.next = 6;
                          break;
                        }

                        _context4.next = 5;
                        return waitForAppSwitch(step);

                      case 5:
                        return _context4.abrupt("return");

                      case 6:
                        Transport = getTransportClass(step);
                        _context4.next = 9;
                        return Transport.isSupported();

                      case 9:
                        supported = _context4.sent;

                        if (supported) {
                          _context4.next = 12;
                          break;
                        }

                        throw new Error("Transport.isSupported() is false");

                      case 12:
                        // this will alternate between one of the 3 ways to create a transport
                        createTransport = [createTransportViaCreate, createTransportViaList, createTransportViaListen][i % 3];
                        _context4.next = 15;
                        return createTransport(Transport);

                      case 15:
                        transport = _context4.sent;

                        transport.setDebugMode(true);

                        if (step.name) {
                          console.info("Running test " + step.name);
                        }
                        _context4.prev = 18;
                        _context4.next = 21;
                        return step.run(transport);

                      case 21:
                        result = _context4.sent;

                        if (result) {
                          console.log(result);
                        }
                        _context4.next = 29;
                        break;

                      case 25:
                        _context4.prev = 25;
                        _context4.t0 = _context4["catch"](18);

                        console.error("Failed test " + step.name + ":", _context4.t0);
                        throw _context4.t0;

                      case 29:
                        _context4.prev = 29;

                        transport.close();
                        return _context4.finish(29);

                      case 32:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4, undefined, [[18, 25, 29, 32]]);
              }));

              return function (_x7, _x8, _x9) {
                return _ref5.apply(this, arguments);
              };
            }(), _promise2.default.resolve()));

          case 1:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
//# sourceMappingURL=runTests.js.map