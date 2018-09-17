import Fct from '@ledgerhq/hw-app-fct'
const { Entry, validateEntryInstance, composeEntryReveal } = require( 'factom/src/entry' )
const { FactomCli } = require('factom/src/factom-cli')
const nacl = require('tweetnacl/nacl-fast').sign

const cli = new FactomCli({
            host: 'courtesy-node.factom.com',
	    port: 80,
	    path: '/v2', // Path to V2 API. Default to /v2
	    debugPath: '/debug', // Path to debug API. Default to /debug
	    user: 'paul', // RPC basic authentication
	    password: 'pwd',
	    protocol: 'http', // http or https. Default to http
	    rejectUnauthorized: true, // Set to false to allow connection to a node with a self-signed certificate
	    retry: {
              retries: 4,
              factor: 2,
              minTimeout: 500,
              maxTimeout: 2000
            }})

function composeEntryLedger(entry) {
    const buffer = Buffer.alloc(40);

    buffer.writeInt8(0);
    buffer.writeIntBE(entry.timestamp || Date.now(), 1, 6);
    entry.hash().copy(buffer, 7);
    buffer.writeInt8(entry.ecCost(), 39);

    return buffer;
}

function composeEntryCommit(entry, ecPublic, signature) {
    validateEntryInstance(entry);
    const buffer = composeEntryLedger(entry);
    return Buffer.concat([buffer, ecPublic, signature]);
}

function composeEntry(entry, ecpubkey, signature) {
    validateEntryInstance(entry);

    return {
        commit: composeEntryCommit(entry, ecpubkey, signature),
        reveal: composeEntryReveal(entry)
    };
}



export default async transport => {
  const fct = new Fct(transport);
  const ecRate = await cli.getEntryCreditRate()
  const path = "44'/132'/0'/0'/0'"
  const addr = await fct.getAddress(path)
  const fromAddr = addr['address']

  const entry = Entry.builder()
    .chainId('954d5a49fd70d9b8bcdb35d252267829957f7ef7fa6c74f88419bdc5e82209f4')
    .content('Hello Ledger')
    .build();

  const ecbuffer = composeEntryLedger(entry)

  console.log('-------------========== Entry Commit Begin ==========----------------')
  console.log(ecbuffer.toString('hex'))
  console.log('-------------========== Entry Commit End ==========----------------')

  const result = await fct.signCommit(path, ecbuffer.toString('hex'),false);

  console.log('-------------========== SIGNATURE ==========----------------')
  console.log(result)
  console.log('-------------========== SIGNATURE ==========----------------')

  const out = composeEntry(entry, Buffer.from(result['k'],'hex'), Buffer.from(result['s'],'hex'))
  console.log('-------------========== Composed Entry Begin ==========----------------')
  console.log('commit:')
  console.log(out['commit'].toString('hex'))
  console.log('reveal:')
  console.log(out['reveal'].toString('hex'))
  console.log('-------------========== Compose Entry End ==========----------------')

  return out
}
