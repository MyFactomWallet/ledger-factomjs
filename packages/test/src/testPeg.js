import Fct from '@factoid.org/hw-app-fct'
const { Transaction} = require( 'factom/src/transaction' )
const { FactomCli } = require('factom/src/factom-cli')
const nacl = require('tweetnacl/nacl-fast').sign
const assert = require('chai').assert;
const fctUtil = require('factom/src/util');

const Entry = require('factom/src/entry').Entry;

const TransactionBuilder = require('@fat-token/fat-js/0/TransactionBuilder')

let pegtransfer = Buffer.from(
"3031353838323736383434cffce0f409ebba4ed236d49d89c70e4bd1f1367d86402a3363366683265a242d7b2276657273696f6e223a312c227472616e73616374696f6e73223a5b7b22696e707574223a7b2261646472657373223a22464132326465354e534732464132486d4d61443468387153415a414a797a746d6d6e77674c50676843514b6f53656b7759596374222c22616d6f756e74223a3135302c2274797065223a2270464354227d2c227472616e7366657273223a5b7b2261646472657373223a2246413361454370773367455a37434d5176524e7845744b42474b416f73333932326f71594c634851394e7158487564433659424d222c22616d6f756e74223a3135307d5d7d5d7d",'hex')
let pegconversion = Buffer.from( "3031353838323833343935cffce0f409ebba4ed236d49d89c70e4bd1f1367d86402a3363366683265a242d7b2276657273696f6e223a312c227472616e73616374696f6e73223a5b7b22696e707574223a7b2261646472657373223a22464132326465354e534732464132486d4d61443468387153415a414a797a746d6d6e77674c50676843514b6f53656b7759596374222c22616d6f756e74223a3135302c2274797065223a2270464354227d2c22636f6e76657273696f6e223a22504547227d5d7d",'hex')

export default async transport => {
  const fct = new Fct(transport);
  const amount = 150
  const path = "44'/131'/0'/0/0"
  const addr = await fct.getAddress(path)
  const fromAddr = addr.address
  const publicKey = Buffer.from(addr.publicKey,'hex')
  
  console.log("=============ADDRESS==============");
  console.log(addr.address)
  console.log("==================================");
  
  console.log(pegtransfer.toString());
  
  const toAddr = 'FA3nr5r54AKBZ9SLABS3JyRoGcWMVMTkePW9MECKM8shMg2pMagn'
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
  let extsig = await fct.signFatTransaction(path, 2, pegtransfer)//tx.getMarshalDataSig(0))

  //let txgood = new TransactionBuilder(tx)
  //  .pkSignature(extsig.publicKey, Buffer.from(extsig.signature,'hex') )
  //  .build()

  let testhash = fctUtil.sha512(pegtransfer);//tx.getMarshalDataSig(0))
  console.log("hash")
  console.log(extsig.hash)
  console.log(testhash.toString('hex'))
  console.log(publicKey)
  
  assert.isTrue(nacl.detached.verify(Buffer.from(extsig.hash,'hex'), Buffer.from(extsig.signature,'hex'), publicKey)) 
  assert.isTrue(testhash.toString('hex') === extsig.hash)

  //console.log(txgood)
  
  extsig = await fct.signFatTransaction(path, 2, pegconversion)//tx.getMarshalDataSig(0))

  //let txgood = new TransactionBuilder(tx)
  //  .pkSignature(extsig.publicKey, Buffer.from(extsig.signature,'hex') )
  //  .build()

  testhash = fctUtil.sha512(pegconversion);//tx.getMarshalDataSig(0))
  console.log("hash")
  console.log(extsig.hash)
  console.log(testhash.toString('hex'))
  console.log(publicKey)
  
  assert.isTrue(nacl.detached.verify(Buffer.from(extsig.hash,'hex'), Buffer.from(extsig.signature,'hex'), publicKey))
  assert.isTrue(testhash.toString('hex') === extsig.hash)
  

  return extsig
}
