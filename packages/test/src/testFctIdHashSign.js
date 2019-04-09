import Fct from '@factoid.org/hw-app-fct'
import sha512 from 'js-sha512'
import sha256 from 'js-sha256'
const { Entry, validateEntryInstance, composeEntry, composeEntryLedger } = require( 'factom/src/entry' )

export default async transport => {
  const fct = new Fct(transport);
  const path = "44'/281'/0'/0/0"

  const ecBuffer = Buffer.fromString('The quick brown fox jumps over the lazy dog');
  
  console.log('========== Entry Commit Ledger Begin ==========')
  console.log(ecbuffer.toString('hex'))
  console.log('========== Entry Commit Ledger End ==========')
//sha256
  let result = await fct.signMessageHash(path, ecbuffer.toString('hex'), false)
  if ( result['h'] != sha256.hex(ecbuffer.toString()) ) {
     console.log("SHA256 Hash is invalid!!!")
     throw("Invalid hash from device")
  } else {
     console.log("Hash from device is valid!!!")
  }
  if(nacl.detached.verify(result['h'], result['s'], result['k'])) {
       console.log("Transaction Signature is valid!!!")
    } else {
       console.log("Transaction Signature is NOT valid!!!")
       throw("Invalid Identity Signature")
    }




  console.log('========== Signed Hash ==========')
  console.log(result)
  console.log('==========-------------==========')

  //sha512
  result = await fct.signMessageHash(path, ecbuffer.toString('hex'), true)
  if ( result['h'] != sha512.hex(ecbuffer.toString()) ) {
     console.log("SHA512 Hash is invalid!!!")
     throw("Invalid hash from device")
  } else {
     console.log("Hash from device is valid!!!")
  }
  if(nacl.detached.verify(result['h'], result['s'], result['k'])) {
     console.log("Transaction Signature is valid!!!")
  } else {
     console.log("Transaction Signature is NOT valid!!!")
     throw("Invalid Identity Signature")
  }


  return out
}
