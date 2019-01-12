import Fct from '@factoid.org/hw-app-fct'

const { Entry, validateEntryInstance, composeEntry, composeEntryLedger } = require( 'factom/src/entry' )

export default async transport => {
  const fct = new Fct(transport);
  const path = "44'/143165576'/0'/0/0"

  const ecBuffer = Buffer.fromString('The quick brown fox jumps over the lazy dog');
  
  console.log('========== Entry Commit Ledger Begin ==========')
  console.log(ecbuffer.toString('hex'))
  console.log('========== Entry Commit Ledger End ==========')

  //sha256
  let result = await fct.signMessageHash(path, ecbuffer.toString('hex'), false)

  console.log('========== Signed Hash ==========')
  console.log(result)
  console.log('==========-------------==========')

  //sha512
  result = await fct.signMessageHash(path, ecbuffer.toString('hex'), true)

  return out
}
