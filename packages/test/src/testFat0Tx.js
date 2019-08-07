import Fct from '@factoid.org/hw-app-fct'
const { Transaction} = require( 'factom/src/transaction' )
const { FactomCli } = require('factom/src/factom-cli')
const nacl = require('tweetnacl/nacl-fast').sign

const Entry = require('factom/src/entry').Entry;

const TransactionBuilder = require('@fat-token/fat-js/0/TransactionBuilder')

const testTokenChainId = '888888d027c59579fc47a6fc6c4a5c0409c7c39bc38a86cb5fc0069978493762'

export default async transport => {
  const fct = new Fct(transport);
  const amount = 150
  const path = "44'/131'/0'/0/0"
  const addr = await fct.getAddress(path)
  const publicKey = Buffer.from(addr.publicKey,'hex')

  const toAddr = 'FA3nr5r54AKBZ9SLABS3JyRoGcWMVMTkePW9MECKM8shMg2pMagn'

  let tx = new TransactionBuilder(testTokenChainId)
    .input(publicKey, amount)
    .output(toAddr, amount)
    .build()

  let extsig = await fct.signFatTransaction(path, 0, tx.getMarshalDataSig(0).toString('hex'))

  let txgood = new TransactionBuilder(tx)
    .pkSignature(publicKey, Buffer.from(extsig['s'],'hex') )
    .build()

  txgood.validateSignatures()

  console.log(txgood)

  return result
}
