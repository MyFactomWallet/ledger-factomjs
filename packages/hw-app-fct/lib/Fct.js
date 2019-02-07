"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _utils = require("./utils");

var _bip32Path = require("bip32-path");

var _bip32Path2 = _interopRequireDefault(_bip32Path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * MyFactomWallet Ledger API
 *
 * @example
 * import Fct from "@factoid.org/hw-app-fct";
 * const fct = new Fct(transport)
 */
/********************************************************************************
 *   Ledger Node JS API for Factom
 *   (c) 2018 The Factoid Authority 
 *            ledger@factoid.org
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ********************************************************************************/
var Fct = function () {
  function Fct(transport) {
    (0, _classCallCheck3.default)(this, Fct);

    this.transport = transport;
    transport.decorateAppAPIMethods(this, ["getAddress", "signTransaction", "signCommit", "signMessageRaw", "signMessageHash", "storeChainId", "getAppConfiguration"], "TFA");
  }

  /**
   * get Factom address for a given BIP 32 path.
   * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
   * @option boolDisplay if true, optionally display the address on the device 
   * @return an object with a publicKey and address with optional chainCode and chainid
   * @example
   * const fctaddr = await fct.getAddress("44'/131'/0'/0'/0'")
   * const ecaddr = await fct.getAddress("44'/132'/0'/0'/0'")
   * const idaddr = await fct.getAddress("44'/143165576'/0'/0'/0'")
   */

  (0, _createClass3.default)(Fct, [{
    key: "getAddress",
    value: function getAddress(path, boolDisplay, boolChainCode) {
      var bipPath = _bip32Path2.default.fromString(path).toPathArray();

      var buffer = new Buffer.alloc(1 + bipPath.length * 4);
      var boolIdAddr = bipPath[1] === 0x88888888;

      buffer.writeInt8(bipPath.length, 0);
      bipPath.forEach(function (segment, index) {
        buffer.writeUInt32BE(segment, 1 + index * 4);
      });

      return this.transport.send(0xe0, 0x02, boolDisplay || false ? 0x01 : 0x00, boolChainCode || false ? 0x01 : 0x00, buffer).then(function (response) {
        var result = {};
        var publicKeyLength = response[0];
        var addressLength = response[1 + publicKeyLength];
        result.publicKey = response.slice(1, 1 + publicKeyLength).toString("hex");
        result.address = response.slice(1 + publicKeyLength + 1, 1 + publicKeyLength + 1 + addressLength).toString("ascii");
        var chainidstart = 0;
        result.chaincode = "";
        result.chainid = "";

        if (boolChainCode || false) {
          result.chaincode = response.slice(1 + publicKeyLength + 1 + addressLength, 1 + publicKeyLength + 1 + addressLength + 32).toString("hex");
          chainidstart = 32;
        }

        if (boolIdAddr) {
          result.chainid = response.slice(1 + publicKeyLength + 1 + addressLength + chainidstart, 1 + publicKeyLength + 1 + addressLength + chainidstart + 32).toString("hex");
        }

        return result;
      });
    }

    /**
     * You can sign a transaction and retrieve v, r, s given the raw transaction and the BIP 32 path of the account to sign
     * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
     * @param rawTxHex The raw fct transaction request
     * @example
     const result = await fct.signTransaction("44'/131'/0'/0'/0'", "02016253dfaa7301010087db406ff65cb9dd72a1e99bcd51da5e03b0ccafc237dbf1318a8d7438e22371c892d6868d20f02894db071e2eb38fdc56c697caaeba7dc19bddae2c6e7084cc3120d667b49f")
     */

  }, {
    key: "signTransaction",
    value: function signTransaction(path, rawTxHex /*change to tx: Transation */
    ) {
      var _this = this;

      var paths = (0, _utils.splitPath)(path);
      var offset = 0;
      var rawTx = new Buffer(rawTxHex, "hex");
      var toSend = [];
      var response = void 0;

      var _loop = function _loop() {
        var maxChunkSize = offset === 0 ? 150 - 1 - paths.length * 4 : 150;
        var chunkSize = offset + maxChunkSize > rawTx.length ? rawTx.length - offset : maxChunkSize;
        var buffer = new Buffer(offset === 0 ? 1 + paths.length * 4 + chunkSize : chunkSize);
        if (offset === 0) {
          buffer[0] = paths.length;
          paths.forEach(function (element, index) {
            buffer.writeUInt32BE(element, 1 + 4 * index);
          });
          rawTx.copy(buffer, 1 + 4 * paths.length, offset, offset + chunkSize);
        } else {
          rawTx.copy(buffer, 0, offset, offset + chunkSize);
        }
        toSend.push(buffer);
        offset += chunkSize;
      };

      while (offset !== rawTx.length) {
        _loop();
      }
      return (0, _utils.foreach)(toSend, function (data, i) {
        return _this.transport.send(0xe0, 0x04, i === 0 ? 0x00 : 0x80, i === toSend.length - 1 ? 0x01 : 0x00, data).then(function (apduResponse) {
          response = apduResponse;
        });
      }).then(function () {

        var r = response.slice(0, 33).toString('hex');
        //length of signature should be 64
        var v = response.slice(33, 33 + 2).readUInt16BE(0);
        //signature
        var s = response.slice(35, 35 + v).toString('hex');
        return { v: v, r: r, s: s };
      });
    }

    /**
     * You can sign an entry or chain commit and retrieve v, k, s given the raw transaction and the BIP 32 path of the account to sign
     * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
     * @param rawTxHex this is the ledger for a entry or chain commit
     * @param ischaincommit set this to true if the rawTxHex is a chain commit ledger.
     * @example
     fct.signCommit("44'/132'/0'/0'/0", "00016227acddfe57cf6740c4f30ae39d71f75710fb4ea9c843d5c01755329a42ccab52034e1f7901d5b8efdb52a15c4007d341eb1193903a021ed7aaa9a3cf4234c32ef8a213de00",false).then(result => ...)
     */

  }, {
    key: "signCommit",
    value: function signCommit(path, rawTxHex, ischaincommit) {
      var _this2 = this;

      var bipPath = _bip32Path2.default.fromString(path).toPathArray();
      var offset = 0;
      var p1 = 0;
      var p2 = ischaincommit || 0;
      var rawTx = new Buffer(rawTxHex, "hex");
      var toSend = [];
      var response = void 0;

      var _loop2 = function _loop2() {
        var maxChunkSize = offset === 0 ? 150 - 1 - bipPath.length * 4 : 150;
        var chunkSize = offset + maxChunkSize > rawTx.length ? rawTx.length - offset : maxChunkSize;
        var buffer = new Buffer(offset === 0 ? 1 + bipPath.length * 4 + chunkSize : chunkSize);
        if (offset === 0) {
          buffer.writeInt8(bipPath.length, 0);
          bipPath.forEach(function (segment, index) {
            buffer.writeUInt32BE(segment, 1 + index * 4);
          });

          rawTx.copy(buffer, 1 + 4 * bipPath.length, offset, offset + chunkSize);
        } else {
          rawTx.copy(buffer, 0, offset, offset + chunkSize);
        }
        toSend.push(buffer);
        offset += chunkSize;
      };

      while (offset !== rawTx.length) {
        _loop2();
      }
      return (0, _utils.foreach)(toSend, function (data, i) {
        return _this2.transport.send(0xe0, 0x12, i === 0 ? 0x00 : 0x80, (i === toSend.length - 1 ? 0x02 : 0x00) | (p2 ? 0x01 : 0x00), data).then(function (apduResponse) {
          response = apduResponse;
        });
      }).then(function () {

        var k = response.slice(0, 32).toString('hex');
        //length of signature should be 64
        var v = response.slice(32, 32 + 2).readUInt16BE(0);
        //signature
        var s = response.slice(34, 34 + v).toString('hex');
        return { v: v, k: k, s: s };
      });
    }

    /**
    * You can sign an entry or chain commit and retrieve v, k, s given the raw transaction and the BIP 32 path of the account to sign
    * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
    * @param rawMessage this is the raw data Buffer to be signed
    * @param tosha512 set this to true to hash the rawMessage using sha512, the default is sha256.
    * @example
    fct.signMessageHash("44'/143165576'/0'/0'/0", "The quick brown fox jumps over the lazy dog.",true).then(result => ...)
    */

  }, {
    key: "signMessageHash",
    value: function signMessageHash(path, rawMessage, tosha512) {
      var _this3 = this;

      var bipPath = _bip32Path2.default.fromString(path).toPathArray();
      var offset = 0;
      var p1 = 0;
      var p2 = tosha512 || 0;
      var rawTx = rawMessage;
      var toSend = [];
      var response = void 0;
      console.log('test');

      var _loop3 = function _loop3() {
        var maxChunkSize = offset === 0 ? 150 - 1 - bipPath.length * 4 : 150;
        var chunkSize = offset + maxChunkSize > rawTx.length ? rawTx.length - offset : maxChunkSize;
        var buffer = new Buffer(offset === 0 ? 1 + bipPath.length * 4 + chunkSize : chunkSize);
        if (offset === 0) {
          buffer.writeInt8(bipPath.length, 0);
          bipPath.forEach(function (segment, index) {
            buffer.writeUInt32BE(segment, 1 + index * 4);
          });
          rawTx.copy(buffer, 1 + 4 * bipPath.length, offset, offset + chunkSize);
        } else {
          rawTx.copy(buffer, 0, offset, offset + chunkSize);
        }
        toSend.push(buffer);
        offset += chunkSize;
      };

      while (offset !== rawTx.length) {
        _loop3();
      }
      return (0, _utils.foreach)(toSend, function (data, i) {
        return _this3.transport.send(0xe0, 0x14, i === 0 ? 0x00 : 0x80, (i === toSend.length - 1 ? 0x02 : 0x00) | (p2 ? 0x01 : 0x00), data).then(function (apduResponse) {
          response = apduResponse;
        });
      }).then(function () {

        var k = response.slice(0, 32).toString('hex');
        //length of signature should be 64
        var v = response.slice(32, 32 + 2).readUInt16BE(0);
        //signature
        var s = response.slice(34, 34 + v).toString('hex');
        var l = response.slice(34 + v, 34 + v + 2).readUInt8(0);
        var h = response.slice(36 + v, 36 + v + l).toString('hex');

        return { v: v, k: k, s: s, l: l, h: h };
      });
    }

    /**
     * You can sign an entry or chain commit and retrieve v, k, s given the raw transaction and the BIP 32 path of the account to sign
     * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
     * @param rawTxHex this is the ledger for a entry or chain commit
     * @param ischaincommit set this to true if the rawTxHex is a chain commit ledger.
     * @example
     fct.signCommit("44'/132'/0'/0'/0", "00016227acddfe57cf6740c4f30ae39d71f75710fb4ea9c843d5c01755329a42ccab52034e1f7901d5b8efdb52a15c4007d341eb1193903a021ed7aaa9a3cf4234c32ef8a213de00",false).then(result => ...)
     */

  }, {
    key: "storeChainId",
    value: function storeChainId(chainIdHex) {
      var _this4 = this;

      var p1 = 0;
      var p2 = 0;
      var rawTx = new Buffer(chainIdHex, "hex");
      var toSend = [];
      var response = void 0;

      toSend.push(rawTx);

      return (0, _utils.foreach)(toSend, function (data, i) {
        return _this4.transport.send(0xe0, 0x18, p1, p2, data).then(function (apduResponse) {
          response = apduResponse;
        });
      }).then(function () {
        return {};
      });
    }

    /**
    * You can sign an entry or chain commit and retrieve v, k, s given the raw transaction and the BIP 32 path of the account to sign
    * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
    * @param rawMessage this is the raw data Buffer to be signed
    * @param tosha512 set this to true to has the rawMessage .
    * @example
    fct.signMessageRaw("44'/143165576'/0'/0/0", "The quick brown fox jumps over the lazy dog.").then(result => ...)
    */

  }, {
    key: "signMessageRaw",
    value: function signMessageRaw(path, rawMessage) {
      var _this5 = this;

      var bipPath = _bip32Path2.default.fromString(path).toPathArray();
      var offset = 0;
      var p1 = 0;
      var p2 = 0;
      var rawTx = rawMessage;
      var toSend = [];
      var response = void 0;

      var _loop4 = function _loop4() {
        var maxChunkSize = offset === 0 ? 150 - 1 - bipPath.length * 4 : 150;
        var chunkSize = offset + maxChunkSize > rawTx.length ? rawTx.length - offset : maxChunkSize;
        var buffer = new Buffer(offset === 0 ? 1 + bipPath.length * 4 + chunkSize : chunkSize);
        if (offset === 0) {
          buffer.writeInt8(bipPath.length, 0);
          bipPath.forEach(function (segment, index) {
            buffer.writeUInt32BE(segment, 1 + index * 4);
          });
          rawTx.copy(buffer, 1 + 4 * bipPath.length, offset, offset + chunkSize);
        } else {
          rawTx.copy(buffer, 0, offset, offset + chunkSize);
        }
        toSend.push(buffer);
        offset += chunkSize;
      };

      while (offset !== rawTx.length) {
        _loop4();
      }
      return (0, _utils.foreach)(toSend, function (data, i) {
        return _this5.transport.send(0xe0, 0x16, i === 0 ? 0x00 : 0x80, i === toSend.length - 1 ? 0x01 : 0x00, data).then(function (apduResponse) {
          response = apduResponse;
        });
      }).then(function () {

        var k = response.slice(0, 32).toString('hex');
        //length of signature should be 64
        var v = response.slice(32, 32 + 2).readUInt16BE(0);
        //signature
        var s = response.slice(34, 34 + v).toString('hex');
        var l = response.slice(34 + v, 34 + v + 2).readUInt8(0);
        var h = response.slice(36 + v, 36 + v + l).toString('hex');
        return { v: v, k: k, s: s, h: h };
      });
    }

    /**
     */

  }, {
    key: "getAppConfiguration",
    value: function getAppConfiguration() {
      return this.transport.send(0xe0, 0x06, 0x00, 0x00).then(function (response) {
        var result = {};
        result.arbitraryDataEnabled = response[0] & 0x01;
        result.version = "" + response[1] + "." + response[2] + "." + response[3];
        return result;
      });
    }
  }]);
  return Fct;
}();

exports.default = Fct;
//# sourceMappingURL=Fct.js.map