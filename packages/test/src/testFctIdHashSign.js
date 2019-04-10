import Fct from '@factoid.org/hw-app-fct'
import sha512 from 'js-sha512'
import sha256 from 'js-sha256'
const { Entry, validateEntryInstance, composeEntry, composeEntryLedger } = require( 'factom/src/entry' )
const nacl = require('tweetnacl/nacl-fast').sign

export default async transport => {
  const fct = new Fct(transport);
  const path = "44'/281'/0'/0/0"

  const ecBuffer = Buffer.from('The quick brown fox jumps over the lazy dog');
  
  //sign a sha256 of message using identity key
  let result = await fct.signMessageHash(path, ecBuffer, false)

  if(nacl.detached.verify(Buffer.from(sha256.hex(ecBuffer),'hex'), Buffer.from(result['s'],'hex'), Buffer.from(result['k'],'hex'))) {
       console.log("Transaction Signature is valid!!!")
    } else {
       console.log("Transaction Signature is NOT valid!!!")
       throw("Invalid Identity Signature")
    }



  //sign a sha512 of message using identity key
  result = await fct.signMessageHash(path, ecBuffer, true)

  if(nacl.detached.verify(Buffer.from(sha512.hex(ecBuffer),'hex'), Buffer.from(result['s'],'hex'), Buffer.from(result['k'],'hex'))) {
     console.log("Transaction Signature is valid!!!")
  } else {
     console.log("Transaction Signature is NOT valid!!!")
     throw("Invalid Identity Signature")
  }


  return result
}
