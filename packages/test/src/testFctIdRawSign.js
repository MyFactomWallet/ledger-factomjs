import Fct from '@factoid.org/hw-app-fct'
const { Entry, validateEntryInstance, composeEntry, composeEntryLedger } = require( 'factom/src/entry' )
const nacl = require('tweetnacl/nacl-fast').sign

export default async transport => {
  const fct = new Fct(transport);
  const path = "44'/281'/0'/0/0"

  const ecBuffer = Buffer.from('The quick brown fox jumps over the lazy dog');
  
  //sign the raw message using identity key
  let result = await fct.signMessageRaw(path, ecBuffer)

  if(nacl.detached.verify(ecBuffer, Buffer.from(result['s'],'hex'), Buffer.from(result['k'],'hex'))) {
       console.log("Transaction Signature is valid!!!")
    } else {
       console.log("Transaction Signature is NOT valid!!!")
       throw("Invalid Identity Signature")
    }

  return result
}
