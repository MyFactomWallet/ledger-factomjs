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
//@flow

import { splitPath, foreach } from "./utils";
import type Transport from "@ledgerhq/hw-transport";
import BIPPath from "bip32-path";


/**
 * MyFactomWallet Ledger API
 *
 * @example
 * import Fct from "@factoid.org/hw-app-fct";
 * const fct = new Fct(transport)
 */
export default class Fct {
  transport: Transport<*>;

  constructor(transport: Transport<*>) {
    this.transport = transport;
    transport.decorateAppAPIMethods(
      this,
      ["getAddress", "signTransaction", "signCommit", "signMessageRaw", "signMessageHash", "getAppConfiguration"],
      "TFA"
    );
  }

  /**
   * get Factom address for a given BIP 32 path.
   * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
   * @option boolDisplay if true, optionally display the address on the device 
   * @return an object with a publicKey and address 
   * @example
   * const fctaddr = await fct.getAddress("44'/131'/0'/0'/0'")
   * const ecaddr = await fct.getAddress("44'/132'/0'/0'/0'")
   * const idaddr = await fct.getAddress("44'/143165576'/0'/0'/0'")
   */
  getAddress(
    path: string,
    boolDisplay?: boolean,
    boolChainCode?: boolean
  ): Promise<{
    publicKey: string,
    address: string
  }> {
    const bipPath = BIPPath.fromString(path).toPathArray();

    let buffer = new Buffer.alloc(1 + bipPath.length * 4);

    buffer.writeInt8(bipPath.length, 0);
    bipPath.forEach((segment, index) => {
      buffer.writeUInt32BE(segment, 1 + index * 4);
    });

    return this.transport
      .send(
        0xe0,
        0x02,
        boolDisplay || false ? 0x01 : 0x00,
        boolChainCode || false ? 0x01 : 0x00,
        buffer
      )
      .then(response => {
        let result = {};
        let publicKeyLength = response[0];
        let addressLength = response[1 + publicKeyLength];
        result.publicKey = response
          .slice(1, 1 + publicKeyLength)
          .toString("hex")
        result.address =
          response
            .slice(
              1 + publicKeyLength + 1,
              1 + publicKeyLength + 1 + addressLength
            )
            .toString("ascii")
        if ( boolChainCode || false ) {
          result.chaincode = response
            .slice(
              1 + publicKeyLength + 1 + addressLength + 1,
              1 + publicKeyLength + 1 + addressLength + 1 + 32
            ).toString("hex")
	} else {
	   result.chaincode = ""
	}
        return result
      });
  }

  /**
   * You can sign a transaction and retrieve v, r, s given the raw transaction and the BIP 32 path of the account to sign
   * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
   * @param rawTxHex The raw fct transaction request
   * @example
   const result = await fct.signTransaction("44'/131'/0'/0'/0'", "02016253dfaa7301010087db406ff65cb9dd72a1e99bcd51da5e03b0ccafc237dbf1318a8d7438e22371c892d6868d20f02894db071e2eb38fdc56c697caaeba7dc19bddae2c6e7084cc3120d667b49f")
   */
  signTransaction(
    path: string,
    rawTxHex: string /*change to tx: Transation */
  ): Promise<{
    s: string,
    v: string,
    r: string
  }> {
    let paths = splitPath(path);
    let offset = 0;
    let rawTx = new Buffer(rawTxHex, "hex");
    let toSend = [];
    let response;
    while (offset !== rawTx.length) {
      let maxChunkSize = offset === 0 ? 150 - 1 - paths.length * 4 : 150 
      let chunkSize =
        offset + maxChunkSize > rawTx.length
          ? rawTx.length - offset
          : maxChunkSize;
      let buffer = new Buffer(
        offset === 0 ? 1 + paths.length * 4 + chunkSize : chunkSize
      );
      if (offset === 0) {
        buffer[0] = paths.length;
        paths.forEach((element, index) => {
          buffer.writeUInt32BE(element, 1 + 4 * index);
        });
        rawTx.copy(buffer, 1 + 4 * paths.length, offset, offset + chunkSize);
      } else {
        rawTx.copy(buffer, 0, offset, offset + chunkSize)
      }
      toSend.push(buffer)
      offset += chunkSize
    }
    return foreach(toSend, (data, i) =>
      this.transport
        .send(0xe0, 0x04, i === 0 ? 0x00 : 0x80, i === toSend.length-1 ? 0x01 : 0x00, data)
        .then(apduResponse => {
          response = apduResponse;
        })
    ).then(() => {
      
      const r = response.slice(0, 33).toString('hex')
      //length of signature should be 64
      const v = response.slice(33, 33 + 2).readUInt16BE(0)
      //signature
      const s = response.slice(35, 35 + v ).toString('hex')
      return { v, r, s }
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
  signCommit(
    path: string,
    rawTxHex: string, 
    ischaincommit?: boolean
  ): Promise<{
    s: string,
    v: string,
    r: string
  }> {
    const bipPath = BIPPath.fromString(path).toPathArray();
    let offset = 0
    let p1 = 0
    let p2 = ischaincommit || 0
    let rawTx = new Buffer(rawTxHex, "hex")
    let toSend = []
    let response
    while (offset !== rawTx.length) {
      let maxChunkSize = offset === 0 ? 150 - 1 - bipPath.length * 4 : 150;
      let chunkSize =
        offset + maxChunkSize > rawTx.length
          ? rawTx.length - offset
          : maxChunkSize
      let buffer = new Buffer(
        offset === 0 ? 1 + bipPath.length * 4 + chunkSize : chunkSize
      )
      if (offset === 0) {
        buffer.writeInt8(bipPath.length, 0);
        bipPath.forEach((segment, index) => {
          buffer.writeUInt32BE(segment, 1 + index * 4);
        });

        rawTx.copy(buffer, 1 + 4 * bipPath.length, offset, offset + chunkSize)
      } else {
        rawTx.copy(buffer, 0, offset, offset + chunkSize)
      }
      toSend.push(buffer)
      offset += chunkSize
    }
    return foreach(toSend, (data, i) =>
      this.transport
        .send(0xe0, 0x12, i === 0 ? 0x00 : 0x80, (i === toSend.length-1 ? 0x02 : 0x00) | (p2 ? 0x01 : 0x00) , data)
        .then(apduResponse => {
          response = apduResponse;
        })
    ).then(() => {
      
      const k = response.slice(0, 32).toString('hex')
      //length of signature should be 64
      const v = response.slice(32, 32 + 2).readUInt16BE(0)
      //signature
      const s = response.slice(34, 34 + v ).toString('hex')
      return { v, k, s }
    })
  }

    /**
   * You can sign an entry or chain commit and retrieve v, k, s given the raw transaction and the BIP 32 path of the account to sign
   * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
   * @param rawMessage this is the raw data Buffer to be signed
   * @param tosha512 set this to true to hash the rawMessage using sha512, the default is sha256.
   * @example
   fct.signMessageHash("44'/143165576'/0'/0'/0", "The quick brown fox jumps over the lazy dog.",true).then(result => ...)
   */
  signMessageHash(
    path: string,
    rawMessage: Buffer, 
    tosha512?: boolean
  ): Promise<{
    s: string,
    v: string,
    r: string
  }> {
    const bipPath = BIPPath.fromString(path).toPathArray();
    let offset = 0
    let p1 = 0
    let p2 = tosha512 || 0
    let rawTx = rawMessage
    let toSend = []
    let response
	  console.log('test')
    while (offset !== rawTx.length) {
      let maxChunkSize = offset === 0 ? 150 - 1 - bipPath.length * 4 : 150;
      let chunkSize =
        offset + maxChunkSize > rawTx.length
          ? rawTx.length - offset
          : maxChunkSize
      let buffer = new Buffer(
        offset === 0 ? 1 + bipPath.length * 4 + chunkSize : chunkSize
      )
      if (offset === 0) {
        buffer.writeInt8(bipPath.length, 0);
        bipPath.forEach((segment, index) => {
          buffer.writeUInt32BE(segment, 1 + index * 4);
        });
        rawTx.copy(buffer, 1 + 4 * bipPath.length, offset, offset + chunkSize)
      } else {
        rawTx.copy(buffer, 0, offset, offset + chunkSize)
      }
      toSend.push(buffer)
      offset += chunkSize
    }
    return foreach(toSend, (data, i) =>
      this.transport
        .send(0xe0, 0x14, i === 0 ? 0x00 : 0x80, (i === toSend.length-1 ? 0x02 : 0x00) | (p2 ? 0x01 : 0x00) , data)
        .then(apduResponse => {
          response = apduResponse;
        })
    ).then(() => {
      
      const k = response.slice(0, 32).toString('hex')
      //length of signature should be 64
      const v = response.slice(32, 32 + 2).readUInt16BE(0)
      //signature
      const s = response.slice(34, 34 + v ).toString('hex')
      const l = response.slice(34 + v, 34 + v + 2).readUInt8(0);
      const h = response.slice(36 + v, 36 + v + l).toString('hex')

      return { v, k, s, l, h }
    })
  }

    /**
   * You can sign an entry or chain commit and retrieve v, k, s given the raw transaction and the BIP 32 path of the account to sign
   * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
   * @param rawMessage this is the raw data Buffer to be signed
   * @param tosha512 set this to true to has the rawMessage .
   * @example
   fct.signMessageRaw("44'/143165576'/0'/0/0", "The quick brown fox jumps over the lazy dog.").then(result => ...)
   */
  signMessageRaw(
    path: string,
    rawMessage: Buffer
  ): Promise<{
    s: string,
    v: string,
    r: string,
    h: string
  }> {
    const bipPath = BIPPath.fromString(path).toPathArray();
    let offset = 0
    let p1 = 0
    let p2 = 0
    let rawTx = rawMessage
    let toSend = []
    let response
    while (offset !== rawTx.length) {
      let maxChunkSize = offset === 0 ? 150 - 1 - bipPath.length * 4 : 150;
      let chunkSize =
        offset + maxChunkSize > rawTx.length
          ? rawTx.length - offset
          : maxChunkSize
      let buffer = new Buffer(
        offset === 0 ? 1 + bipPath.length * 4 + chunkSize : chunkSize
      )
      if (offset === 0) {
        buffer.writeInt8(bipPath.length, 0);
        bipPath.forEach((segment, index) => {
          buffer.writeUInt32BE(segment, 1 + index * 4);
        });
        rawTx.copy(buffer, 1 + 4 * bipPath.length, offset, offset + chunkSize)
      } else {
        rawTx.copy(buffer, 0, offset, offset + chunkSize)
      }
      toSend.push(buffer)
      offset += chunkSize
    }
    return foreach(toSend, (data, i) =>
      this.transport
        .send(0xe0, 0x16, i === 0 ? 0x00 : 0x80, (i === toSend.length-1 ? 0x01 : 0x00), data)
        .then(apduResponse => {
          response = apduResponse;
        })
    ).then(() => {
      
      const k = response.slice(0, 32).toString('hex')
      //length of signature should be 64
      const v = response.slice(32, 32 + 2).readUInt16BE(0)
      //signature
      const s = response.slice(34, 34 + v ).toString('hex')
      const l = response.slice(34 + v, 34 + v + 2).readUInt8(0);
      const h = response.slice(36 + v, 36 + v + l).toString('hex') 
      return { v, k, s, h }
    })
  }
  /**
   */
  getAppConfiguration(): Promise<{
    arbitraryDataEnabled: number,
    version: string
  }> {
    return this.transport.send(0xe0, 0x06, 0x00, 0x00).then(response => {
      let result = {};
      result.arbitraryDataEnabled = response[0] & 0x01;
      result.version = "" + response[1] + "." + response[2] + "." + response[3];
      return result;
    })
  }
}
