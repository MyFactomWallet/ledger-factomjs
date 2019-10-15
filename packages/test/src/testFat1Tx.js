import Fct from '@factoid.org/hw-app-fct'
const { Transaction} = require( 'factom/src/transaction' )
const { FactomCli } = require('factom/src/factom-cli')
const nacl = require('tweetnacl/nacl-fast').sign
const assert = require('chai').assert;
const fctUtil = require('factom/src/util');

const Entry = require('factom/src/entry').Entry;

const TransactionBuilder = require('@fat-token/fat-js/1/TransactionBuilder')

const testTokenChainId = '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762'

export default async transport => {
  const fct = new Fct(transport);
  const amount = 150
  const path = "44'/131'/0'/0/0"
  const addr = await fct.getAddress(path)
  const fromAddr = addr.address
  const publicKey = Buffer.from(addr.publicKey,'hex')

  const toAddr = 'FA3nr5r54AKBZ9SLABS3JyRoGcWMVMTkePW9MECKM8shMg2pMagn'

  //test metadata
  const meta = {type: 'fat-js test run', timestamp: new Date().getTime()};

  let tx = new TransactionBuilder(testTokenChainId)
            .input(fromAddr, [10])
            .output(toAddr, [10])
            .metadata(meta)
            .build();


  console.log(tx._content)
  console.log("CONTENT TRANSACTION")
  console.log(Buffer.from(tx._content).toString('hex'))
  console.log("BEGIN WHOLE TRANSACTION")
  console.log(tx.getMarshalDataSig(0).toString('hex'))
  console.log("END WHOLE TRANSACTION")
  let extsig = await fct.signFatTransaction(path, 1, tx.getMarshalDataSig(0))

  let txgood = new TransactionBuilder(tx)
    .pkSignature(extsig.publicKey, Buffer.from(extsig.signature,'hex') )
    .build()

  let testhash = fctUtil.sha512(tx.getMarshalDataSig(0))
  console.log("hash")
  console.log(extsig.hash)
  console.log(testhash.toString('hex'))
  assert.isTrue(txgood.validateSignatures())
  assert.isTrue(testhash.toString('hex') === extsig.hash)

  console.log(txgood)

  return extsig
}
