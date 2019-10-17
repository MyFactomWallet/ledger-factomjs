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
      ["getAddress", "signTransaction", "signCommit", "signMessageRaw", "signMessageHash", "signFatTransaction", "storeChainId", "getAppConfiguration"],
      "TFA"
    );
  }

  /**
   * get Factom address for a given BIP 32 path.
   * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
   * @option boolDisplay if true, optionally display the address on the device 
   * @return an object with a publicKey and address with optional chainCode and chainid
   * @example
   * const fctaddr = await fct.getAddress("44'/131'/0'/0/0")
   * const ecaddr = await fct.getAddress("44'/132'/0'/0/0")
   * const idaddr = await fct.getAddress("44'/281'/0'/0/0")
   */
  
  getAddress(
    path: string,
    boolDisplay?: boolean,
    boolChainCode?: boolean
  ): Promise<{
    publicKey: string,
    address: string,
    chaincode: string,
    chainid : string
  }> {
    const bipPath = BIPPath.fromString(path).toPathArray();

    let buffer = new Buffer.alloc(1 + bipPath.length * 4);
    const boolIdAddr = (bipPath[1] === 0x80000119)
    
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
        let chainidstart = 0
        result.chaincode = ""
        result.chainid = ""
        
        if ( boolChainCode || false ) {
          result.chaincode = response
            .slice(
              1 + publicKeyLength + 1 + addressLength,
              1 + publicKeyLength + 1 + addressLength + 32
            ).toString("hex")
          chainidstart = 32
        } 
        
        if (boolIdAddr) {
           result.chainid = response.
             slice( 1 + publicKeyLength + 1 + addressLength + chainidstart,
                    1 + publicKeyLength + 1 + addressLength + chainidstart + 32 ).
             toString("hex")
        }
        
        return result
      });
  }

  /**
   * You can sign a transaction and retrieve v, r, s given the raw transaction and the BIP 32 path of the account to sign
   * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
   * @param rawTxHex The raw fct transaction request
   * @example
   const result = await fct.signTransaction("44'/131'/0'/0/0", "02016253dfaa7301010087db406ff65cb9dd72a1e99bcd51da5e03b0ccafc237dbf1318a8d7438e22371c892d6868d20f02894db071e2eb38fdc56c697caaeba7dc19bddae2c6e7084cc3120d667b49f")
   */
  signTransaction(
    path: string,
    rawTxHex: string /*change to tx: Transation */
  ): Promise<{
    v: string,
    r: string,
    s: string
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
      const rcdType = response.slice(0, 1).toString('hex')
      const publicKey = response.slice(1, 33).toString('hex')

      //length of signature should be 64
      const v = response.slice(33, 33 + 2).readUInt16BE(0)
      //signature
      const s = response.slice(35, 35 + v ).toString('hex')
      let signature = s
      return { v, r, s, rcdType, publicKey, signature }
    });
  }

  /**
   * You can sign an entry or chain commit and retrieve publicKey(k) and signature(s) given the raw transaction and the BIP 32 path of the account to sign
   * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
   * @param rawTxHex this is the ledger for a entry or chain commit
   * @param ischaincommit set this to true if the rawTxHex is a chain commit ledger.
   * @example
   fct.signCommit("44'/132'/0'/0/0", "00016227acddfe57cf6740c4f30ae39d71f75710fb4ea9c843d5c01755329a42ccab52034e1f7901d5b8efdb52a15c4007d341eb1193903a021ed7aaa9a3cf4234c32ef8a213de00",false).then(result => ...)
   */
  signCommit(
    path: string,
    rawTxHex: string, 
    ischaincommit?: boolean
  ): Promise<{
    k: string,
    s: string
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
      let publicKey = k
      let signature = s
      return { k, s, publicKey, signature }
    })
  }

 /**
   * You can sign an arbitrary message and retrieve v, k, s given the raw transaction and the BIP 32 path of the account to sign
   * The message will be automatically hashed by the device using either sha256 (default) or sha512 if tosha512 is set to true.
   * If coin types 131 or 132 are used "FCT Signed Message\n" or "EC Signed Message\n" is prepended to the message inside the ledger
   * prior to the device hashing then signing the hash.  If the identity coin type 281 is used, then the message is directly hashed
   * then signed by the ledger.
   * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
   * @param rawMessage this is the raw data Buffer to be signed
   * @param tosha512 set this to true to hash the rawMessage using sha512, the default (or false) is sha256.
   * @example
   fct.signMessageHash("44'/281'/0'/0/0", "The quick brown fox jumps over the lazy dog.",true).then(result => ...)
   */
  signMessageHash(
    path: string,
    rawMessage: Buffer, 
    tosha512?: boolean
  ): Promise<{
    k: string,
    s: string,
    h: string
  }> {
    const bipPath = BIPPath.fromString(path).toPathArray();
    let offset = 0
    let p1 = 0
    let p2 = tosha512 || 0
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
      //hash
      const h = response.slice(36 + v, 36 + v + l).toString('hex')

      let publicKey = k
      let signature = s
      let hash = h
      return { k, s, h, publicKey, signature, hash }
    })
  }

  /**
   * You can sign an entry or chain commit and retrieve v, k, s given the raw transaction and the BIP 32 path of the account to sign
   * @param path a path in BIP 32 format (note: all paths muth be hardened (e.g. .../0'/0' )
   * @param rawTxHex this is the ledger for a entry or chain commit
   * @param ischaincommit set this to true if the rawTxHex is a chain commit ledger.
   * @example
   fct.storeChainId("44'/132'/0'/0'/0", "00016227acddfe57cf6740c4f30ae39d71f75710fb4ea9c843d5c01755329a42ccab52034e1f7901d5b8efdb52a15c4007d341eb1193903a021ed7aaa9a3cf4234c32ef8a213de00",false).then(result => ...)
   */

  storeChainId(
    chainIdHex: string
  ): Promise<{
  }> {
    let p1 = 0
    let p2 = 0
    let rawTx = new Buffer(chainIdHex, "hex")
    let toSend = []
    let response

    toSend.push(rawTx)
      
    return foreach(toSend, (data, i) =>
      this.transport
        .send(0xe0, 0x18, p1, p2 , data)
        .then(apduResponse => {
          response = apduResponse;
        })
    ).then(() => {
      return { }
    })
  }

    /**
   * This function will sign a raw message using the identity coin type only.  Attempts to sign with FCT or EC addresses will
   * be rejected by the device.
   * @param path a path in BIP 32 format 
   * @param rawMessage this is the raw data Buffer to be signed
   * @example
   fct.signMessageRaw("44'/281'/0'/0/0", "The quick brown fox jumps over the lazy dog.").then(result => ...)
   */
  signMessageRaw(
    path: string,
    rawMessage: Buffer
  ): Promise<{
    s: string,
    v: string,
    r: string
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
      //const l = response.slice(34 + v, 34 + v + 2).readUInt8(0);
      //const h = response.slice(36 + v, 36 + v + l).toString('hex') 
      let publicKey = k
      let signature = s
      return { v, k, s, publicKey, signature }
    })
  }

      
    /**
   * This function will sign a FAT 0 or 1 transaction using the Factoid Address.  
   * @param path a path in BIP 32 format 
   * @param fattype FAT protocol transaction type index 0: FAT-0, 1: FAT-1
   * @param fattxraw this is the raw data fat transaction to be hashed then signed by device, Buffer.concat([index, timestamp, chainId, content])
   * @example
   fct.signFatTransaction("44'/131'/0'/0/0", "The quick brown fox jumps over the lazy dog.").then(result => ...)
   */
  signFatTransaction(
    path: string,
    fattype: number,
    fattxbuffer : Buffer
  ): Promise<{
    s: string,
    v: string,
    r: string
  }> {
    const bipPath = BIPPath.fromString(path).toPathArray();
    let offset = 0
    let p1 = 0
    let p2 = fattype
    if ( p2 > 255 || p2 < 0 ) {
        throw new Error("Invalid Transaction Type: FAT Transaction Type must be < 256 and >= 0")
    }
    let rawTx = fattxbuffer
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
        .send(0xe0, 0x20, i === 0 ? 0x00 : (i === toSend.length-1 ? 0x81 : 0x80), p2, data)
        .then(apduResponse => {
          response = apduResponse;
        })
    ).then(() => {
      
      //const k = response.slice(0, 32).toString('hex')
      //length of signature should be 64
      //const v = response.slice(32, 32 + 2).readUInt16BE(0)
      //signature
      //const s = response.slice(34, 34 + v ).toString('hex')
      //const l = response.slice(34 + v, 34 + v + 2).readUInt8(0);
      //hash

      
      const rcdType = response.slice(0, 1).toString('hex')
      const publicKey = response.slice(1, 33).toString('hex')
      //length of signature should be 64
      const v = response.slice(33, 33 + 2).readUInt16BE(0)
      //signature
      const signature = response.slice(35, 35 + v ).toString('hex')
      
      //hash
      //const l = response.slice(34 + v, 34 + v + 2).readUInt8(0);
      //const l = response.slice(36, 36 + v).readUInt16BE(0)
      const hash = response.slice(35 + v, 35 + v + 64 ).toString('hex')
      return { rcdType, publicKey, signature, hash }
      
      
      //return { k, s, h }
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
